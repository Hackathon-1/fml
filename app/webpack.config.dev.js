const path = require('path')
const html = require('html-webpack-plugin')

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: [
    'webpack-dev-server/client?http://localhost:8080',
    'whatwg-fetch',
    './src/index'
  ],
  output: {
    publicPath: '/',
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },
  plugins: [new html({ template: './src/index.html' })],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      include: path.join(__dirname, 'src')
    }]
  },
  devServer: {
    publicPath: '/',
    contentBase: './dist'
  }
}
