import React, { useCallback } from 'react';
import { Button } from 'antd';
import useSelectorMap from '@utils/hooks/use-selector-map';
import conference from '@store/conference/actions';

import './style.less';

function Rooms() {
  const select = useSelectorMap(state => ({
    peers: state.conference.peers,
    connected: state.conference.connected,
  }));

  const callbacks = {
    shareScreenToAll: useCallback(async () => {
      await conference.shareScreenToAll();
    }, []),
  };

  return (
    <div className="rooms">

    </div>
  );
}

export default React.memo(Rooms);
