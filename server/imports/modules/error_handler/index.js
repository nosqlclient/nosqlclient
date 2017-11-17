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
      defaultMessage: '%s-is-required-for-%s',
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

    SchemaAnalyzeError: {
      Exception: Meteor.Error.bind(this, 1005),
      defaultMessage: 'schema-analyze-error',
      loggerMessage: 'schema analyze failed'
    },

    BackupError: {
      Exception: Meteor.Error.bind(this, 1006),
      defaultMessage: '%s-error',
      loggerMessage: '%s error occured'
    },

    GridFSError: {
      Exception: Meteor.Error.bind(this, 1007),
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

function resolveType(type) {
  if (Object.prototype.toString.call(type) === '[object String]') return this.types[type];
  return type;
}

ErrorHandler.prototype = {
  create({ type, formatters = [], message, exception, metadataToLog = {} }) {
    const error = resolveType(type);
    Logger.error({ message: util.format(error.loggerMessage, ...formatters), metadataToLog });
    if (exception) Logger.error({ message: util.format(error.loggerMessage, ...formatters), exception });
    throw new error.Exception(util.format(message || error.defaultMessage, ...formatters));
  },
};

export default new ErrorHandler();
