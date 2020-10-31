const path = require("path");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        js: './src/jbvalidator.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'jbvalidator.min.js'
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'src/lang', to: 'lang' },
            ],
        }),
    ],
};
