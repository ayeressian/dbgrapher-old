/* global require, module, __dirname */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
    port: 9999
  },
  entry: './src/renderer/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/renderer/index.html',
      inject: true
    }),
    new webpack.DefinePlugin({
      IS_ELECTRON: false
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ],
        exclude: [
          path.resolve(__dirname, './src/renderer/component')
        ]
      },
      {
        test: /\.css$/,
        use: [
          'to-string-loader',
          'css-loader'
        ],
        include: [
          path.resolve(__dirname, './src/renderer/component')
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
