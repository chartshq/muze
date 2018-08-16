const ExtractTextPlugin = require('extract-text-webpack-plugin');

const libraryName = 'visual-group';
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
                test: /\.css(\.js)?$/,
                loaders: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                }),
            },
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css\.js$/,
                use: {
                    loader: 'css-js-loader',
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
                    { loader: 'sass-loader' }
                ]
            }
        ]
    },
    devServer: {
        inline: true,
        contentBase: './example',
    },
    plugins: [
        new ExtractTextPlugin('visual-group.css'),
    ]
};
