const Services = require('./services');
const args = process.argv.slice(2);

(async () => {
  const services = new Services().configure('configs.js', 'configs.local.js');
  if (args.length && args[0] === '--task') {
    // task manage
    const tasks = await services.getTasks();
    await tasks.start(...args.slice(1));
    process.exit(0);
  } else {
    // HTTP server
    const restApi = await services.getRestApi();
    await restApi.start();
    console.log(`REST API: ${restApi.config.url}, docs: ${restApi.config.url}/docs`);
    // Peer server
    const peerServer = await services.getPeerServer();
    await peerServer.start();
    const url = `${restApi.config.protocol}${restApi.config.host}:${peerServer.config.port}${peerServer.config.path}`;
    console.log(`Peer Server: ${url}`);
  }
})();

process.on('unhandledRejection', function (reason/*, p*/) {
  console.error(reason);
  process.exit(1);
});

