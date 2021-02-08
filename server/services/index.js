const {Services} = require('exser');

module.exports = class MyServices extends Services {

  /**
   * @returns {Promise.<Mailer>}
   */
  async getMail() {
    return this.import(__dirname + '/mail');
  }

  /**
   * @returns {Promise<*>}
   */
  async getPeerServer() {
    return this.import(__dirname + '/peer');
  }

  /**
   * @returns {Promise<Init>}
   */
  async getInit() {
    return this.import(__dirname + '/init');
  }

  /**
   * @returns {Promise<InitExample>}
   */
  async getInitExample() {
    return this.import(__dirname + '/init-example');
  }
};
