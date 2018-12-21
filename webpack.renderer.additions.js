/* global require, module, __dirname, process */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: '!!ejs-loader!src/renderer/index.ejs',
      nodeModules: process.env.NODE_ENV !== 'production'
        ? path.resolve(__dirname, './node_modules')
        : false
    })
  ]
};
