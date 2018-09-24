/* global require, module, __dirname */

const path = require('path');

module.exports = {
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
    port: 9999
  },
  entry: './src/script.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  }
};
