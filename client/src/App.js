import React, { Component } from 'react';
import Pace from 'react-pace-progress';
import { Navigation, Footer, TopHeader } from './components/common/';
import { correctHeight, detectBody } from './Helpers';
import $ from 'jquery';

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

  componentDidMount() {
    // Run correctHeight function on load and resize window event
    $(window).bind('load resize', function() {
      correctHeight();
      detectBody();
    });

    // Correct height of wrapper after metisMenu animation.
    $('.metismenu a').click(() => {
      setTimeout(() => {
        correctHeight();
      }, 300);
    });
  }
}

export default App;
