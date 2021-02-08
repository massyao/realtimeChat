const nodemailer = require('nodemailer');

class Mail {

  async init(config/*, services*/) {
    this.transport = nodemailer.createTransport(config.transport, config.defaults);
  }
}

module.exports = Mail;
