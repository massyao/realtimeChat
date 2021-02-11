const Services = require('./services');

(async () => {
  const services = new Services().configure('configs.js');
  const peerServer = await services.getPeerServer();
  await peerServer.start();
  console.log(`Peer Server start`);
})();

process.on('unhandledRejection', function (reason/*, p*/) {
  console.error(reason);
  process.exit(1);
});

