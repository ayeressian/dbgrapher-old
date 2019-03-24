const config = require('./webpack.config.js');
const CopyPlugin = require('copy-webpack-plugin');

let definePlugin = config.plugins.find((p) => p.constructor.name === 'DefinePlugin');
definePlugin.definitions['PRODUCTION'] = true;
config.plugins.push(new CopyPlugin([
  {from: 'CNAME', to: ''}
]));

module.exports = config;
