const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const express = require('express');

module.exports = {
  entry: {
    app: './src/index.js'
  },
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    hot: true,
    compress: true,
    contentBase: path.join(__dirname, 'dist'),
    open: 'Chrome',
    before(app) {
      app.use('/static', express.static(path.resolve(__dirname, 'dist')))
    }
  },
  devtool: 'source-map',
  output: {
    filename: './js/[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './server/index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      }
    ]
  },
  resolve: {
    extensions: [
      '.js'
    ]
  },
  node: {
    fs: "empty"
  }
}