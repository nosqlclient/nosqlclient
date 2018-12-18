import React, { Component } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';
import './scss/App.scss';

const loading = () => <div className='animated fadeIn pt-3 text-center'>Loading...</div>;

// Containers
const MainLayout = Loadable({
  loader: () => import('./containers'),
  loading
});

// Pages
/* const Page404 = Loadable({
  loader: () => import('./views/Pages/Page404'),
  loading
}); */

class App extends Component {
  render() {
    return (
      <HashRouter>
        <Switch>
          <Route path='/' name='Dashboard' component={MainLayout} />
        </Switch>
      </HashRouter>
    );
  }
}

export default App;
