const path = require('path')
const webpack = require('webpack')
const html = require('html-webpack-plugin')
const extractText = require('extract-text-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  entry: ['whatwg-fetch', './src/index'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new extractText('styles.css'),
    new webpack.optimize.DedupePlugin(),
    new html({ template: './src/index.html' }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') })
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      include: path.join(__dirname, 'src')
    }]
  }
}
