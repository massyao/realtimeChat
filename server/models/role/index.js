const Model = require('exser').Model;

class Role extends Model {

  define() {
    const parent = super.define();
    return {
      collection: 'role',
      indexes: this.spec.extend(parent.indexes, {
        //relativeId: [{'relative._id': 1}],
      }),
      model: this.spec.extend(parent.model, {
        title: 'rol',
        properties: {
          name: {type: 'string', description: 'role', minLength: 2, maxLength: 200},
          title: this.spec.generate('i18n', {description: 'international', minLength: 2, maxLength: 200}),
          description: this.spec.generate('i18n', {description: 'aaa', default: '', maxLength: 100}),
          priceClient: {type: 'number', description: 'number', default: 1200}
        },
        required: ['name', 'title'],
      })
    };
  }

  schemes() {
    return this.spec.extend(super.schemes(), {

      create: {
        properties: {
          $unset: []
        },
      },

      update: {
        properties: {
          $unset: [],
        }
      },

      view: {
        properties: {
          $unset: []
        }
      },
    });
  }
}

module.exports = Role;
