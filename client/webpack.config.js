/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");

module.exports = {
  target: "web",
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },
  entry: "./index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/build/",
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "ts-loader",
      },
      {
        test: /\.(eot|ttf|woff2?|otf|png|jpe?g|gif|svg)$/,
        use: [
          "file-loader",
        ],
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
    open: true,
    hot: true,
    host: "localhost",
    port: 4200,
  },
  plugins: [
    new Dotenv({
      path: "../server/.env",
    }),
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
  ],
};
