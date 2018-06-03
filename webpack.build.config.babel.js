// @flow
/* eslint-disable flowtype/require-valid-file-annotation */
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
const isDevelopment = process.env.NODE_ENV === 'development';

// const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const glob = require('glob');
const path = require('path');
const webpack = require('webpack');

const identity = k => k;
// TODO: Could this be <T>(is:T, isnot:T) => ...
const inDev = (is:any, isnot:any) => (isDevelopment ? is : isnot);


const output:Object = {
  path: path.join(__dirname, 'dist'),
  filename: '[name].js'
};

const devServer = {
  host: '0.0.0.0',
  port: 8081,
  publicPath: output.publicPath,
  hot: true,
  quiet: true,
  historyApiFallback: { index: output.publicPath },
  disableHostCheck: true
};

const entry:Object = {
  taskTickets: [
    inDev('react-hot-loader/patch'),
    inDev(`webpack-dev-server/client?http://${devServer.host}:${devServer.port}`),
    inDev('webpack/hot/only-dev-server'),
    './src/index'
  ].filter(identity)
  // ...glob.sync('./src/*.js')
};

const resolve = {
  // alias: {
  //   'build': path.resolve(__dirname, 'src')
  // }
};

const rules = [
  {
    test: /\.js$/,
    include: path.resolve(__dirname, './src'),
    loader: 'babel-loader'
  },
  {
    test: require.resolve('./src/index'),
    use: [
      { loader: 'expose-loader', options: 'TaskTickets' },
      { loader: 'babel-loader' }
    ]
  },
  // ...glob.sync('./src/*.js').map((file) => {
  //   const variable = file.replace(/^.*\/(.*)\.js$/, 'TaskTickets.$1');
  //   return {
  //     test: require.resolve(file),
  //     use: [
  //       { loader: 'expose-loader', options: variable },
  //       { loader: 'babel-loader' }
  //     ]
  //   };
  // }),
  {
    test: /\.svg$/,
    use: [
      { loader: 'babel-loader' },
      { loader: 'svg-jsx-loader', query: { es6: true } }
    ]
  },
  {
    // all SASS except libraries, because we don't want "modules" for libraries
    test: /\.s?css$/,
    use: inDev(identity, use => ExtractTextPlugin.extract({ use }))([
      inDev('style-loader'),
      {
        loader: 'css-loader',
        query: {
          modules: true,
          localIdentName: '[name]__[local]___[hash:base64:5]',
          sourceMap: true
        },
      },
      'autoprefixer-loader',
      // {
      //   loader: 'sass-loader',
      //   query: {
      //     sourceMap: true,
      //     outputStyle: 'expanded',
      //     includePaths: [path.join(__dirname, 'src')]
      //   }
      // }
    ].filter(identity))
  },
  {
    test: /\/src\/libraries\.s?css$/,
    use: ExtractTextPlugin.extract({
      use: [
        'css-loader',
        'autoprefixer-loader',
        // {
        //   loader: 'sass-loader',
        //   query: {
        //     outputStyle: 'expanded',
        //     includePaths: [path.join(__dirname, 'src')]
        //   }
        // }
      ]
    })
  // },
  // { // TODO: manage how libraries muck-up globals
  //   test: /node_modules\/library\/*/,
  //   use: [
  //     { loader: 'imports-loader', query: 'this=>Build,exports=>false,define=>false' }
  //   ]
  }
];

const plugins = [
  new ExtractTextPlugin({ filename: '[name].css', allChunks: true }),
  new HtmlWebpackPlugin({ title: 'TaskTickets' }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }),
  // new AddAssetHtmlPlugin([
  //   { filepath: require.resolve('sass.js/dist/sass.js'), includeSourcemap: false }
  // ]),
  new webpack.ProvidePlugin({ // make this globally available
    React: 'react'
  }),
  // new CopyWebpackPlugin([  // Make sass.worker.js available, but don't import it.
  //   { from: 'node_modules/sass.js/dist/sass.worker.js' }
  // ]),
  inDev(() => new webpack.HotModuleReplacementPlugin(), identity)(),
  inDev(() => new webpack.NamedModulesPlugin(), identity)(),
  inDev(identity, () => new webpack.optimize.UglifyJsPlugin())()
].filter(identity);

const stats = {
  children: false // Reduce noise
};

module.exports = {
  devServer,
  // devtool: isDevelopment ? 'inline-source-map' : 'source-map',
  devtool: 'source-map',
  entry,
  module: { rules },
  output,
  plugins,
  resolve,
  stats
};
