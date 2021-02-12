import React, { Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Modals from '@app/modals';

import Main from '@app/main';

import 'antd/dist/antd.css';
import '@theme/style.less';

function App() {
  return (
    <Fragment>
      <Helmet>
        <title>Real Time Chat</title>
      </Helmet>
      <Switch>
        <Route path="/chat/" exact={true} component={Main} />
      </Switch>
      <Modals />
    </Fragment>
  );
}

export default React.memo(App);
