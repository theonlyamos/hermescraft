const Session = require('./models/session');

const debug = {}
debug['log'] = require('debug')('hermescraft-admin:log')
debug['success'] = require('debug')('hermescraft-admin:success')
debug['error'] = require('debug')('hermescraft-admin:error')

debug['dblog'] = async (req, res, next)=>{
  try {
    let session = new Session({
      session_id: req.sessionID,
      host: req.headers.host,
      path: req.url,
      method: req.method,
      user_agent: req.headers['user-agent'],
      user: req.session.passport ? req.session.passport.user : "",
      last_access: req.session.__lastAccess,
      ipaddress: req.ip
    })
    await Session.create(session)
  } 
  catch (error) {
    debug.error(error)
  }
  next()
}

module.exports = debug
