const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = new Schema({
    name: {type: String, required: true},
    image: {type: Schema.Types.ObjectId, ref: 'PageImage'},
    link: {type: Schema.Types.ObjectId, ref: 'PageLink'}
});

module.exports = mongoose.model('Category', Category);
