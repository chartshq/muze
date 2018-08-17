const path = require('path');

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
        umdNamedDefine: true
    },
    devtool: 'source-map',
    module: {
        rules: [
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
        contentBase: './examples'
    }
};
