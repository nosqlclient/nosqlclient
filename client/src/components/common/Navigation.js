import React, { Component } from 'react';
import $ from 'jquery';

class Navigation extends Component {
  connected = false; // TODO make this with redux

  componentDidMount() {
    $('#side-menu').metisMenu();
  }

  /*activeRoute(routeName) {
    return this.props.location.pathname.indexOf(routeName) > -1 ? 'active' : '';
  }

  secondLevelActive(routeName) {
    return this.props.location.pathname.indexOf(routeName) > -1 ? 'nav nav-second-level collapse in' : 'nav nav-second-level collapse';
  }*/

  render() {
    return (
      <nav className='navbar-default navbar-static-side' role='navigation'>
        <div className='sidebar-collapse'>
          <ul className='nav metismenu' id='side-menu'>
            <li className='nav-header'>
              <div className='dropdown profile-element'>
                <a data-toggle='dropdown' className='dropdown-toggle' href=''>
                  <span className='clear'>
                    if connected
                    <span className='block m-t-xs'>
                      <strong className='font-bold'>connection name</strong>
                    </span>
                    <span className='block m-t-xs'>server info</span>
                    <span className='text-muted text-xs block'>
                      db name <b className='caret' />
                    </span>
                    if not connected
                    <span className='block mt-xs'>Not Connected</span>
                    end of if
                  </span>
                </a>
              </div>
              <div className='logo-element'>MC+</div>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default Navigation;
