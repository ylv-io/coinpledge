const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = (env) => {
  const isProduction = env === 'production';
  const CSSExtract = new ExtractTextPlugin('styles.css');

  return {
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
          use: CSSExtract.extract({
            use: [
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          }),
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
    plugins: [
      CSSExtract,
    ],
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      historyApiFallback: true,
    },
  };
};
