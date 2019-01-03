import React from 'react';
import MainLayout from '../views/layout';
import Settings from '../views/yield/Settings';

const Dashboard = React.lazy(() => import('../views/yield/Dashboard'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home', component: MainLayout },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/settings', name: 'Settings', component: Settings }
];

export default routes;
