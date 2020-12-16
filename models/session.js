const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
    session_id: {type: String},
    user: {type: String},
    host: {type: String},
    path: {type: String},
    method: {type: String},
    ipaddress: {type: String},
    user_agent: {type: String},
    last_access: {type: Number}
},{timestamps: true});

module.exports = mongoose.model('Sessions', SessionSchema);
