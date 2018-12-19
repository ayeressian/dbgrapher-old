/* global require, __dirname, module */

const config = require('./webpack.config');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

config.output.path = path.resolve(__dirname, 'el-dist');

config.plugins.push(new CopyWebpackPlugin(
  [
    {
      from: 'src/electron.js',
      to: config.output.path
    }
  ]
));

module.exports = config;
