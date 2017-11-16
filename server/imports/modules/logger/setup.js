/**
 * Created by RSercan on 5.3.2016.
 */
const winston = require('winston');

export default new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      handleExceptions: true,
      prettyPrint(metadata) {
        return JSON.stringify(metadata);
      }
    })
  ],
});
