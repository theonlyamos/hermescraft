const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Cart = new Schema({
    user: {type: Schema.Types.ObjectId, ref: "User"},
    items: {type: Object},
    status: {type: String, enum: ['pending', 'complete'], default: 'pending'}
},{timestamps: true});

module.exports = mongoose.model('Cart', Cart);
