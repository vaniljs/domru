const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    //mode: 'production',
    //devtool: 'inline-source-map',
    entry: {
        index: './src/index.js',
    },
    devServer: {
        contentBase: './dist',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/'),
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {sourceMap: true}
                    }, {
                        loader: 'postcss-loader',
                        options: {sourceMap: true}
                    }, {
                        loader: 'sass-loader',
                    }
                ]
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: '/node_modules/'
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: f => {
                            let dirNameInsideAssets = path.relative(path.join(__dirname, 'src'), path.dirname(f));
                            return `${dirNameInsideAssets}/[name].[ext]`;
                        }
                    }
                }],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: "index.html"
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
    ],
};