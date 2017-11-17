import logger from './setup';

const Logger = function Logger() {
};

Logger.prototype = {
  log({ type, message, metadataToLog }) {
    logger.log(type, `[${message}]`, metadataToLog);
  },

  info({ message, metadataToLog = {} }) {
    this.log({ type: 'info', message, metadataToLog });
  },

  error({ message, metadataToLog = {} }) {
    this.log({ type: 'error', message, metadataToLog });
  }
};

export default new Logger();
