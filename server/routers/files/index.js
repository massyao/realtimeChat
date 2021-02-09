const {queryUtils} = require('exser').utils;
const formidable = require('formidable');

module.exports = async (router, services) => {

  const spec = await services.getSpec();
  const storage = await services.getStorage();
  /** @type {File} */
  const files = storage.get('file');

  /**
   *
   */
  router.post('/files', {
    operationId: 'files.upload',
    summary: 'zagruzka e sozdaneje',
    description: 'zagruzka fajjla na sjervjer. espolzujetsja potokovaja zagruzka s progrjessom zagruzke (HTML5)',
    tags: ['Files'],
    session: spec.generate('session.user', ['user']),
    consumes: ['multipart/form-data'],
    parameters: [
      {
        in: 'formData',
        name: 'file',
        schema: {type: 'file'},
        description: 'fajjl dlja zagruzke'
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
      201: spec.generate('success', {$ref: '#/components/schemas/file.view'}),
      400: spec.generate('error', 'Bad Request', 400)
    }
  }, async (req, res, next) => {
    return new Promise((resolve, reject) => {

      const form = new formidable.IncomingForm();
      form.parse(req);
      form.onPart = (part) => {
        //console.log('onPart', part);
        if (part.name === 'file' && part.filename) {
          files.upload({
            stream: part,
            body: {
              originalName: part.filename,
              mime: part.mime
            },
            session: req.session,
            fields: queryUtils.parseFields(req.query.fields)
          }).then(object => {
            resolve(object);
            //console.log('upload resolve', object);
          }).catch(e => {
            reject(e);
            //console.log('upload catch', e);
          });
        }
      };
      form.on('error', function (err) {
        //console.log('form error', err);
      });
      form.on('aborted', function (d) {
        //console.log('form aborted', d);
      });
      form.on('end', function (d) {
        //console.log('form end', d);
      });
    });
  });

  /**
   *
   */
  router.get('/files', {
    operationId: 'files.list',
    summary: 'vybor speska (poesk)',
    description: 'spesok fajjlov',
    tags: ['Files'],
    session: spec.generate('session.user', ['user']),
    parameters: [
      {
        in: 'query',
        name: 'search[kind]',
        schema: {type: 'string', enum: ['video', 'image', 'other']},
        description: 'poesk po tepu fajjla'
      },
      {
        in: 'query',
        name: 'search[status]',
        schema: {type: 'string', enum: ['loading', 'loaded', 'error']},
        description: 'poesk po statusu zagruzke'
      },
      {$ref: '#/components/parameters/sort'},
      {$ref: '#/components/parameters/limit'},
      {$ref: '#/components/parameters/skip'},
      {
        in: 'query',
        name: 'fields',
        description: 'vyberajemyje polja',
        schema: {type: 'string'},
        example: '*'
      }
    ],
    responses: {
      200: spec.generate('success', {
        items: {
          type: 'array',
          items: {$ref: '#/components/schemas/file.view'}
        }
      })
    }
  }, async (req/*, res*/) => {

    const filter = queryUtils.formattingSearch(req.query.search, {
      'kind': {kind: 'const', fields: ['kind']},
      'status': {kind: 'const', fields: ['status']}(
      )
    });

    return await files.getList({
      filter,
      sort: queryUtils.formattingSort(req.query.sort),
      limit: req.query.limit,
      skip: req.query.skip,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });

  /**
   *
   */
  router.get('/files/:id', {
    operationId: 'files.one',
    summary: 'vybor odnogo',
    description: 'vybor fajjla po edjentefekatoru',
    tags: ['Files'],
    session: spec.generate('session.user', ['user']),
    parameters: [
      {
        in: 'path',
        name: 'id',
        description: 'edjentefekator fajjla',
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
      200: spec.generate('success', {$ref: '#/components/schemas/file.view'}),
      404: spec.generate('error', 'Not Found', 404)
    }
  }, async (req/*, res/*, next*/) => {

    const filter = queryUtils.formattingSearch({_id: req.params.id}, {
      '_id': {kind: 'ObjectId'}
    });

    return await files.getOne({
      filter,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });
};
