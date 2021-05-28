require('dotenv').config();

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProduction = (process.env.NODE_ENV ? process.env.NODE_ENV.trim().toLowerCase() : '') === 'production';

function generateHtmlPlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map((item) => {
    const parts = item.split('.');
    const name = parts[0];
    const extension = parts[1];

    const htmlConfig = {
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
      inject: 'body',
      minify: {
        collapseWhitespace: false,
      },
    };
    return new HtmlWebpackPlugin(htmlConfig);
  });
}

const htmlPlugins = generateHtmlPlugins('./src/pages');

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
        test: /\.html$/,
        loader: 'html-loader',
        options: {
          minimize: false,
          sources: {
            list: [
              '...',
              {
                attribute: 'data-bg',
                type: 'src',
              },
            ],
          },
        },
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
        use: {
          loader: 'image-webpack-loader',
          options: {
            disable: !isProduction,
            mozjpeg: {
              progressive: true,
              quality: 80,
            },
            optipng: {
              optimizationLevel: 3,
            },
            pngquant: {
              quality: [0.7, 0.9],
              speed: 4,
            },
          },
        },
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name][ext]',
        },
      },
      {
        test: /\.(sass|scss|css)$/,
        use: ['style-loader', {
          loader: MiniCssExtractPlugin.loader,
          options: {
            esModule: false,
          },
        }, 'css-loader', 'sass-loader'],
      },
    ],
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin(),
  ].concat(htmlPlugins),
};

module.exports = config;
