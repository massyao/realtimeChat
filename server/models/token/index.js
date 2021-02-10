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

      model: this.spec.extend(parent.model, {
        properties: {
          user: this.spec.generate('rel', {description: 'user', type: 'user'}),
          value: {type: 'string', description: 'token'},
        },
        required: ['user']
      })
    };
  }

  schemes() {
    return Object.assign({}, super.schemes(), {

      create: this.spec.extend(this._define.model, {
        title: 'model',
        properties: {
          $unset: [
            '_id', '_type', 'dateCreate', 'dateUpdate', 'isDeleted', 'value'
          ]
        },
      }),

      update: this.spec.extend(this._define.model, {
          title: 'title',
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

      view: this.spec.extend(this._define.model, {
          title: 'title',
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
