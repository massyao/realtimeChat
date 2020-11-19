const express = require('express');
const { ExpressPeerServer } = require('peer');
const app = express();


// var app = require('express')();
const fs = require('fs');
const http = require('http');
const https = require('https');
// console.log('path ', process.cwd())
const privateKey  = fs.readFileSync('cert/private.pem', 'utf8');
const certificate = fs.readFileSync('cert/key.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};

// const server = http.createServer(app);
const server = https.createServer(credentials, app);



const PORT = 80;
const SSLPORT = 443;


// app.get('/', (req, res, next) => res.send('Hello world!'));
// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// listen for requests :)
// const listener = app.listen(process.env.PORT, () => {
//   console.log("Your app is listening on port " + listener.address().port);
// });

// =======

// const server = app.listen(9000);

// const peerServer = ExpressPeerServer(server, {
//   path: '/myapp'
// });

// app.use('/peerjs', peerServer);

// == OR ==

const users = []

app.get("/api/getusers", (request, response) => {
  response.send(JSON.stringify({
    users
  }));
});

const customGenerationFunction = () => {
  const id = (Math.random().toString(36) + '0000000000000000000').substr(2, 8)
  users.push(id)
  console.log('new user ', id, 'joined !' )
  console.log('                 ' )
  return JSON.stringify({
    id
  })
};

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/peerapi',
  generateClientId: customGenerationFunction
});

peerServer.on('connection', (client) => { 
  // console.log('connection client id', client.id);
  // (conn) => {

  client.send('hello!');


  // client.on('data', (data) => {
  //   console.log(`received: ${data}`);
  // });
  // client.on('open', () => {
  //   client.send('hello!');
  // });
});

peerServer.on('disconnect', (client) => { 
  console.log('disconnect client', client.id);
  users.splice(users.indexOf(client.id), 1)
});


app.use('/api', peerServer);



server.listen(SSLPORT);

// ========


// // server.js
// // where your node app starts

// // we've started you off with Express (https://expressjs.com/)
// // but feel free to use whatever libraries or frameworks you'd like through `package.json`.
// const express = require("express");

// const { PeerServer } = require("peer");

// const app = express();

// // make all the files in 'public' available
// // https://expressjs.com/en/starter/static-files.html
// app.use(express.static("public"));

// // https://expressjs.com/en/starter/basic-routing.html
// app.get("/", (request, response) => {
//   response.sendFile(__dirname + "/views/index.html");
// });

// // listen for requests :)
// // const listener = app.listen(process.env.PORT, () => {
// //   console.log("Your app is listening on port " + listener.address().port);
// // });

// // peerjs server
// // const peerServer = ExpressPeerServer(listener, {
// //   debug: true,
// //   path: '/myapp'
// // });
// const user = [];
// const customGenerationFunction = () => (Math.random().toString(36) + '0000000000000000000').substr(2, 16);
// const peerServer = PeerServer({
//   port: 9000,
//   path: '/myapp',
//   generateClientId: customGenerationFunction
// });

// app.use('/peerjs', peerServer);
