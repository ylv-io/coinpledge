const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src/js', 'app.js'), // Our frontend will be inside the src folder
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'build.js', // The final file will be created in dist/build.js
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   use: ['eslint-loader'],
      // },
      {
        test: /\.s?css$/, // To load the css in react
        use: ['style-loader', 'css-loader', 'sass-loader'],
      }, {
        test: /\.jsx?$/, // To load the js and jsx files
        loader: 'babel-loader',
        exclude: /node_modules/,
      }, {
        test: /\.json$/, // To load the json files
        loader: 'json-loader',
      }, {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'file-loader',
      },
    ],
  },
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    historyApiFallback: true,
  },
};
