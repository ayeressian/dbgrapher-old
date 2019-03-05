const config = require('./webpack.config.js');

config.devServer.port = 10000;

config.entry = {
  test: [`mocha-loader!./test/index.js`]
};

config.mode = 'development';

module.exports = config;
