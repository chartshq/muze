const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const entryFile = path.resolve(__dirname, './packages/muze/src/index.js');
const libraryName = 'muze';
const outFileName = `${libraryName}.js`;

module.exports = {
    entry: entryFile,
    output: {
        path: `${__dirname}/dist`,
        filename: outFileName,
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(s*)css$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: { singleton: true }
                    },
                    { loader: 'css-loader' },
                    {
                        loader: 'sass-loader',
                    }
                ]
            }
        ]
    },
    optimization: {
        minimizer: [
            new UglifyJSPlugin({
                uglifyOptions: {
                    keep_classnames: true,
                    keep_fnames: true
                },
                sourceMap: true
            })
        ]
    },
    devServer: {
        inline: true,
        contentBase: './examples',
    },
    plugins: [
        new ExtractTextPlugin('layout.css'),
    ]
};
