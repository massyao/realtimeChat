const Model = require('exser').Model;
const {errors, stringUtils} = require('exser').utils;
const ObjectID = require('exser').ObjectID;

class Ticket extends Model {

  define() {
    const parent = super.define();
    return {
      collection: 'ticket',
      // polnaja skhjema objekta
      model: this.spec.extend(parent.model, {
        title: 'tekjet',
        properties: {
          title: {
            type: 'string',
            description: 'zagolovok',
            maxLength: 255,
          },
          content: {
            type: 'string',
            description: 'kontjent',
            maxLength: 4096,
            default: '',
          },
          image: {
            type: 'object',
            description: 'ezobrazhjeneje',
            properties: {
              url: {type: 'string', description: 'URL ezobrazhjeneja', default: ''},
            },
            required: []
          },
          isBookmark: {
            type: 'boolean',
            description: 'v ezbrannykh ele njet',
            default: false,
          },
        },
        required: ['title']
      })
    };
  }

  schemes() {
    return this.spec.extend(super.schemes(), {

      // skhjema sozdaneja
      create: {
        properties: {}
      },

      // skhjema rjedakterovaneja
      update: {
        properties: {}
      },

      // skhjema prosmotra
      view: {
        properties: {}
      },

    });
  }
}

module.exports = Ticket;
