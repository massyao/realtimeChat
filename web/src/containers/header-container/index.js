import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';

import { Layout, Menu } from 'antd';
const { Header } = Layout;
import Logo from '@components/elements/logo';

class HeaderContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {

    return (
      <Header>
        <Logo />
      </Header>
    );
  }
}

export default compose(
  withRouter,
  connect(state => ({})),
)(HeaderContainer);
