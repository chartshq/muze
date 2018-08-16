const libraryName = 'visual-cell';
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
                    { loader: 'sass-loader' }
                ]
            }
        ]
    },
    devServer: {
        inline: true,
        contentBase: './example',
    }
};
