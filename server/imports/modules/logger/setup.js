const winston = require('winston');

winston.loggers.add('mongoclient', {
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      handleExceptions: true,
      prettyPrint(metadata) {
        return JSON.stringify(metadata);
      }
    })
  ]
});

export default winston.loggers.get('mongoclient');
