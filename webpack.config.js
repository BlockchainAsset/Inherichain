const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
      index: './client/index.js',
      deploy: './client/deploy.js',
      deployAdvanced: './client/deployAdvanced.js',
      interact: './client/interact.js',
      owner: './client/owner.js',
      backupOwner: './client/backupOwner.js',
      approver: './client/approver.js',
      heir: './client/heir.js',
      charity: './client/charity.js'
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