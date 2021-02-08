const {objectUtils} = require('exser').utils;
const Init = require('../init');

class InitExample extends Init{

  async start(){
    await super.start();

  }
}

module.exports = InitExample;
