const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

mongoosePaginate.paginate.options = {
  limit: 12
}
const OrderSchema = new Schema({
    orderID: {type: String},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    cart: {type: Schema.Types.ObjectId,  ref: 'Cart'},
    customer_email: {type: String},
    items_count: {type: Number},
    stripe_id: {type: String},
    discount: {type: Number},
    tax: {type: Number},
    subtotal: {type: Number},
    total: {type: Number},
    payment_status: {type: String, default: 'unpaid'},
    shipping: {type: Object},
    billing: {type: Object},
    receipt_url: {type: String},
    status: {type: String, enum: ['pending', 'complete', 'cancelled'], default: 'pending'}
},{timestamps: true});

OrderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Order', OrderSchema);
