import React, { Component } from 'react';
import Pace from 'react-pace-progress';
import { Navigation, Footer, TopHeader } from './components/common/';

class App extends Component {
  render() {
    let wrapperClass = 'gray-bg ' + this.props.location.pathname;

    return (
      <div id='wrapper'>
        <Pace />
        <Navigation location={this.props.location} />

        <div id='page-wrapper' className={wrapperClass}>
          <TopHeader />
          {this.props.children}
          <Footer />
        </div>
      </div>
    );
  }
}

export default App;
