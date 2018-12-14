import React, { Component } from 'react';
import MetisMenu from 'react-metismenu';

class Navigation extends Component {
  constructor() {
    super();
    this.state = {
      menu: [
        {
          icon: 'eye',
          label: 'Database Stats',
          to: 'menu-1'
        },
        {
          icon: 'wrench',
          label: 'Management',
          to: 'menu-2'
        },
        {
          icon: 'bolt',
          label: 'Tools',
          content: [
            {
              icon: 'bolt',
              label: 'Sub Menu',
              to: 'sub-menu'
            }
          ]
        },
        {
          icon: 'bolt',
          label: 'Collections',
          content: [
            {
              icon: 'bolt',
              label: 'Sub Menu',
              to: 'sub-menu'
            }
          ]
        },
        {
          icon: 'bolt',
          label: 'System'
        }
      ]
    };
  }

  /*activeRoute(routeName) {
      return this.props.location.pathname.indexOf(routeName) > -1 ? 'active' : '';
    }

    secondLevelActive(routeName) {
      return this.props.location.pathname.indexOf(routeName) > -1 ? 'nav nav-second-level collapse in' : 'nav nav-second-level collapse';
    }*/

  render() {
    return (
      <div className='navbar-default navbar-static-side' role='navigation'>
        <ul className='nav metismenu' id='side-menu' ref='menu'>
          <MetisMenu classNameContainer='nav metismenu' content={this.state.menu} ref='menu' />
        </ul>
      </div>
    );
  }
}

export default Navigation;
