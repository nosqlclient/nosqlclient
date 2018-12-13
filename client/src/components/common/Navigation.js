import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';

class Navigation extends Component {
  componentDidMount() {
    const { menu } = this.refs;
    $(menu).metisMenu();
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
        <ul className='nav metismenu' id='side-menu' ref='menu'>
          <li className='nav-header'>
            <div className='dropdown profile-element'>
              <span />
              <a data-toggle='dropdown' className='dropdown-toggle' href='#'>
                <span className='clear'>
                  <span className='block m-t-xs'>
                    <strong className='font-bold'>Example user</strong>
                  </span>
                  <span className='text-muted text-xs block'>
                    Example position
                    <b className='caret' />
                  </span>
                </span>
              </a>
              <ul className='dropdown-menu animated fadeInRight m-t-xs'>
                <li>
                  <a href='#'> Logout</a>
                </li>
              </ul>
            </div>
            <div className='logo-element'>IN+</div>
          </li>
          {/* <li className={this.activeRoute('/databaseStats')}>
            <Link to='/databaseStats'>
              <i className='fa fa-th-large' /> <span className='nav-label'>Main view</span>
            </Link>
          </li>*/}
        </ul>
      </nav>
    );
  }
}

export default Navigation;
