const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  devServer: {
    contentBase: 'dist',
    port: 9999
  },
  entry: './src/renderer/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist')
  },
  node: {
    __dirname: true
  },
  plugins: [
    new webpack.DefinePlugin({
      IS_ELECTRON: false,
      PRODUCTION: false
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/renderer/index.ejs',
      inject: true
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
      },
      {
        test: /\.sql$/i,
        use: 'raw-loader',
      }
    ]
  }
};
