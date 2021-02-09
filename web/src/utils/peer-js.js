import * as actions from '@store/actions';
import CONFIG from '../config';

class PeerJs {
  configure() {
    this.peer = null;
    this.peerId = null;
    this.userMedia = null;
    this.elements = []; // [{peerId, elm, displayElm}]
    this.error = null;
    this.mediaConfig = {
      audio: true,
      video: true,
    };
    this.displayMediaConfig = {
      video: {
        cursor: 'always',
      },
      audio: false,
    };
    this.displayMediaCameraConfig = {
      video: true,
      audio: false,
    };
  }

  // sojedenjeneje s PeerJs sjervjerom e podpesyvajeneje na sobyteja
  connect(peerId = null, callback) {
    // If connected then do nothing
    if (this.isConnected()) {
      callback && callback(this.peerId);
      return;
    }

    if (!this.userMedia) {
      // zaprashevajem dostup k mekrofonu e vedjeo kamjerje
      this.userMedia =
        navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    }

    // jesle undefined - znachet nje udalos poluchet dostup k mjedea rjesursam polzovatjelja
    if (!this.userMedia) {
      alert('Failed to access user media resources!');
      return;
    }

    if (!this.isDestroyed()) {
      // Reconnect
      // console.log('reConnecting...');
      this.reconnect();
      return;
    }

    // New connect
    // console.log('connecting...');
    this.peerId = peerId;
    this.peer = new Peer(peerId, CONFIG.peerJsServer);

    // sobyteje pre ustanovkje sojedenjeneja s sjervjerom PeerJs
    this.peer.on('open', id => {
      // console.log('peer opened:', id);
      this.peerId = id;
      this.error = null;
      callback && callback(this.peerId);
    });

    // na dannoje sobyteje nje rjeagerujem. dostatochno sobyteja disconnected.
    // this.peer.on('close', () => {
    //   console.log('peer closed');
    //   this.error === null && this._onDisconnected();
    // });

    // sobyteje budjet vyzvano, kak pre ruchnom deskonnjektje, tak e pre error
    this.peer.on('disconnected', () => {
      // console.log('peer disconnected');
      // jesle bylo sobyteje error, to povtorno _onDisconnected nje vyzyvajem
      this.error === null && this._onDisconnected();
    });

    // poslje sobyteja error budjet vyzvano sobyteje disconnected e potom close
    this.peer.on('error', err => {
      // console.log('peer error:', err);
      this.error = err;
      this._onDisconnected(true, err);
      // reconnect infinitely every 1 sec.
      setTimeout(() => {
        // rjekonnjektem so starym peerId
        this.connect(this.peerId, callback);
      }, 2000);
    });

    // sobyteje pre vkhodjaschjem sojedenjenee tepa data
    this.peer.on('connection', conn => this._onDataConnected(conn));

    // sobyteje pre vkhodjaschjem sojedenjenee tepa media
    this.peer.on('call', call => {
      // shareng ehkrana
      if (call.metadata && call.metadata.shareScreen) {
        call.answer();
        this._onDisplayMediaConnected(call);
        return;
      }
      // podkljuchjeneje po vedjeo-svjaze
      this.userMedia(
        this.mediaConfig,
        stream => {
          call.answer(stream);
          this._onMyStreamEvent(stream);
          this._onMediaConnected(call);
        },
        err => {
          console.error('Failed to get local stream', err);
        },
      );
    });
  }

  // povtornoje sojedenjeneje s PeerJs so starym peerId
  reconnect() {
    !this.isDestroyed() && this.peer.reconnect();
  }

  // otsojedenjeneje ot PeerJs sjervjera
  disconnect() {
    if (!this.peer) {
      return;
    }

    this.peer.disconnect();
    this.elements.forEach(item => item.elm.remove());
    this.elements = [];
  }

  // sojedenjeneje s uchastnekom po tepu data
  dataConnect(peerId, nickname) {
    if (!this.isConnected()) {
      return;
    }

    const conn = this.peer.connect(peerId, { metadata: { id: this.peerId, nickname } });
    conn.on('open', () => this._onDataConnected(conn));
  }

  // sojedenjeneje s uchastnekom po tepu media
  mediaCall(peerId, nickname) {
    if (!this.isConnected()) {
      return;
    }

    this.userMedia(
      this.mediaConfig,
      stream => {
        const call = this.peer.call(peerId, stream, { metadata: { id: this.peerId, nickname } });
        this._onMyStreamEvent(stream);
        this._onMediaConnected(call);
      },
      err => {
        console.error('Failed to get local stream', err);
      },
    );
  }

  // sojedenjeneje s uchastnekom po tepu media s rassharevanejem ehkrana vmjesto vedjeo-potoka s kamjery
  async startShareScreen(peerId, nickname) {
    if (!this.isConnected()) {
      return;
    }

    try {
      // const root = document.getElementById('my_video');
      // const tag = 'video';
      // const elm = document.createElement(tag);
      // const elmRoot = document.createElement('div');
      // elmRoot.className = 'my-video__video';
      // const elmLabel = document.createElement('div');
      // elmLabel.className = 'my-video__label';
      // elmLabel.innerText = 'My Share Screen';
      // elmRoot.append(elm);
      // elmRoot.append(elmLabel);
      // root.append(elmRoot);
      // elm.srcObject = stream;
      // elm.play();

      let displayStream;
      if (navigator.mediaDevices.getDisplayMedia) {
        displayStream = await navigator.mediaDevices.getDisplayMedia(this.displayMediaConfig);
      } else {
        displayStream = await navigator.getDisplayMedia(this.displayMediaConfig);
      }
      const call = this.peer.call(peerId, displayStream, {
        metadata: { id: this.peerId, nickname, shareScreen: true },
      });
      this._onDisplayMediaConnected(call);
    } catch (err) {
      console.error('Failed to get local screen capture', err);
    }
  }

  async startShareCamera(peerId, nickname) {
    if (!this.isConnected()) {
      return;
    }

    try {
      // const root = document.getElementById('my_video');
      // const tag = 'video';
      // const elm = document.createElement(tag);
      // const elmRoot = document.createElement('div');
      // elmRoot.className = 'my-video__video';
      // const elmLabel = document.createElement('div');
      // elmLabel.className = 'my-video__label';
      // elmLabel.innerText = 'My Share Screen';
      // elmRoot.append(elm);
      // elmRoot.append(elmLabel);
      // root.append(elmRoot);
      // elm.srcObject = stream;
      // elm.play();

      let displayStream;
      if (navigator.mediaDevices.getDisplayMedia) {
        displayStream = await navigator.mediaDevices.getUserMedia(this.displayMediaCameraConfig);
      } else {
        displayStream = await navigator.getUserMedia(this.displayMediaCameraConfig);
      }
      const call = this.peer.call(peerId, displayStream, {
        metadata: { id: this.peerId, nickname, shareScreen: true },
      });
      this._onDisplayMediaConnected(call);
    } catch (err) {
      console.error('Failed to get local screen capture', err);
    }
  }

  // otpravka soobschjeneja drugomu uchastneku
  sendData(conn, data) {
    if (!conn || !conn.open || !data) {
      return;
    }
    conn.send(data);
  }

  // jest le sojedenjeneje s sjervjerom
  isConnected() {
    return this.peer && !this.peer.disconnected && !this.peer.destroyed;
  }

  // unechtozhjeno le sojedenjeneje (rjekonnjekt v takom sluchaje njevozmozhjen)
  isDestroyed() {
    return !this.peer || this.peer.destroyed;
  }

  removeElementBy(peerId) {
    const index = this.elements.findIndex(item => item.peerId === peerId);
    if (index !== -1) {
      this.elements[index].elm.remove();
      this.elements.splice(index, 1);
    }
  }

  removeDisplayElementBy(peerId) {
    const index = this.elements.findIndex(item => item.peerId === peerId);
    if (index !== -1) {
      this.elements[index].displayElm.remove();
      this.elements[index].displayElm = null;
    }
  }

  // vyzov ehkshjena pre deskonnjektje
  _onDisconnected(clearPeer = false, err) {
    if (clearPeer) {
      this.peer = null;
    }
    actions.conference.disconnected(err);
  }

  // vyzov ehkshjena e podpeska na sobyteja data sojedenjenee
  _onDataConnected(conn) {
    // console.log('data conn opened:', conn);
    actions.conference.dataConnected(conn);
    conn.on('data', data => this._onDataRecv(conn.peer, data));
    conn.on('close', () => this._onDataDisconnected(conn));
    conn.on('error', err => this._onDataDisconnected(conn, err));
  }

  // vyzov ehkshjena pre poluchjenee data soobschjeneja
  _onDataRecv(peerId, data) {
    // console.log('recv data:', peerId, data);
    actions.conference.dataRecv(peerId, data);
  }

  // kogda uchastnek otsojedenjajetsja ot data sojedenjeneja
  // err === null - podrazumjevajetsja, chto uchastnek otsojedenelsja namjerjenno
  // err !== null - pytajemsja sdjelat rjekonnjekt s uchastnekom, jesle enceator - my
  _onDataDisconnected(conn, err = null) {
    // console.log('data disconnected', conn.peer, conn.metadata, err);
    actions.conference.dataDisconnected(conn.peer, err);
  }

  // vyzov ehkshjena e podpeska na sobyteja media sojedenjenee
  _onMediaConnected(call) {
    // console.log('media conn opened:', call);
    actions.conference.mediaConnected(call);
    call.on('stream', remoteStream => this._onStreamEvent(call.peer, remoteStream));
    call.on('close', () => this._onMediaDisconnected(call));
    call.on('error', err => this._onMediaDisconnected(call, err));
  }

  // kogda uchastnek otsojedenjajetsja ot media sojedenjeneja
  // err === null - podrazumjevajetsja, chto uchastnek otsojedenelsja namjerjenno
  // err !== null - pytajemsja sdjelat rjekonnjekt s uchastnekom, jesle enceator - my
  _onMediaDisconnected(call, err = null) {
    // console.log('media disconnected', call.peer, call.metadata, err);
    actions.conference.mediaDisconnected(call.peer, err);
    this.removeElementBy(call.peer);
  }

  _onDisplayMediaConnected(call) {
    // console.log('display media conn opened:', call);
    actions.conference.displayMediaConnected(call);
    call.on('stream', remoteStream => this._onStreamEvent(call.peer, remoteStream, true));
    call.on('close', () => this._onDisplayMediaDisconnected(call));
    call.on('error', err => this._onDisplayMediaDisconnected(call, err));
  }

  _onDisplayMediaDisconnected(call, err = null) {
    // console.log('display media disconnected', call.peer, call.metadata, err);
    actions.conference.displayMediaDisconnected(call.peer, err);
    this.removeDisplayElementBy(call.peer);
  }

  // sozdaneje audeo/vedjeo ehljemjenta na stranecje e prevjazka k njemu stream s uchastnekom
  // vsje ehljemjenty my pomjeschajem v this.elements, chtoby pre deskonnjektje ekh unechtozhet
  _onStreamEvent(peerId, remoteStream, isDisplayMedia = false) {
    const exist = this.elements.find(elm => elm.peerId === peerId);
    if (exist && !isDisplayMedia) {
      return;
    }

    const root = document.getElementById('peers_video');
    const tag = !this.mediaConfig.video ? 'audio' : 'video';
    const elm = document.createElement(tag);
    const elmRoot = document.createElement('div');
    elmRoot.className = 'conference__video';
    const elmLabel = document.createElement('div');
    elmLabel.className = 'conference__label';
    elmLabel.innerText = peerId;
    elmRoot.append(elm);
    elmRoot.append(elmLabel);
    root.append(elmRoot);
    if (isDisplayMedia) {
      const index = this.elements.findIndex(item => item.peerId === peerId);
      if (index !== -1) {
        this.elements[index].displayElm = elmRoot;
      }
    } else {
      this.elements.push({ peerId, elm: elmRoot });
    }
    elm.srcObject = remoteStream;
    elm.play();
  }

  // vyvod na ehkran svojego vedjeo-potoka
  _onMyStreamEvent(myStream) {
    const peerId = this.peerId;
    const exist = this.elements.find(elm => elm.peerId === peerId);
    if (exist) {
      return;
    }
    const root = document.getElementById('my_video');
    const tag = !this.mediaConfig.video ? 'audio' : 'video';
    const elm = document.createElement(tag);
    const elmRoot = document.createElement('div');
    elmRoot.className = 'my-video__video';
    const elmLabel = document.createElement('div');
    elmLabel.className = 'my-video__label';
    elmLabel.innerText = 'My Video';
    elmRoot.append(elm);
    elmRoot.append(elmLabel);
    root.append(elmRoot);
    this.elements.push({ peerId, elm: elmRoot });
    elm.srcObject = myStream;
    elm.muted = true;
    elm.play();
  }
}

const peerJs = new PeerJs();

export default peerJs;
