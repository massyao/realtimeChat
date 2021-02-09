import React, { useCallback } from 'react';
import { Button } from 'antd';
import useSelectorMap from '@utils/hooks/use-selector-map';
import conference from '@store/conference/actions';
import Chat from '../chat';

import './style.less';

function Conference() {
  const select = useSelectorMap(state => ({
    peers: state.conference.peers,
    connected: state.conference.connected,
  }));

  const callbacks = {
    shareScreenToAll: useCallback(async () => {
      await conference.shareScreenToAll();
    }, []),
    
    shareCameraToAll: useCallback(async () => {
      await conference.shareCameraToAll();
    }, []),
  };

  return (
    <div className="conference">
      <div id="peers_video" className="conference__peers-video"></div>
      <Button
        type="primary"
        disabled={!select.connected || select.peers.length === 0}
        onClick={callbacks.shareScreenToAll}
      >
        {(!select.streaming) ? '发送我的屏幕' : '　　取消　　'}
      </Button>

      <Button
        type="primary"
        disabled={!select.connected || select.peers.length === 0}
        onClick={callbacks.shareCameraToAll}
      >
        {(!select.streaming) ? '打开摄像头' : '　　取消　　'}
      </Button>

      <Chat />
    </div>
  );
}

export default React.memo(Conference);
