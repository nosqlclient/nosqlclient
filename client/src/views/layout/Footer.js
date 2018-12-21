import React, { Component } from 'react';

class Footer extends Component {
  render() {
    return (
      <React.Fragment>
        <span>
          <a target="_blank" rel="noopener noreferrer" href="https://nosqlclient.com">Nosqlclient </a>
            &copy; 2019
        </span>
        <span className="ml-auto">
            Powered by
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/nosqlclient"> Nosqlclient Team</a>
        </span>
      </React.Fragment>
    );
  }
}

export default Footer;
