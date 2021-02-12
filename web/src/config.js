const isWeb = process.env.TARGET === 'web';

console.log('process.env', process.env.TARGET)

let config = {
  dev: {
    port: 8030,
  },

  api: {
    baseURL: isWeb ? '' : 'http://localhost:8130',
    tokenHeader: 'X-Token',

  },

  routing: {
    basename: '/',
    type: isWeb ? 'browser' : 'memory',
  },

  ssr: {
    host: 'localhost',
    // host: '0.0.0.0',
    port: 8130,
    preloadState: true,
  },

  peerJsServer: {
    host: 'allen-tse.space',
    // host: 'localhost',
    // port: 8080, // server-port
    port: 443,
    path: '/chatapi', // server-path
    debug: 0, // 0 - disable logs, 1 - only errors, 2 - errors and warnings, 3 - all logs
  },
};

module.exports = config;
