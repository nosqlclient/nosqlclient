import React, { Component } from 'react';
import Pace from 'react-pace-progress';
import { Footer, Navigation, TopHeader } from './components/common/';
import { correctHeight, detectBody } from './Helpers';
import Main from './views/Main';

//TODO how to get rid of this shit imports ?
import $ from 'jquery';

class App extends Component {
  render() {
    return (
      <div id='wrapper'>
        <Pace />
        <Navigation location={this.props.location} />

        <div id='page-wrapper' className='gray-bg'>
          <TopHeader />
          <Main />
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
