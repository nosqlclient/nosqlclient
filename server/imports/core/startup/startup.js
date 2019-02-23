import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { Connection, Settings } from '/server/imports/core/index';

Meteor.startup(() => {
  if (process.env.MONGOCLIENT_AUTH === 'true') {
    // Add handler
    WebApp.connectHandlers.use((req, res, next) => {
      const auth = Npm.require('basic-auth');
      const user = auth(req);

      if (!user || user.name !== process.env.MONGOCLIENT_USERNAME || user.pass !== process.env.MONGOCLIENT_PASSWORD) {
        if (req.url === '/healthcheck') next();
        else {
          res.statusCode = 401;
          res.setHeader('WWW-Authenticate', 'Basic realm="Promised Land"');
          res.end('Access denied');
        }
      } else {
        next();
      }
    });

    // Move handler to the top of the stack
    const { stack } = WebApp.connectHandlers;
    stack.unshift(stack.pop());
  }

  Settings.clearMongoclientData();
  Settings.insertDefault();
  Connection.migrateConnectionsIfExist();
  Connection.tryInjectDefaultConnection();
  Connection.savePredefinedConnections();
});
