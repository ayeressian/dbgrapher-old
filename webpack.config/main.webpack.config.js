const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'electron-main',
  devtool: 'source-map',
  entry: './src/main/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '../electron-dist/main')
  },
  node: {
    __dirname: false
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: './electron-package.json',
        to: path.resolve(__dirname, '../electron-dist/package.json')
      }
    ])
  ]
};
