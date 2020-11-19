// client-side js, loaded by index.html
// run by the browser each time the page is loaded

let Peer = window.Peer;

let myinfo = document.querySelector('#myinfo');
let messagesEl = document.querySelector('.messages');
let peerIdEl = document.querySelector('#connect-to-peer');
let videoEl = document.querySelector('.remote-video');
let myvideoEl = document.querySelector('.my-video');

let logMessage = (message) => {
  let newMessage = document.createElement('div');
  newMessage.innerText = message;
  messagesEl.appendChild(newMessage);
  setTimeout(() => {
    messagesEl.removeChild(newMessage)
  }, 10 * 1000)
};

let renderVideo = (stream) => {
  videoEl.srcObject = stream;
};
let rendermyVideo = (stream) => {
  myvideoEl.srcObject = stream;
};
// Register with the peer server
// let peer = new Peer({
//   host: '/',
//   path: '/peerjs/myapp'
// });

async function get (url) {
  const res = await fetch(url)
  const resp = await res.json()
  return Promise.resolve(resp)
}

async function getId () {
  const res = await get('/api/peerapi/peerjs/id')
  return Promise.resolve(res)
}


async function getUsers () {
  const {users} = await get('/api/getusers')
  console.log('getUsers', users)

  return new Promise((resolve, reject) => {
    if (users.length == 1) {
      setTimeout(getUsers, 3000)
    } else {
      resolve(users)
    }
  })
}

async function refreshUser() {
  const users = await getUsers()

  const peerId = users.filter(e => e != window.myId)[0]
  console.log('peerId is ', peerId)
  peerIdEl.value = peerId
}

async function start () {
  const {id} = await getId()
  window.myId = id
  myinfo.innerHTML = `my id is ${id}`
  console.log('myId res', id)
  const peer = new Peer(id, {
    host: window.location.hostname, // host=hostname+‘:'+port(not 80)
    port: window.location.hostname == 'localhost' ? 9000 : (window.location.port || 443),
    path: '/api/peerapi'
  });
  // console.log('peer', peer)
  window.refreshUser = refreshUser
  refreshUser()
  
  
  // Handle incoming data connection
  let myconn 
  peer.on('connection', (conn) => {
    myconn = conn
    logMessage('incoming peer call!');
    conn.on('data', (data) => {
      logMessage(`received: ${data}`);
    });
    conn.on('open', () => {
      conn.send(`hi , i am  ${window.myId}`);
    });
  });
  
  // Handle incoming voice/video connection
  peer.on('call', (call) => {
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then((stream) => {
        call.answer(stream); // Answer the call with an A/V stream.
        call.on('stream', renderVideo);
        rendermyVideo(stream)
      })
      .catch((err) => {
        myconn.send('callee fail');
        logMessage('Failed to get local stream', err);
      });
  });
  
  // Initiate outgoing connection
  let connectToPeer = () => {
    let peerId = peerIdEl.value;
    logMessage(`Connecting to ${peerId}...`);
    
    let conn = peer.connect(peerId);
    conn.on('data', (data) => {
      logMessage(`received: ${data}`);
    });
    conn.on('open', () => {
      conn.send(`hi , i am  ${window.myId}`);
    });
    
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then((stream) => {
        let call = peer.call(peerId, stream);
        call.on('stream', renderVideo);
        rendermyVideo(stream)
      })
      .catch((err) => {
        conn.send('caller fail ');
        logMessage('Failed to get local stream', err);
      });
  };
  
  window.connectToPeer = connectToPeer;
  // peer.on('open', (id) => {
  //   logMessage('My peer ID is: ' + id);
  // });
  // peer.on('error', (error) => {
  //   console.error(error);
  // });
  

}



start()