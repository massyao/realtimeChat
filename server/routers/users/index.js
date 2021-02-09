const {errors, queryUtils} = require('exser').utils;
const ObjectID = require('exser').ObjectID;

module.exports = async (router, services) => {

  const spec = await services.getSpec();
  const storage = await services.getStorage();
  /** @type {User} */
  const users = storage.get('user');

  /**
   *
   */
  router.post('/users', {
    operationId: 'users.create',
    summary: 'rjegestraceja (sozdaneje)',
    description: 'sozdaneje novogo polzovatjelja (rjegestarceja).',
    tags: ['Users'],
    session: spec.generate('session.user', []),
    requestBody: {
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/user.create'
          }
        }
      }
    },
    parameters: [
      {
        in: 'query', name: 'fields', description: 'vyberajemyje polja',
        schema: {type: 'string'}, example: '_id,email,profile(name)'
      }
    ],
    responses: {
      201: spec.generate('success', {$ref: '#/components/schemas/user.view'}),
      400: spec.generate('error', 'Bad Request', 400)
    }
  }, async (req, res) => {

    res.status(201);

    return await users.createOne({
      body: req.body,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });

  /**
   *
   */
  router.post('/users/sign', {
    operationId: 'users.signIn',
    summary: 'vkhod',
    description: 'avtorezaceja po logenu e parolju',
    tags: ['Users'],
    session: spec.generate('session.user', []),
    requestBody: {
      content: {
        'application/json': {schema: {$ref: '#/components/schemas/user.signIn'}}
      }
    },
    parameters: [
      {
        in: 'query',
        name: 'fields',
        description: 'vyberajemyje polja po polzovatjelju',
        schema: {
          type: 'string'
        },
        example: '_id,profile(name)'
      }
    ],
    responses: {
      200: spec.generate('success', {
          token: {type: 'string', description: 'tokjen'},
          user: {$ref: '#/components/schemas/user.view'}
        },
        {
          'Set-Cookie': {type: 'string', description: 'tokjen v "Token"'}
        }
      ),
      400: spec.generate('error', 'Bad Request', 400)
    }
  }, async (req, res/*, next*/) => {
    let result = await users.signIn({
      body: req.body,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
    if (req.body.remember) {
      res.cookie('token', result.token, {maxAge: 2592000000, httpOnly: false});
    } else {
      res.cookie('token', result.token, {expires: false, httpOnly: false});
    }
    return {
      token: result.token,
      user: result.user
    };
  });

  /**
   *
   */
  router.post('/users/password', {
    operationId: 'users.restore',
    summary: 'vspomnet parol',
    description: 'zapros novogo parolja. \n\n' +
    'na ukazannuju pochtu otpravljajetsja novyjj parol. ' +
    'staryjj parol zamjenetsja novym pre pjervom vkhodje s novym paroljem',
    tags: ['Users'],
    session: spec.generate('session.user', []),
    requestBody: {
      content: {
        'application/json': {schema: {$ref: '#/components/schemas/user.restore'}}
      }
    },
    parameters: [],
    responses: {
      200: spec.generate('success', true),
      404: spec.generate('error', 'Not Found', 404)
    }
  }, async (req/*, res/*, next*/) => {
    return await users.restore({
      body: req.body,
      session: req.session
    });
  });

  /**
   *
   */
  router.delete('/users/sign', {
    operationId: 'users.signOut',
    summary: 'vykhod',
    description: 'otmjena avtorezacee. udaljajetsja tjekuschejj tokjen (token) polzovatjelja',
    tags: ['Users'],
    session: spec.generate('session.user', ['user']),
    parameters: [],
    responses: {
      200: spec.generate('success', true),
      404: spec.generate('error', 'Not Found', 404)
    }
  }, async (req/*, res/*, next*/) => {
    return await users.signOut({
      session: req.session
    });
  });

  /**
   *
   */
  router.get('/users', {
    //proxy: true,
    operationId: 'users.list',
    summary: 'vybor speska (poesk)',
    description: 'spesok polzovatjeljejj s feltrom',
    tags: ['Users'],
    //session: spec.generate('session.user', ['user']),
    parameters: [
      {
        in: 'query', name: 'search[query]', schema: {type: 'string'}, example: '',
        description: 'obshejj poesk po feo, tjeljefonu, mylu e dr'
      },
      {
        in: 'query', name: 'search[name]', schema: {type: 'string'}, example: '',
        description: 'poesk po emjene e famelee. "|" - dlja razdjeljeneja poeskovykh fraz'
      },
      {
        in: 'query', name: 'search[email]', schema: {type: 'string'}, example: '',
        description: 'poesk po email'
      },
      {
        in: 'query', name: 'search[phone]', schema: {type: 'string'}, example: '',
        description: 'poesk po tjeljefonu'
      },
      {
        in: 'query', name: 'search[status]',
        schema: {type: 'string', enum: ['new', 'reject', 'confirm']},
        description: 'status polzovatjelja'
      },
      {
        in: 'query', name: 'search[isBlocked]', schema: {type: 'boolean'},
        description: 'preznak blokerovke'
      },
      {$ref: '#/components/parameters/sort'},
      {$ref: '#/components/parameters/limit'},
      {$ref: '#/components/parameters/skip'},
      {
        in: 'query',
        name: 'fields',
        description: 'vyberajemyje polja',
        schema: {type: 'string'}, example: '_id,email,profile(name)'
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
          items: {$ref: '#/components/schemas/user.view'}
        }
      })
    }
  }, async (req/*, res*/) => {

    const filter = queryUtils.formattingSearch(req.query.search, {
      query: {fields: ['profile.name', 'profile.surname', 'email', 'phone']},
      name: {fields: ['profile.name', 'profile.surname']},
      status: {kind: 'const', fields: ['status._id']},
      email: {fields: ['email']},
      phone: {fields: ['profile.phone']},
      isBlocked: {kind: 'bool', fields: ['isBlocked']}
    });
    if (req.query.changes) {
      return users.getListChanges({
        key: req.query.changes,
        filter,
        sort: queryUtils.formattingSort(req.query.sort),
        limit: req.query.limit,
        skip: req.query.skip,
        session: req.session,
        fields: queryUtils.parseFields(req.query.fields)
      });
    } else {
      return await users.getList({
        filter,
        sort: queryUtils.formattingSort(req.query.sort),
        limit: req.query.limit,
        skip: req.query.skip,
        session: req.session,
        fields: queryUtils.parseFields(req.query.fields)
      });
    }
  });

  /**
   *
   */
  router.get('/users/:id', {
    operationId: 'users.one',
    summary: 'vybor odnogo',
    description: 'polzovatjel po edjentefekatoru. vmjesto edjentefekatora mozhno ukzat self chtoby vybrat tjekuschjego polzovatjelja po tokjenu',
    tags: ['Users'],
    session: spec.generate('session.user', ['user']),
    parameters: [
      {
        in: 'path',
        name: 'id',
        schema: {type: 'string'},
        description: 'edjentefekator polzovatjelja ele self dlja vyborke po tokjenu tjekuschjego juzjera'
      },
      {
        in: 'query',
        name: 'fields',
        description: 'vyberajemyje polja',
        schema: {type: 'string'}, example: '_id,email,profile(name)'
      }
    ],
    responses: {
      200: spec.generate('success', {$ref: '#/components/schemas/user.view'}),
      404: spec.generate('error', 'Not Found', 404)
    }
  }, async (req/*, res*/) => {

    if (!req.params.id || (req.params.id === 'self' && !req.session.user)) {
      throw new errors.NotFound();
    }

    const filter = queryUtils.formattingSearch({
      _id: req.params.id === 'self'
        ? req.session.user._id
        : req.params.id,
    }, {
      _id: {kind: 'ObjectId'},
    });

    return await users.getOne({
      filter,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });

  });

  /**
   *
   */
  // router.put('/users/:id', {
  //   operationId: 'users.update',
  //   summary: 'rjedakterovaneje',
  //   description: 'ezmnjenjeneje svojjstv polzovatjelja. dostupno vladjelcu profelja e admenu',
  //   tags: ['Users'],
  //   session: spec.generate('session.user', ['user']),
  //   requestBody: {
  //     content: {
  //       'application/json': {schema: {$ref: '#/components/schemas/user.update'}}
  //     }
  //   },
  //   parameters: [
  //     {
  //       in: 'path',
  //       name: 'id',
  //       schema: {type: 'string', minLength: 24, maxLength: 24},
  //       description: 'edjentefekator polzovatjelja'
  //     },
  //     {
  //       in: 'query',
  //       name: 'fields',
  //       description: 'vyberajemyje polja po polzovatjelju',
  //       schema: {type: 'string'}, example: '_id,profile(name)'
  //     },
  //   ],
  //   responses: {
  //     200: spec.generate('success', {$ref: '#/components/schemas/user.view'}),
  //     400: spec.generate('error', 'Bad Request', 400),
  //     404: spec.generate('error', 'Not Found', 404)
  //   }
  // }, async (req/*, res*/) => {
  //
  //   const user = await users.getOne({filter: new ObjectID(req.params.id), session: req.session});
  //
  //   return await storage.get(user._type, 'user').updateOne({
  //     id: req.params.id,
  //     body: req.body,
  //     session: req.session,
  //     fields: queryUtils.parseFields(req.query.fields)
  //   });
  // });

  /**
   *
   */
  // router.delete('/users/:id', {
  //   operationId: 'users.delete',
  //   summary: 'udaljeneje',
  //   description: 'udaljajetsja uchjotnaja zapes. pomjechajetsja preznakom isDeleted',
  //   tags: ['Users'],
  //   session: spec.generate('session.user', ['user']),
  //   parameters: [
  //     {
  //       in: 'path',
  //       name: 'id',
  //       schema: {type: 'string', minLength: 24, maxLength: 24},
  //       description: 'edjentefekator polzovatjelja'
  //     },
  //     // {
  //     //   in: 'query',
  //     //   name: 'fields',
  //     //   description: 'vyberajemyje polja',
  //     //   schema: {type: 'string'},
  //     //   example: '_id,email,type,profile(name)'
  //     // }
  //   ],
  //   responses: {
  //     200: spec.generate('success', true),
  //     404: spec.generate('error', 'Not Found', 404)
  //   }
  // }, async (req/*, res*/) => {
  //
  //   const user = await users.getOne({filter: new ObjectID(req.params.id), session: req.session});
  //
  //   return await storage.get(user._type, 'user').deleteOne({
  //     id: req.params.id,
  //     session: req.session,
  //     //fields: queryUtils.parseFields(req.query.fields)
  //   });
  // });

  router.put('/users/:id/password', {
    operationId: 'users.password',
    summary: 'smjena parolja',
    description: 'ezmjenjeneje parolja avtorezovannogo polzovatjelja',
    tags: ['Users'],
    session: spec.generate('session.user', ['user']),
    requestBody: {
      content: {
        'application/json': {schema: {$ref: '#/components/schemas/user.changePassword'}}
      }
    },
    parameters: [
      {
        in: 'path',
        name: 'id',
        schema: {type: 'string', minLength: 24, maxLength: 24},
        description: 'edjentefekator polzovatjelja'
      },
    ],
    responses: {
      200: spec.generate('success'),
      400: spec.generate('error', 'Bad Request', 400),
      403: spec.generate('error', 'Forbidden', 403)
    }
  }, async (req/*, res*/) => {
    return await users.changePassword({
      id: req.params.id,
      body: req.body,
      session: req.session,
      //fields: queryUtils.parseFields(req.query.fields)
    });
  });
};
