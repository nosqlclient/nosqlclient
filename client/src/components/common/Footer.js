import React from 'react';

class Footer extends React.Component {
  render() {
    return (
      <div className='footer'>
        <div className='pull-right'>
          <a href='%PUBLIC_URL%'>
            <strong>Nosqlclient</strong>
          </a>
          .com
        </div>
        <div>
          <strong>Copyright</strong>
          <a href='%PUBLIC_URL%'> Nosqlclient, Licensed with AGPL v3.0</a> &copy; 2019
        </div>
      </div>
    );
  }
}

export default Footer;
