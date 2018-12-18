import React, { Component } from 'react';
import { AppSidebarToggler } from '@coreui/react';

class Header extends Component {
  render() {
    return (
      <React.Fragment>
        <AppSidebarToggler className='d-lg-none' display='md' mobile />
        <AppSidebarToggler className='d-md-down-none' display='lg' />
      </React.Fragment>
    );
  }
}

export default Header;
