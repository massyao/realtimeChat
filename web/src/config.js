const isWeb = process.env.TARGET === 'web';

let config = {
  dev: {
    port: 8030,
  },

  api: {
    baseURL: isWeb ? '' : 'http://localhost:8130',
    tokenHeader: 'X-Token',

    proxy: {
      '/api/**': {
        target: ' http://localhost:9000/conference',
        secure: true,
        changeOrigin: true,
      },
    },
    // useLocalIp: true,
    // host: process.env.HOST || '0.0.0.0',
    disableHostCheck: true,
    compress: true,
    open: true,
    hot: true,
    overlay: true // 浏览器上也可以看到编译错误信息
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
    host: 'localhost',
    port: 9000,
    path: '/conference',
    debug: 2, // 0 - disable logs, 1 - only errors, 2 - errors and warnings, 3 - all logs
  },
};

module.exports = config;
