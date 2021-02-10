/**
 * @type {Object}
 */
module.exports = {

  'rest-api': {
    host: 'localhost',
    port: 8160,
    routers: require('./routers'),
    log: true,
    cors: {
      origin: [
        'http://localhost:8161',
      ]
    },
  },

  peer: {
    port: 8080,
    path: '/chatapi',
  },

  storage: {
    db: {
      url: `mongodb://${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || '27017'}`,
      name: 'conference-server'
    },

    models: require('./models'),

    user: {
      password: {
        length: 8,
        chars: 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM123456678990-!=+&$#'
      },
      authUrl: 'http://conference-server'
    },

    file: {
      kinds: {
        image: ['gif', 'png', 'jpeg', 'jpg'],
        doc: ['txt', 'pdf', 'doc', 'docx', 'rtf', 'xls', 'xlsx', 'csv'],
        other: ['*']
      },
      dir: './public/uploads',
      url: '/uploads' // upload via nginx
    },

    support: {
      email: 'Support <boolive@yandex.ru>'
    }
  },

  mail: {
    transport: {
      host: 'smtp.123.com',
      port: 465,
      secure: true, // use SSL
      //service: 'gmail',
      auth: {
        user: '123@qq.com',
        pass: 'qqaazzwwssxx'
      }
    },
    defaults: {
      from: '<daniilsidorov2017@yandex.ru>',
      replyTo: 'support@aaa.com'
    }
  },

  spec: {
    default: {
      info: {
        title: 'Conference PeerJS Server',
        description: 'Conference Server REST API',
        termsOfService: '', // url
        // contact: {
        // name: 'API Support',
        // url: 'http://www.example.com/support',
        // email: 'support@example.com'
        // },
        // license:{
        // name: 'Apache 2.0',
        // url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
        // },
        version: '1.0.0',
      },
      servers: [
        {
          url: '/api/v1',
          description: 'API server',
          // variables: {
          //   version: {
          //     enum: [
          //       'v1',
          //       'v2'
          //     ],
          //     default: 'v1'
          //   },
          // }
        }
      ],
      paths: {},
      components: {
        schemas: {},
        responses: {},
        parameters: {},
        examples: {},
        requestBodies: {},
        headers: {},
        securitySchemes: {
          token: {
            type: 'apiKey',
            in: 'header',
            name: 'X-Token'
          },
        },
        links: {},
        callbacks: {}
      },
      security: [
        //{token: []}, //global
      ],
      tags: [
        {name: 'Users', description: '1'},
        {name: 'Roles', description: 'role'},
        {name: 'Files', description: '2'},
        {name: 'Ticket', description: 'Ticket)'},
      ]
    }
  },

  tasks: {
    init: {
      service: 'init',
      iterations: 1
    },
    'init-example': {
      service: 'init-example',
      iterations: 1
    }
  },

};
