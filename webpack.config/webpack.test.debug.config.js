const config = require('./webpack.test.config.js');

config.devServer.port = 10000;

config.entry = {
  test: [`mocha-loader!./test/index.js`]
};

config.target = 'web';

module.exports = config;
