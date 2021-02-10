const config = require('../config-spec.js');
const Services = require('./index');

/**
 * @type {Promise.<Services>}
 */
module.exports = new Services().init(config);
