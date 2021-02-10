const Model = require('exser').Model;
const {errors, stringUtils} = require('exser').utils;
const moment = require('moment');
const ObjectID = require('exser').ObjectID;

class User extends Model {

  constructor() {
    super();
    this.status = {
      REJECT: 'reject',
      NEW: 'new',
      CONFIRM: 'confirm',
    };
  }

  async init(config, services) {
    await super.init(config, services);
    this.mail = await this.services.getMail();
    return this;
  }

  define() {
    const parent = super.define();
    return {
      collection: 'user',
      indexes: this.spec.extend(parent.indexes, {
        email: [{'email': 1}, {
          'unique': true,
          partialFilterExpression: {email: {$gt: ''}, isDeleted: false}
        }]
      }),

      model: this.spec.extend(parent.model, {
        title: 'title',
        properties: {
          email: {
            type: 'string',
            //format: 'email',
            maxLength: 100,
            errors: {format: 'Incorrect format'}
          },
          username: {
            type: 'string',
            //format: 'email',
            maxLength: 100,
          },
          password: {type: 'string', minLength: 6, errors: {minLength: 'At least 6 characters'}},
          role: this.spec.generate('rel', {
            description: 'rol',
            type: 'role',
            copy: 'name'
          }),
          profile: {
            type: 'object',
            description: 'svojjstva profelja',
            properties: {
              name: {type: 'string', maxLength: 100, description: '11', default: ''},
              surname: {type: 'string', maxLength: 100, description: '22', default: ''},
              middlename: {type: 'string', maxLength: 100, description: '333', default: ''},
              avatar: this.spec.generate('rel', {
                description: 'avatarka',
                type: 'file',
                default: {}
              }),
              phone: {
                type: 'string',
                anyOf: [{pattern: '^\\+[0-9]{11,20}$'}, {const: ''}],
                example: '+86-13111223344',
                errors: {pattern: 'Incorrect format'},
                default: ''
              },
              birthday: {
                type: 'string',
                anyOf: [{format: 'date-time'}, {const: ''}],
                description: 'data',
                default: ''
              }
            },
            required: []
          },
        },
        required: ['email', 'profile']
      })
    };
  }

  schemes() {
    return this.spec.extend(super.schemes(), {
      create: {
        properties: {}
      },

      update: {
        properties: {
          profile: {
            $set: {
              required: []
            }
          }
        }
      },

      view: {
        properties: {
          $unset: [
            'password'
          ]
        }
      },

      signIn: {
        title: `${this._define.model.title}. title`,
        type: 'object',
        properties: {
          login: {
            type: 'string',
            description: 'Email',
            example: 'test@example.com'
          },
          password: {type: 'string', example: '123456'},
          remember: {type: 'boolean', description: 'test'}
        },
        required: ['login', 'password'],
        additionalProperties: false
      },

      restore: {
        title: `${this._define.model.title}. title`,
        type: 'object',
        properties: {
          login: {
            type: 'string', format: 'email',
            description: 'Email ', example: 'user@example.com'
          },
        },
        required: ['login'],
        additionalProperties: false
      },

      changePassword: {
        title: `${this._define.model.title}. title`,
        type: 'object',
        properties: {
          oldPassword: {
            type: 'string',
            description: ' test'
          },
          newPassword: {
            type: 'string',
            minLength: 6,
            description: 'test '
          }
        },
        required: ['oldPassword', 'newPassword'],
        additionalProperties: false
      }
    });
  }

  async createOne({body, view = true, fields = {'*': 1}, session, validate, prepare, schema = 'create'}) {
    let password = '';
    return await super.createOne({
      body, view, fields, session, validate, schema,
      prepare: async (parentPrepare, object) => {
        const prepareDefault = (object) => {
          parentPrepare(object);
          object.email = object.email ? object.email.toLowerCase() : '';

          if (!object.password) {
            object.password = stringUtils.random(
              this.config.password.length, this.config.password.chars
            );
          }
          password = object.password;
          object.password = stringUtils.hash(object.password);
        };
        await (prepare ? prepare(prepareDefault, object) : prepareDefault(object));
        this.notifyReg(object, password);
      }
    });
  }

  async updateOne({id, body, view = true, validate, prepare, fields = {'*': 1}, session}) {
    return super.updateOne({
      id, body, view, fields, session, validate,
      prepare: async (parentPrepare, object) => {
        const prepareDefault = (object) => {
          parentPrepare(object);
          if ('password' in object) {
            object.password = stringUtils.hash(object.password);
          }
        };
        await (prepare ? prepare(prepareDefault, object) : prepareDefault(object));
      }
    });
  }

  /**
   * @param id
   * @param body
   * @param session
   * @param fields
   * @returns {Promise.<boolean>}
   */
  async changePassword({id, body, session, fields = {'*': 1}}) {
    if (!session.user || id !== session.user._id) {
      throw new errors.Forbidden({});
    }
    await this.validate('changePassword', body, session);

    const user = await this.native.findOne({
      _id: new ObjectID(id)
    });

    if (body.oldPassword === body.newPassword) {
      throw new errors.Validation({
        path: ['password'],
        rule: 'equal',
        accept: false,
        message: 'New and old passwords cannot equal'
      });
    }

    if (user.password !== stringUtils.hash(body.oldPassword)) {
      throw new errors.Validation({
        path: ['oldPassword'],
        rule: 'incorrect',
        accept: true,
        message: 'Old passwords was incorrect'
      });
    }
    await this.updateOne({id, body: {password: body.newPassword}, session, fields});
    return true;
  }

  /**
   * @param body
   * @param fields
   * @param session
   * @param fields
   * @returns {Promise.<{user: *, token: *}>}
   */
  async signIn({body, session, fields = {'*': 1}}) {
    const form = await this.validate('signIn', body, session);
    let enterReport = false;
    let passwordHash = stringUtils.hash(form.password);
    let user = await this.native.findOne({
      $and: [
        {$or: [{email: form.login}, {username: form.login}]},
        {$or: [{password: passwordHash}, {newPassword: passwordHash}]}
      ]
    });

    if (!user) {
      throw new errors.Validation([
        {path: [], rule: 'find', accept: true, message: 'Wrong login or password'}
      ]);
    }

    if (!this.canAuth(user)) {
      throw new errors.Forbidden({}, 'User is not confirmed or is blocked', '001');
    }

    if (!enterReport && user.newPassword !== passwordHash) {
      await this.native.updateOne({_id: user._id}, {
        $set: {
          password: passwordHash
        }
      });
    }

    /** @type Token */
    const tokenStorage = this.storage.get('token');
    const token = await tokenStorage.createOne({
      body: {
        user: {_id: user._id.toString(), _type: user._type}
      }
    });
    return {
      user: await this.view(user, {fields, session}),
      token: token.value
    };
  }

  /**
   * @param session
   * @returns {Promise.<boolean>}
   */
  async signOut({session}) {
    if (session.token && session.token !== 'null') {
      /** @type Token */
      const tokenStorage = await this.storage.get('token');
      await tokenStorage.removeByToken({token: session.token, session});
    }
    return true;
  }

  /**
   * @param token
   * @param fields
   * @returns {Promise.<*>}
   */
  async auth({token, fields = {'*': 1}}) {
    let result = false;
    if (token && token !== 'null') {
      /** @type Token */
      const tokenStorage = await this.storage.get('token');
      result = await tokenStorage.getOne({
        filter: {
          value: token,
          isDeleted: false,
          // dateCreate: {
          //   $gte: moment().subtract(1, 'month').toDate()
          // }
        },
        fields,
        throwNotFound: false
      });
    }
    return result;
  }

  /**
   * zapros parolja
   * @param body
   * @param session
   * @returns {Promise.<boolean>}
   */
  async restore({body, session}) {
    let form = await this.validate('restore', body, session);

    let user = await this.native.findOne({email: form.login});
    if (!user) {
      throw new errors.NotFound({}, 'User not found');
    }
    let password = stringUtils.random(this.config.password.length, this.config.password.chars);
    await this.native.updateOne({_id: user._id}, {
      $set: {
        newPassword: stringUtils.hash(password)
      }
    });
    this.mail.transport.sendMail({
      to: user.email,
      subject: 'aa',
      text: `password: ${password}\n\n` +
        `${this.config.authUrl}`
    });
    return true;
  }

  /**
   * @param user
   * @returns {boolean}
   */
  canAuth(user/*, token*/) {
    return true;
  }

  notifyReg(user, password) {
    if (user.email && process.env.NODE_ENV !== 'test') {
      this.mail.transport.sendMail({
        to: user.email,
        subject: 'subject',
        text: `dear ${user.profile.name} ${user.profile.surname}!\n\n` +
          `blabla ${this.config.authUrl}\n\n` +
          `login: ${user.email}\n\n` +
          `passwor: ${password}\n\n`
      });
    }
  }
}

module.exports = User;
