const Model = require('exser').Model;
const {errors, stringUtils} = require('exser').utils;
const ObjectID = require('exser').ObjectID;

class Ticket extends Model {

  define() {
    const parent = super.define();
    return {
      collection: 'ticket',
      model: this.spec.extend(parent.model, {
        title: 'ticket',
        properties: {
          title: {
            type: 'string',
            description: 'ticket',
            maxLength: 255,
          },
          content: {
            type: 'string',
            description: 'content',
            maxLength: 4096,
            default: '',
          },
          image: {
            type: 'object',
            description: 'image',
            properties: {
              url: {type: 'string', description: 'URL ', default: ''},
            },
            required: []
          },
          isBookmark: {
            type: 'boolean',
            description: 'bookmark',
            default: false,
          },
        },
        required: ['title']
      })
    };
  }

  schemes() {
    return this.spec.extend(super.schemes(), {

      create: {
        properties: {}
      },

      update: {
        properties: {}
      },

      view: {
        properties: {}
      },

    });
  }
}

module.exports = Ticket;
