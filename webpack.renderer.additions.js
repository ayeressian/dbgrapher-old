/* global require, module, __dirname */
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  target: 'electron-renderer',
  rules: [
    {
      test: /\.hbs$/,
      use: [
        'handlebars-loader'
      ]
  }],
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/renderer/index.hbs'
    })
  ]
};
