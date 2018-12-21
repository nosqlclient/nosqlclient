import React, { Component } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { ApolloProvider } from 'react-apollo';
import Loadable from 'react-loadable';
import Communicator from './modules/communicator';
import './style/App.scss';

const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;

// Containers
const MainLayout = Loadable({
  loader: () => import('./views/layout'),
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
        <ApolloProvider client={Communicator.client}>
          <Switch>
            <Route path="/" name="Dashboard" component={MainLayout} />
          </Switch>
        </ApolloProvider>
      </HashRouter>
    );
  }
}

export default App;
