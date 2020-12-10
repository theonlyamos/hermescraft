const debug = {}
debug['log'] = require('debug')('hermescraft:log')
debug['success'] = require('debug')('hermescraft:success')
debug['error'] = require('debug')('hermescraft:error')

module.exports = debug
