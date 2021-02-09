const config = require('../config-spec.js');
const Services = require('./index');

/**
 * mjenjedzhjer sjervesov s konfeogom dlja tjestervoaneja
 * emporterujetsja v tjestakh
 * @type {Promise.<Services>}
 */
module.exports = new Services().init(config);
