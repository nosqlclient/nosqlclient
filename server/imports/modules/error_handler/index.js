import { Meteor } from 'meteor/meteor';
import { Logger } from '/server/imports/modules';

const util = require('util');

const ErrorHandler = function ErrorHandler() {
  this.types = {
    ParseUrlError: {
      Exception: Meteor.Error.bind(this, 1000),
      defaultMessage: 'error-while-parsing-url',
      loggerMessage: 'could not parse connection url, %s'
    },

    MissingParameter: {
      Exception: Meteor.Error.bind(this, 1001),
      defaultMessage: '%s-is-required',
      loggerMessage: '%s is required for %s'
    },

    InvalidParameter: {
      Exception: Meteor.Error.bind(this, 1002),
      defaultMessage: '%s-is-invalid',
      loggerMessage: '%s is invalid for %s'
    },

    SubscriptionError: {
      Exception: Meteor.Error.bind(this, 1003),
      defaultMessage: 'subscription-error',
      loggerMessage: 'error occured during subscription'
    },

    ShellError: {
      Exception: Meteor.Error.bind(this, 1004),
      defaultMessage: 'shell-error',
      loggerMessage: 'shell error occured'
    },

    ConnectionError: {
      Exception: Meteor.Error.bind(this, 1005),
      defaultMessage: 'connection-error',
      loggerMessage: 'could not connect to mongodb'
    },

    SchemaAnalyzeError: {
      Exception: Meteor.Error.bind(this, 1006),
      defaultMessage: 'schema-analyze-error',
      loggerMessage: 'schema analyze failed'
    },

    BackupError: {
      Exception: Meteor.Error.bind(this, 1007),
      defaultMessage: '%s-error',
      loggerMessage: '%s error occured'
    },

    GridFSError: {
      Exception: Meteor.Error.bind(this, 1008),
      defaultMessage: 'grid-fs-error',
      loggerMessage: 'error occured during %s'
    },

    InternalError: {
      Exception: Meteor.Error.bind(this, 500),
      defaultMessage: 'internal-server-error',
      loggerMessage: 'unexpected error occurred'
    }
  };
};

ErrorHandler.prototype = {
  create({ type, formatters = [], message, exception, metadataToLog = {} }) {
    const error = this.types[type];
    Logger.error({ message: util.format(error.loggerMessage, ...formatters), metadataToLog, exception });
    throw new error.Exception(util.format(message || error.defaultMessage, ...formatters));
  },
};

export default new ErrorHandler();
