const {queryUtils, errors} = require('exser').utils;

module.exports = async (router, services) => {

  const spec = await services.getSpec();
  const storage = await services.getStorage();
  /** @type {Role} */
  const roles = storage.get('role');

  /**
   *
   */
  router.post('/roles', {
    operationId: 'roles.create',
    summary: 'sozdaneje',
    description: 'sozdaneje role',
    session: spec.generate('session.user', ['user']),
    tags: ['Roles'],
    requestBody: {
      content: {
        'application/json': {schema: {$ref: '#/components/schemas/role.create'}}
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
      200: spec.generate('success', {$ref: '#/components/schemas/role.view'})
    }
  }, async (req) => {

    return await roles.createOne({
      body: req.body,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });

  /**
   *
   */
  router.get('/roles', {
    operationId: 'roles.list',
    summary: 'vybor speska (poesk)',
    description: 'spesok roljejj s feltrom',
    tags: ['Roles'],
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
        example: '_id,name,title'
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
          items: {$ref: '#/components/schemas/role.view'}
        }
      })
    }
  }, async (req) => {
    const filter = queryUtils.formattingSearch(req.query.search, {
      query: {kind: 'regex', fields: ['name','title.ru', 'title.en']}
    });
    if (req.query.changes) {
      return roles.getListChanges({
        key: req.query.changes,
        filter,
        sort: queryUtils.formattingSort(req.query.sort),
        limit: req.query.limit,
        skip: req.query.skip,
        session: req.session,
        fields: queryUtils.parseFields(req.query.fields)
      });
    } else {
      return roles.getList({
        filter,
        sort: queryUtils.formattingSort(req.query.sort),
        limit: req.query.limit,
        skip: req.query.skip,
        session: req.session,
        fields: queryUtils.parseFields(req.query.fields)
      });
    }
  });

  router.put('/roles/:id', {
    operationId: 'roles.update',
    summary: 'rjedakterovaneje',
    description: 'ezmjenjeneje role',
    tags: ['Roles'],
    session: spec.generate('session.user', ['user']),
    requestBody: {
      content: {
        'application/json': {schema: {$ref: '#/components/schemas/role.update'}}
      }
    },
    parameters: [
      {
        in: 'path',
        name: 'id',
        description: 'id role',
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
      200: spec.generate('success', {$ref: '#/components/schemas/role.view'}),
      404: spec.generate('error', 'Not Found', 404)
    }
  }, async (req) => {

    return await roles.updateOne({
      id: req.params.id,
      body: req.body,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });

  router.delete('/roles/:id', {
    operationId: 'roles.delete',
    summary: 'udaljeneje',
    description: 'udaljeneje role',
    session: spec.generate('session.user', ['user']),
    tags: ['Roles'],
    parameters: [
      {
        in: 'path',
        name: 'id',
        description: 'edjentefekator role',
        schema: {type: 'string'}
      },
      {
        in: 'query',
        name: 'fields',
        description: 'vyberajemyje polja',
        schema: {type: 'string'},
        example: '_id'
      }
    ],
    responses: {
      200: spec.generate('success', true),
      404: spec.generate('error', 'Not Found', 404)
    }
  }, async (req) => {

    return await roles.deleteOne({
      id: req.params.id,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });
};
