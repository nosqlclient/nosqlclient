import { Meteor } from 'meteor/meteor';
import { Logger } from '/server/imports/modules';

const util = require('util');

const Error = function Error() {
  this.types = {
    ParseUrlError: {
      Exception: Meteor.Error.bind(this, 1000),
      message: 'parse-url-error'
    },

    MissingParameter: {
      Exception: Meteor.Error.bind(this, 1001),
      message: '%s-is-required-for-%s'
    },

    InvalidParameter: {
      Exception: Meteor.Error.bind(this, 1002),
      message: '%s-is-invalid-for-%s'
    },

    SubscriptionError: {
      Exception: Meteor.Error.bind(this, 1003),
      message: 'subscribe-error'
    },

    ShellError: {
      Exception: Meteor.Error.bind(this, 1004),
      message: 'shell-error'
    },

    SchemaAnalyzeError: {
      Exception: Meteor.Error.bind(this, 1005),
      message: 'schema-analyze-error'
    },

    BackupError: {
      Exception: Meteor.Error.bind(this, 1006),
      message: 'backup-%s-error'
    },

    GridFSError: {
      Exception: Meteor.Error.bind(this, 1007),
      message: 'grid-fs-%s-error'
    },

    ConnectionError: {
      Exception: Meteor.Error.bind(this, 1007),
      message: 'connection-error'
    },

    QueryError: {
      Exception: Meteor.Error.bind(this, 1009),
      message: 'query-error'
    },

    InternalError: {
      Exception: Meteor.Error.bind(this, 500),
      message: 'internal-server-error'
    }
  };
};

const resolveType = function (type) {
  if (Object.prototype.toString.call(type) === '[object String]') return this.types[type];
  return type;
};

const extractMessage = function (externalError) {
  if (!externalError) return '';
  if (Object.prototype.toString.call(externalError) === '[object String]') return externalError;
  if (externalError.error) return externalError.error;
  if (externalError.message) return externalError.message;
  if (externalError.err) return externalError.err;
};

const createAndLogError = function (type, formatters, metadataToLog, externalError = '') {
  const error = resolveType(type);
  const externalErrorMessage = extractMessage(externalError);
  Logger.error({
    message: util.format(error.message, ...formatters),
    metadataToLog: Object.assign({ externalError: externalErrorMessage }, metadataToLog)
  });

  const details = { message: externalErrorMessage };
  return { error, details };
};

Error.prototype = {
  create({ type, formatters = [], externalError, metadataToLog = {} }) {
    const { error, details } = createAndLogError(type, formatters, metadataToLog, externalError);

    throw new error.Exception(util.format(error.message, ...formatters), details);
  },

  createWithoutThrow({ type, formatters = [], externalError, metadataToLog = {} }) {
    const { error, details } = createAndLogError(type, formatters, metadataToLog, externalError);

    return new error.Exception(util.format(error.message, ...formatters), details);
  }
};

export default new Error();
