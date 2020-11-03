const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PageBannerSchema = new Schema({
    name: String,
    path: String
},{timestamps: true})

module.exports = mongoose.model('PageBanner', ProductImageSchema);
