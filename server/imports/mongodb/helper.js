/**
 * Created by RSercan on 30.12.2015.
 */
import { Settings } from '/lib/imports/collections';
import { deserialize, serialize } from './extended_json';

const addOptionToUrl = (url, option, value) => {
  if (!value) return '';
  if (url.substring(url.lastIndexOf('/')).indexOf('?') === -1) { return `?${option}=${value}`; }
  return `&${option}=${value}`;
};

const getRoundedMilisecondsFromSeconds = (sec) => {
  if (sec) return Math.round(sec * 100 * 1000) / 100;
  return '30000';
};

const addSSLOptions = (obj, result) => {
  if (obj.rootCAFile) {
    result.sslValidate = true;
    result.sslCA = Buffer.from(obj.rootCAFile);
  }
  if (obj.certificateFile) result.sslCert = Buffer.from(obj.certificateFile);
  if (obj.certificateKeyFile) result.sslKey = Buffer.from(obj.certificateKeyFile);
  if (obj.passPhrase) result.sslPass = obj.passPhrase;
  if (obj.disableHostnameVerification) result.checkServerIdentity = false;
};

const Helper = function () {
};

Helper.prototype = {
  extractDBFromConnectionUrl(connection) {
    let options = '';
    if (connection.url.indexOf('?') !== -1) {
      options = `?${connection.url.split('?')[1]}`;
    }

    const splited = connection.url.split('/');
    if (splited.length <= 3) {
      connection.url += `/${options}`;
    } else {
      splited[3] = '';
      connection.url = splited.join('/') + options;
    }
  },

  changeUsernameAndPasswordFromConnectionUrl(connection, username, password) {
    const splitedForDash = connection.url.split('//');

    if (connection.url.indexOf('@') !== -1) {
      const splitedForAt = splitedForDash[1].split('@');
      const usernameAndPassword = splitedForAt[0].split(':');
      if (!username) [username] = usernameAndPassword;
      if (!password) [, password] = usernameAndPassword;

      connection.url = `${splitedForDash[0]}//${username}:${password}@${splitedForAt[1]}`;
    } else {
      connection.url = `${splitedForDash[0]}//${username}:${password}@${splitedForDash[1]}`;
    }
  },

  addAuthSourceToConnectionUrl(connection) {
    if (connection.url.indexOf('authSource') !== -1) return;
    connection.url += addOptionToUrl(connection.url, 'authSource', connection.databaseName);
  },

  getConnectionUrl(connection, addDB, username, password, addAuthSource) {
    if (connection.url) {
      if (username || password) this.changeUsernameAndPasswordFromConnectionUrl(connection, username, password);
      if (!addDB) this.extractDBFromConnectionUrl(connection);
      if (addAuthSource) this.addAuthSourceToConnectionUrl(connection);

      return connection.url;
    }

    const settings = Settings.findOne();

    // url
    let connectionUrl = 'mongodb://';
    if (connection.authenticationType) {
      if (username) connectionUrl += encodeURIComponent(username);
      else if (connection[connection.authenticationType].username) connectionUrl += encodeURIComponent(connection[connection.authenticationType].username);

      if (password) connectionUrl += `:${encodeURIComponent(password)}`;
      else if (connection[connection.authenticationType].password) connectionUrl += `:${encodeURIComponent(connection[connection.authenticationType].password)}`;

      connectionUrl += '@';
    }
    connection.servers.forEach((server) => { connectionUrl += `${server.host}:${server.port},`; });

    if (connectionUrl.endsWith(',')) connectionUrl = connectionUrl.substring(0, connectionUrl.length - 1);
    connectionUrl += '/';
    if (addDB) connectionUrl += connection.databaseName;

    // options
    if (connection.authenticationType === 'mongodb_cr' || connection.authenticationType === 'scram_sha_1') {
      connectionUrl += addOptionToUrl(connectionUrl, 'authSource', connection[connection.authenticationType].authSource);
    } else if (connection.authenticationType === 'mongodb_x509') {
      connectionUrl += addOptionToUrl(connectionUrl, 'ssl', 'true');
    } else if (connection.authenticationType === 'gssapi' || connection.authenticationType === 'plain') {
      if (connection.authenticationType === 'gssapi') connectionUrl += addOptionToUrl(connectionUrl, 'gssapiServiceName', connection.gssapi.serviceName);
      connectionUrl += addOptionToUrl(connectionUrl, 'authSource', '$external');
    }

    if (connection.options) {
      if (connection.options.readPreference) connectionUrl += addOptionToUrl(connectionUrl, 'readPreference', connection.options.readPreference);

      if (connection.options.connectionTimeout) connectionUrl += addOptionToUrl(connectionUrl, 'connectTimeoutMS', getRoundedMilisecondsFromSeconds(connection.options.connectionTimeout));
      else connectionUrl += addOptionToUrl(connectionUrl, 'connectTimeoutMS', getRoundedMilisecondsFromSeconds(settings.connectionTimeoutInSeconds));

      if (connection.options.socketTimeout) connectionUrl += addOptionToUrl(connectionUrl, 'socketTimeoutMS', getRoundedMilisecondsFromSeconds(connection.options.socketTimeout));
      else connectionUrl += addOptionToUrl(connectionUrl, 'socketTimeoutMS', getRoundedMilisecondsFromSeconds(settings.socketTimeoutInSeconds));

      if (connection.options.replicaSetName) connectionUrl += addOptionToUrl(connectionUrl, 'replicaSet', connection.options.replicaSetName);
    }

    if (connection.ssl && connection.ssl.enabled) connectionUrl += addOptionToUrl(connectionUrl, 'ssl', 'true');
    if (connection.authenticationType) connectionUrl += addOptionToUrl(connectionUrl, 'authMechanism', connection.authenticationType.toUpperCase().replace(new RegExp('_', 'g'), '-'));

    if (addAuthSource) {
      if (connection.authenticationType === 'mongodb_cr' || connection.authenticationType === 'scram_sha_1') {
        if (connection[connection.authenticationType].authSource) connectionUrl += addOptionToUrl(connectionUrl, 'authSource', connection[connection.authenticationType].authSource);
        else connectionUrl += addOptionToUrl(connectionUrl, 'authSource', connection.databaseName);
      } else if (connection.authenticationType === 'gssapi' || connection.authenticationType === 'plain') {
        connectionUrl += addOptionToUrl(connectionUrl, 'authSource', '$external');
      }
    }

    return connectionUrl;
  },

  getConnectionOptions(connection) {
    const result = {};
    if (connection.authenticationType === 'mongodb_x509') addSSLOptions(connection.mongodb_x509, result);
    if (connection.ssl && connection.ssl.enabled) addSSLOptions(connection.ssl, result);
    if (connection.options && connection.options.connectWithNoPrimary) result.connectWithNoPrimary = true;

    // added authSource to here to provide same authSource as DB name if it's not provided when connection is being used by URL
    if (connection.authenticationType === 'mongodb_cr' || connection.authenticationType === 'scram_sha_1') {
      if (connection[connection.authenticationType].authSource) result.authSource = connection[connection.authenticationType].authSource;
      else result.authSource = connection.databaseName;
    } else if (connection.authenticationType === 'gssapi' || connection.authenticationType === 'plain') {
      result.authSource = '$external';
    }
    return result;
  },

  clearConnectionOptionsForLog(connectionOptions) {
    const result = JSON.parse(JSON.stringify(connectionOptions));
    delete result.sslCert;
    delete result.sslCA;
    delete result.sslKey;

    return result;
  },

  removeConnectionTopology(obj) {
    if (obj.result && (typeof obj.result === 'object')) {
      if ('connection' in obj.result) {
        delete obj.result.connection;
      }
    }
  },

  removeCollectionTopology(obj) {
    if (obj.result && (typeof obj.result === 'object')) {
      obj.result = {};
    }
  },


  convertBSONtoJSON(obj) {
    return serialize(obj);
  },

  convertJSONtoBSON(obj) {
    return deserialize(obj);
  },
};

export default new Helper();
