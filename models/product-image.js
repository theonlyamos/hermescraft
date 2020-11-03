const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductImageSchema = new Schema({
    name: String,
    path: String
},{timestamps: true})

module.exports = mongoose.model('ProductImage', ProductImageSchema);
