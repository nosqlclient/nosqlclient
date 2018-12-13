import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import Dashboard from './Dashboard';

class Main extends Component {
  render() {
    return (
      <main>
        <Switch>
          <Route exact path='/(databaseStats|\/|)/' component={Dashboard} />
        </Switch>
      </main>
    );
  }
}

export default Main;
