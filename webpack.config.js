require('dotenv').config();

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProduction = (process.env.NODE_ENV ? process.env.NODE_ENV.trim().toLowerCase() : '') === 'production';

function generateHtmlPlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map((item) => {
    const parts = item.split('.');
    const name = parts[0];
    const extension = parts[1];

    if (name === 'index') {
      return new HtmlWebpackPlugin({
        filename: `${name}.html`,
        template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
        inject: 'body',
        chunks: [`${name}`],
      });
    }

    return new HtmlWebpackPlugin({
      filename: `pages/${name}/index.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
      inject: 'body',
    });
  });
}

const htmlPlugins = generateHtmlPlugins('./src/template/views');

const config = {
  entry: {
    app: './src/app.js',
  },

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    assetModuleFilename: 'assets/[name][ext]',
    clean: true,
  },

  mode: isProduction ? 'production' : 'development',

  devServer: {
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, './dist'),
    watchContentBase: true,
    open: true,
    compress: true,
    port: 8080,
  },

  performance: {
    maxAssetSize: 512000,
  },

  module: {
    rules: [
      {
        test: /\.hbs$/i,
        loader: 'handlebars-loader',
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name][ext]',
        },
      },
      {
        test: /\.(sass|scss|css)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin(),
  ].concat(htmlPlugins),
};

if (isProduction) {
  config.plugins.push(
    new ImageMinimizerPlugin({
      minimizerOptions: {
        plugins: [
          ['pngquant', { quality: [0.6, 0.8] }],
          ['mozjpeg', { progressive: true, quality: 80 }],
          ['svgo'],
          ['gifsicle'],
        ],
      },
    }),
  );
}

module.exports = config;

// TODO: compress images
// TODO: fix style="background-image"
