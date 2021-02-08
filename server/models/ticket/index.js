const Model = require('exser').Model;
const {errors, stringUtils} = require('exser').utils;
const ObjectID = require('exser').ObjectID;

class Ticket extends Model {

  define() {
    const parent = super.define();
    return {
      collection: 'ticket',
      // Полная схема объекта
      model: this.spec.extend(parent.model, {
        title: 'Тикет',
        properties: {
          title: {
            type: 'string',
            description: 'Заголовок',
            maxLength: 255,
          },
          content: {
            type: 'string',
            description: 'Контент',
            maxLength: 4096,
            default: '',
          },
          image: {
            type: 'object',
            description: 'Изображение',
            properties: {
              url: {type: 'string', description: 'URL изображения', default: ''},
            },
            required: []
          },
          isBookmark: {
            type: 'boolean',
            description: 'В избранных или нет',
            default: false,
          },
        },
        required: ['title']
      })
    };
  }

  schemes() {
    return this.spec.extend(super.schemes(), {

      // Схема создания
      create: {
        properties: {}
      },

      // Схема редактирования
      update: {
        properties: {}
      },

      // Схема просмотра
      view: {
        properties: {}
      },

    });
  }
}

module.exports = Ticket;
