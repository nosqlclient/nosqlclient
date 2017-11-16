import logger from './setup';

const Logger = function Logger() {
};

Logger.prototype = {
  log({ type, message, metadataToLog = {}, exception = {} }) {
    logger.log(type, `[${message}]`, metadataToLog, exception);
  },

  info({ message, metadataToLog = {} }) {
    this.log({ type: 'info', message, metadataToLog });
  },

  error({ message, exception = {}, metadataToLog = {} }) {
    this.log({ type: 'error', message, metadataToLog, exception });
  }
};

export default new Logger();
