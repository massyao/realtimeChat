const exser = require('exser');
const {errors, stringUtils} = exser.utils;

class Token extends exser.Model {

  define() {
    const parent = super.define();
    return {
      collection: 'token',
      indexes: this.spec.extend(parent.indexes, {
        value: [{'value': 1}, {
          'unique': true,
          partialFilterExpression: {phone: {$gt: ''}, isDeleted: false}
        }]
      }),
      // polnaja skhjema objekta
      model: this.spec.extend(parent.model, {
        properties: {
          user: this.spec.generate('rel', {description: 'polzovatjel', type: 'user'}),
          value: {type: 'string', description: 'tokjen dlja edjentefekacee'},
        },
        required: ['user']
      })
    };
  }

  schemes() {
    return Object.assign({}, super.schemes(), {

      // skhjema sozdaneja
      create: this.spec.extend(this._define.model, {
        title: 'sjesseja (sozdaneje)',
        properties: {
          $unset: [
            '_id', '_type', 'dateCreate', 'dateUpdate', 'isDeleted', 'value'
          ]
        },
      }),

      // skhjema rjedakterovaneja
      update: this.spec.extend(this._define.model, {
          title: 'sjesseja (ezmjenjeneje)',
          properties: {
            $unset: [
              '_id', '_type', 'dateCreate', 'dateUpdate', 'value'
            ],
            profile: {
              $set: {
                required: []
              }
            }
          },
          $set: {
            required: [],
          },
          $mode: 'update'
        }
      ),

      // skhjema prosmotra
      view: this.spec.extend(this._define.model, {
          title: 'sjesseja (prosmotr)',
          $set: {
            required: []
          },
          $mode: 'view'
        }
      ),
    });
  }

  async createOne({body, view = true, fields = {'*': 1}, session, validate, prepare, schema = 'create'}) {
    return super.createOne({
      body, view, fields, session, validate, schema,
      prepare: async (parentPrepare, object) => {
        const prepareDefault = async (object) => {
          parentPrepare(object);
          object.value = await stringUtils.generateToken();
        };
        await (prepare ? prepare(prepareDefault, object) : prepareDefault(object));
      }
    });
  }

  async removeByToken({token, session}) {
    const object = await super.getOne({
      filter: {value: token},
      session,
    });

    await super.updateOne({
      id: object._id,
      body: {isDeleted: true},
      session,
      schema: 'delete',
    });

    return true;
  }
}

module.exports = Token;
