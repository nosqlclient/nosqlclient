import { Database, Logger, Error } from '/server/imports/modules';
import mailchimpAPI from 'meteor/universe:mailchimp-v3-api';
import { HTTP } from 'meteor/http';
import moment from 'moment';

const packageJson = require('/package.json');

const Settings = function () {
};

Settings.prototype = {
  read() {
    Logger.info({ message: 'read-setting' });
    return Database.readOne({ type: Database.types.Settings });
  },

  importSettings(file) {
    Logger.info({ message: 'import-settings-from-file', metadataToLog: file });

    try {
      const mongoclientData = JSON.parse(file);
      if (mongoclientData.settings) {
        Database.remove({ type: Database.types.Settings, selector: {} });
        delete mongoclientData.settings._id;
        Database.create({ type: Database.types.Settings, document: mongoclientData.settings });
      }
    } catch (ex) {
      Error.create({ type: Error.types.InternalError, exception: ex, metadataToLog: file });
    }
  },

  exportSettings({ res }) {
    const fileContent = {};
    fileContent.settings = Settings.findOne();
    fileContent.connections = Database.read({ type: Database.types.Connections, query: {} });
    const fileName = `backup_${moment().format('DD_MM_YYYY_HH_mm_ss')}.json`;

    Logger.info({ message: 'exportMongoclient', metadataToLog: { fileContent, fileName } });

    const headers = {
      'Content-type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename=${fileName}`,
    };
    res.writeHead(200, headers);
    res.end(JSON.stringify(fileContent));
  },

  insertDefault() {
    Logger.info({ message: 'insert-default-settings' });

    if (!Database.readOne({ type: Database.types.Settings, query: {} })) {
      Logger.info({ message: 'insert-default-settings', metadataToLog: 'no existing settings found inserting default' });

      Database.create({
        type: Database.types.Settings,
        document: {
          scale: 'MegaBytes',
          defaultResultView: 'Jsoneditor',
          mongoBinaryPath: '/opt/mongodb/bin/',
          maxAllowedFetchSize: 3,
          autoCompleteSamplesCount: 50,
          socketTimeoutInSeconds: 5,
          connectionTimeoutInSeconds: 3,
          dbStatsScheduler: 3000,
          showDBStats: true,
          showLiveChat: true,
          singleTabResultSets: false,
          maxLiveChartDataPoints: 15,
        }
      });
    }
  },

  setSubscribed() {
    Logger.info({ message: 'set-subscribed', metadataToLog: 'setting as subscribed' });
    Database.update({ type: Database.types.Settings, selector: {}, modifier: { $set: { subscribed: true } } });
  },

  subscribe(email) {
    Logger.info({ message: 'subscribe', metadataToLog: { email } });

    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!regex.test(email)) Error.create({ type: Error.types.InvalidParameter, formatters: ['email', 'subscribe'], metadataToLog: { email } });

    return mailchimpAPI.setApiKey('96b3d560f7ce4cdf78a65383375ee73b-us15').addANewListMember({
      list_id: 'ff8b28a54d',
      body: {
        email_address: email,
        status: 'subscribed',
      },
    }).then(null, (reason) => {
      Error.create({ type: Error.types.SubscriptionError, metadataToLog: { statusCode: reason.response.statusCode, title: JSON.parse(reason.response.content).title } });
    });
  },

  checkMongoclientVersion() {
    try {
      Logger.info({ message: '[checkNosqlclientVersion]' });
      const response = HTTP.get('https://api.github.com/repos/nosqlclient/nosqlclient/releases/latest', { headers: { 'User-Agent': 'Mongoclient' } });
      if (response && response.data && response.data.name && response.data.name !== packageJson.version) {
        return `There's a new version of mongoclient: ${response.data.name}, <a href='https://github.com/nosqlclient/nosqlclient/releases/latest' target='_blank'>download here</a>, 
           if you're using docker just use pull for the <b>${response.data.name}</b> or <b>latest</b> tag !`;
      }
      return '';
    } catch (e) {
      Logger.error({ message: '[checkNosqlclientVersion]', exception: e });
      return null;
    }
  },

  updateSettings(settings) {
    try {
      Logger.info({ message: '[updateSettings]', metadataToLog: settings });
      Database.remove({ type: Database.types.Settings, selector: {} });
      Database.create({ type: Database.types.Settings, document: settings });
    } catch (ex) {
      Error.create({ type: Error.types.InternalError, exception: ex, metadataToLog: settings });
    }
  },

  saveQueryHistory(history) {
    Logger.info({ message: 'saveQueryHistory', metadataToLog: history });
    const queryHistoryCount = Database.count({
      type: Database.types.QueryHistory,
      query: {
        connectionId: history.connectionId,
        collectionName: history.collectionName,
      }
    });

    if (queryHistoryCount >= 20) {
      Database.remove({
        type: Database.types.QueryHistory,
        selector: { _id: Database.readOne({ type: Database.types.QueryHistory, query: {}, queryOptions: { sort: { data: 1 } } }) } });
    }

    Database.create({ type: Database.types.QueryHistory, document: history });
  },

  clearMongoclientData() {
    Database.remove({ type: Database.types.ShellCommands, selector: {} });
    Database.remove({ type: Database.types.SchemaAnalyzeResult, selector: {} });
    Database.remove({ type: Database.types.Dumps, selector: {} });
  }
};

export default new Settings();
