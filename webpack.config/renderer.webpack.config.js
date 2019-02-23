/* global require, module, __dirname */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'electron-renderer',
  devtool: 'source-map',
  entry: './src/renderer/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../electron-dist/renderer')
  },
  plugins: [
    new webpack.DefinePlugin({
      IS_ELECTRON: true
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/renderer/index.ejs',
      inject: true
    })
  ],
  node: {
    __dirname: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ],
        exclude: [
          path.resolve(__dirname, '../src/renderer/component')
        ]
      },
      {
        test: /\.css$/,
        use: [
          'to-string-loader',
          'css-loader'
        ],
        include: [
          path.resolve(__dirname, '../src/renderer/component')
        ]
      },
      {
        test: /\.(html)$/,
        use: 'html-loader'
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'url-loader?limit=10000',
          'img-loader'
        ]
      }
    ]
  }
};
