const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const libraryName = 'muze';
const outFileName = `${libraryName}.js`;

module.exports = {
    entry: './src/index.js',
    output: {
        path: `${__dirname}/dist`,
        filename: outFileName,
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    devtool: 'source-map',
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
                    { loader: 'sass-loader',
                    }
                ]
            }
        ]
    },
    mode: 'production',
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
        contentBase: './example',
    },
};
