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
      // Полная схема объекта
      model: this.spec.extend(parent.model, {
        properties: {
          user: this.spec.generate('rel', {description: 'Пользователь', type: 'user'}),
          value: {type: 'string', description: 'Токен для идентификации'},
        },
        required: ['user']
      })
    };
  }

  schemes() {
    return Object.assign({}, super.schemes(), {

      // Схема создания
      create: this.spec.extend(this._define.model, {
        title: 'Сессия (создание)',
        properties: {
          $unset: [
            '_id', '_type', 'dateCreate', 'dateUpdate', 'isDeleted', 'value'
          ]
        },
      }),

      // Схема редактирования
      update: this.spec.extend(this._define.model, {
          title: 'Сессия (изменение)',
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

      // Схема просмотра
      view: this.spec.extend(this._define.model, {
          title: 'Сессия (просмотр)',
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
