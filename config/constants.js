const { join } = require('path')

module.exports = {
    buildPath: join(__dirname, '../build/'),
    publicPath: '/static',
    devPort: 3001,
    hmrPort: 8099
}
