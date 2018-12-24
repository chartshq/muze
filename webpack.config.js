const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const entryFile = path.resolve(__dirname, './packages/muze/src/index.js');
const libraryName = 'muze';
const outFileName = `${libraryName}.js`;
const cssFileName = `${libraryName}.css`;

module.exports = {
    entry: entryFile,
    output: {
        path: `${__dirname}/dist`,
        filename: outFileName,
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        babelrc: true,
                        extends: path.join(process.cwd(), './.babelrc')
                    }
                }
            },
            {
                test: /\.(s*)css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    optimization: {
        minimizer: [
            new UglifyJSPlugin({
                uglifyOptions: {
                    mangle: false,
                    keep_classnames: true,
                    keep_fnames: true
                },
                sourceMap: true
            }),
            new OptimizeCSSAssetsPlugin()
        ],
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true
                }
            }
        }
    },
    devServer: {
        inline: true,
        contentBase: './examples'
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: cssFileName
        })
    ]
};
