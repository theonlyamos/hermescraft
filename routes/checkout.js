var express = require('express');
var Product = require('../models/product');
var Category = require('../models/category');
const Cart = require('../models/cart');
const Order = require('../models/order');
const {stripeSecretKey} = require('../config');
const { hermescraftUrl } = require('../config');
const stripe = require('stripe')(stripeSecretKey)
const shippingAllowedCountries = require('../allowed_shipping_countries.js');
const cart = require('../models/cart');
var router = express.Router();
router.use(express.json())

router
.route('/')
.get(async(req, res, next)=>{
  let cart = req.session.cart
  if (!cart){
    cart = {}
  }
  let cartTotal = 0
  for (let k in cart){
    cartTotal += Number.parseFloat(cart[k].total)
  }
  const categories = await Category.find({}).populate('image')
                                  .exec().catch((error)=>console.log(error))
  for (let i = 0; i < categories.length; i++){
    const category = categories[i]
    const link = await PageLink.findById(category.link).populate('text')
                                .exec().catch((error)=>console.log(error))
    category.link = link
    categories[i] = category
  }
  res.render('checkout', {title: 'HermesCraft || Checkout',
                          cart: cart,
                          cartTotal: cartTotal,
                          cartLength: Object.keys(cart).length,
                          categories: categories,
                          user: req.user
                         });
})
.post(async (req, res) => {
  try {
    let cart = req.session.cart
    if (!cart){
      cart = {}
    }
    let cartTotal = 0
    let line_items = []
    for (let k in cart){
      cartTotal += Number.parseFloat(cart[k].total)
      line_items.push({
        price: cart[k].stripe_price_id,
        quantity: cart[k].quantity
      })
      /**
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: cart[k].name,
            images: [cart[k].image]
          },
          unit_amount: parseFloat(cart[k].price)*100
        },
        quantity: cart[k].quantity
      })
      */
    }

    if (req.user){
      cart = await Cart.findOne({'user': req.user._id, 'status': 'pending'}).exec()
    }
    else {
      cart = new Cart({
        items: req.session.cart
      })

      cart = await Cart.create(cart)
    }
    const paymentOptions = {
      amount: cartTotal * 100,
      currency: 'usd',
      payment_method_types: ['card'],
      setup_future_usage: 'on_session'
    }

    const checkoutOptions = {
      payment_method_types: ['card'],
      line_items,
      client_reference_id: cart._id.toString(),
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: shippingAllowedCountries
      },
      allow_promotion_codes: true,
    // setup_future_usage: 'on_session',
      success_url: `${hermescraftUrl}checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${hermescraftUrl}checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
    }

    if (req.user){
        checkoutOptions.customer_email = req.user.username
        paymentOptions.receipt_email = req.user.username
    }
    const payment = await stripe.paymentIntents.create(paymentOptions)
    checkoutOptions.payment_intent = payment._id
    const session = await stripe.checkout.sessions.create(checkoutOptions)
    const today = new Date();
    let orderID = `${today.getFullYear()-2000}${today.getMonth()+1}${today.getDate()}`;
    const todaysCount = await Order.countDocuments({orderID: {$regex: orderID}})
    console.log('Count:',todaysCount)
    orderID = `${orderID}-${todaysCount+1}`
    const newOrder = new Order({
      orderID,
      stripe_id: session.id,
      items_count: Object.keys(cart.items).length,
      cart: cart._id,
      discount: parseInt(session.total_details.amount_discount),
      tax: parseInt(session.total_details.amount_tax),
      subtotal: parseInt(session.amount_subtotal) / 100,
      total: parseInt(session.amount_total) / 100,
      payment_status: session.payment_status
    })

    if (req.user) newOrder.user = req.user._id

    order = await Order.create(newOrder)
    console.log(order)

    res.json({ id: session.id });
    
  } catch (error) {

    console.log(console.log(error))
    
    res.json({error: true, message: "Error creating checkout session"});
  }

  
});

router.
route('/success')
.get(async(req, res, next)=>{
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id)
    const cart = await Cart.findByIdAndUpdate(session.client_reference_id, {$set: {status: 'complete'}})
    const payment = await stripe.paymentIntents.retrieve(session.payment_intent)
    const order = await Order.findOneAndUpdate({'stripe_id': session.id}, {
      $set: {
        discount: parseInt(session.total_details.amount_discount),
        tax: parseInt(session.total_details.amount_tax),
        subtotal: parseInt(session.amount_subtotal) / 100,
        total: parseInt(session.amount_total) / 100,
        payment_status: session.payment_status,
        shipping: session.shipping,
        billing: session.billing,
        receipt_url: payment.charges.data[0].receipt_url,
        status: 'complete'
      }
    })

    req.session.cart = {}

    console.log(order)
    
    req.session.msgTitle = "Order Complete"
    req.session.message = "Payment has been made successfully"

  } catch (error) {
    console.log(error)
    req.session.error = true
    req.session.errMsg = error
  }
  
  res.redirect('/shop')
})

router.
route('/cancel')
.get(async(req, res, next)=>{
  try{
     const session = stripe.checkout.sessions.retrieve(req.query.session_id)
     const order = await Order.findOneAndRemove({'stripe_id': session.id})

  }
  catch(error){
    console.log(error)
  }
  req.session.error = true
  req.session.errMsg = "Payment cancelled by user"
  res.redirect('/shop')
})


module.exports = router;
