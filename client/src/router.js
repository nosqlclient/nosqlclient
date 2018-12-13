import React from 'react';
import App from './App';

import Dashboard from './views/Dashboard';

import { Route, Router, IndexRedirect, browserHistory } from 'react-router';

export default (
  <Router history={browserHistory}>
    <Route path='/' component={App}>
      <IndexRedirect to='/databaseStats' />
      <Route path='main' component={Dashboard} />
    </Route>
  </Router>
);
