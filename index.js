var pkg = require('./package.json')

var provider = {
  name: 'cloudant',
  hosts: true,
  controller: require('./controller'),
  routes: require('./routes'),
  model: require('./models/cloudant.js'),
  status: {
    version: pkg.version
  }
}

module.exports = provider
