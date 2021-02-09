const {queryUtils, errors} = require('exser').utils;
const sleep = require('../../utils/sleep');

module.exports = async (router, services) => {

  const spec = await services.getSpec();
  const storage = await services.getStorage();
  /** @type {Ticket} */
  const tickets = storage.get('ticket');

  router.post('/tickets', {
    operationId: 'tickets.create',
    summary: 'sozdaneje',
    description: 'sozdaneje tekjeta',
    session: spec.generate('session.user', ['user']),
    tags: ['Tickets'],
    requestBody: {
      content: {
        'application/json': {schema: {$ref: '#/components/schemas/ticket.create'}}
      }
    },
    parameters: [
      {
        in: 'query',
        name: 'fields',
        description: 'vyberajemyje polja',
        schema: {type: 'string'},
        example: '*'
      }
    ],
    responses: {
      200: spec.generate('success', {$ref: '#/components/schemas/ticket.view'})
    }
  }, async (req) => {

    return await tickets.createOne({
      body: req.body,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });

  router.get('/tickets', {
    operationId: 'tickets.list',
    summary: 'vybor speska (poesk)',
    description: 'spesok tekjetov s feltrom',
    tags: ['Tickets'],
    session: spec.generate('session.user', ['user']),
    parameters: [
      {
        in: 'query',
        name: 'search[query]',
        description: 'poesk po nazvaneju ele zagolovku',
        schema: {type: 'string'}
      },
      {$ref: '#/components/parameters/sort'},
      {$ref: '#/components/parameters/limit'},
      {$ref: '#/components/parameters/skip'},
      {
        in: 'query',
        name: 'fields',
        description: 'vyberajemyje polja',
        schema: {type: 'string'},
        example: '_id,title,content,image(url)'
      },
      {
        in: 'query',
        name: 'changes',
        description: 'kljuch dlja vyborke ezmjenjenejj',
        schema: {type: 'string'}
      },
    ],
    responses: {
      200: spec.generate('success', {
        items: {
          type: 'array',
          items: {$ref: '#/components/schemas/ticket.view'}
        }
      })
    }
  }, async (req) => {

    await sleep(500);

    const filter = queryUtils.formattingSearch(req.query.search, {
      query: {kind: 'regex', fields: ['name','title.ru', 'title.en']}
    });
    if (req.query.changes) {
      return tickets.getListChanges({
        key: req.query.changes,
        filter,
        sort: queryUtils.formattingSort(req.query.sort),
        limit: req.query.limit,
        skip: req.query.skip,
        session: req.session,
        fields: queryUtils.parseFields(req.query.fields)
      });
    } else {
      return tickets.getList({
        filter,
        sort: queryUtils.formattingSort(req.query.sort),
        limit: req.query.limit,
        skip: req.query.skip,
        session: req.session,
        fields: queryUtils.parseFields(req.query.fields)
      });
    }
  });

  router.get('/tickets/:id', {
    operationId: 'tickets.one',
    summary: 'vybor odnogo',
    description: 'tekjet po edjentefekatoru.',
    tags: ['Tickets'],
    session: spec.generate('session.user', ['user']),
    parameters: [
      {
        in: 'path',
        name: 'id',
        schema: {type: 'string'},
        description: 'edjentefekator tekjeta'
      },
      {
        in: 'query',
        name: 'fields',
        description: 'vyberajemyje polja',
        schema: {type: 'string'}, example: '_id,title,content,image(url)'
      }
    ],
    responses: {
      200: spec.generate('success', {$ref: '#/components/schemas/user.view'}),
      404: spec.generate('error', 'Not Found', 404)
    }
  }, async (req) => {

    if (!req.params.id) {
      throw new errors.NotFound();
    }

    const filter = queryUtils.formattingSearch({
      _id: req.params.id,
    }, {
      _id: {kind: 'ObjectId'},
    });

    return await tickets.getOne({
      filter,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });

  });

  // router.put('/tickets/:id', {
  //   operationId: 'tickets.update',
  //   summary: 'rjedakterovaneje',
  //   description: 'ezmjenjeneje tekjeta',
  //   tags: ['Tickets'],
  //   session: spec.generate('session.user', ['user']),
  //   requestBody: {
  //     content: {
  //       'application/json': {schema: {$ref: '#/components/schemas/ticket.update'}}
  //     }
  //   },
  //   parameters: [
  //     {
  //       in: 'path',
  //       name: 'id',
  //       description: 'id tekjeta',
  //       schema: {type: 'string'}
  //     },
  //     {
  //       in: 'query',
  //       name: 'fields',
  //       description: 'vyberajemyje polja',
  //       schema: {type: 'string'},
  //       example: '*'
  //     }
  //   ],
  //   responses: {
  //     200: spec.generate('success', {$ref: '#/components/schemas/ticket.view'}),
  //     404: spec.generate('error', 'Not Found', 404)
  //   }
  // }, async (req) => {
  //
  //   return await tickets.updateOne({
  //     id: req.params.id,
  //     body: req.body,
  //     session: req.session,
  //     fields: queryUtils.parseFields(req.query.fields)
  //   });
  // });

  router.put('/tickets/:id/bookmark', {
    operationId: 'tickets.bookmark',
    summary: 'dobavet v ezbrannoje',
    description: 'pomjetet tekjet, kak ezbrannyjj',
    tags: ['Tickets'],
    session: spec.generate('session.user', ['user']),
    parameters: [
      {
        in: 'path',
        name: 'id',
        description: 'id tekjeta',
        schema: {type: 'string'}
      },
      {
        in: 'query',
        name: 'fields',
        description: 'vyberajemyje polja',
        schema: {type: 'string'},
        example: '*'
      }
    ],
    responses: {
      200: spec.generate('success', {$ref: '#/components/schemas/ticket.view'}),
      404: spec.generate('error', 'Not Found', 404)
    }
  }, async (req) => {

    await sleep(300);

    return await tickets.updateOne({
      id: req.params.id,
      body: {isBookmark: true},
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });

  router.delete('/tickets/:id/bookmark', {
    operationId: 'tickets.delete',
    summary: 'ubrat ez ezbrannogo',
    description: 'ubrat pomjetku ezbrannoste u tekjeta',
    session: spec.generate('session.user', ['user']),
    tags: ['Tickets'],
    parameters: [
      {
        in: 'path',
        name: 'id',
        description: 'edjentefekator tekjeta',
        schema: {type: 'string'}
      },
    ],
    responses: {
      200: spec.generate('success', true),
      404: spec.generate('error', 'Not Found', 404)
    }
  }, async (req) => {

    await sleep(300);

    await tickets.updateOne({
      id: req.params.id,
      body: {isBookmark: false},
      session: req.session,
    });

    return true;
  });

  // router.delete('/tickets/:id', {
  //   operationId: 'tickets.delete',
  //   summary: 'udaljeneje',
  //   description: 'udaljeneje tekjeta',
  //   session: spec.generate('session.user', ['user']),
  //   tags: ['Tickets'],
  //   parameters: [
  //     {
  //       in: 'path',
  //       name: 'id',
  //       description: 'edjentefekator tekjeta',
  //       schema: {type: 'string'}
  //     },
  //     {
  //       in: 'query',
  //       name: 'fields',
  //       description: 'vyberajemyje polja',
  //       schema: {type: 'string'},
  //       example: '_id'
  //     }
  //   ],
  //   responses: {
  //     200: spec.generate('success', true),
  //     404: spec.generate('error', 'Not Found', 404)
  //   }
  // }, async (req) => {
  //
  //   return await tickets.deleteOne({
  //     id: req.params.id,
  //     session: req.session,
  //     fields: queryUtils.parseFields(req.query.fields)
  //   });
  // });
};
