/**
 * Created by RSercan on 5.3.2016.
 */
let winston = require('winston');

export default new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({'timestamp': true})
    ]
});