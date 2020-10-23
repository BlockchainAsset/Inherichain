const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
      index: './client/index.js',
      deploy: './client/deploy.js',
      interact: './client/interact.js'
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: '[name].js'
    },
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        compress: true,
        port: 8080
    }
};