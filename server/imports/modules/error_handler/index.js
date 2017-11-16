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
