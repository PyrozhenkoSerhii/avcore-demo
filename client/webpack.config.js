/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  target: "web",
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },
  entry: "./index.tsx",
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
    port: 4000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
  ],
};
