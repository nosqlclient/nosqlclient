import React from 'react';
import MainLayout from './containers';

const Dashboard = React.lazy(() => import('./views/Dashboard'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home', component: MainLayout },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard }
];

export default routes;
