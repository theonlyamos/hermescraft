var express = require('express');
var Product = require('../models/product');
var Category = require('../models/category');
var Cart = require('../models/cart');
const { Page, PageLink } = require('../models/page');

const { stripePublicKey } = require('../config');


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
  const pages = await Page.find({}).populate("banner").populate("sections")
                          .exec().catch((error)=>console.log(error));
  const curPage = await Page.findOne({"name": "Cart"}).populate("banner").populate("sections")
                          .exec().catch((error)=>console.log(error));
  res.render('cart', {title: 'HermesCraft || Cart',
                      categories: categories,
                      pages,
                      curPage,
                      stripePublicKey: stripePublicKey,
                      cart: cart,
                      cartTotal: cartTotal,
                      cartLength: Object.keys(cart).length,
                      user: req.user
                     });
})

router
.route('/')
.post(async(req, res, next)=>{
  try {
    if (!req.session.cart){
      req.session.cart = {}
    }
    const product = await Product.findById(req.body.product).populate('images').select('name price images stripe_price_id').exec();
    const quantity = Number.parseFloat(req.body.quantity)
    const item = {id: req.body.product,
                  name: product.name,
                  price: product.price,
                  quantity: quantity,
                  total: quantity*product.price,
                  image: product.images[0].name,
                  stripe_price_id: product.stripe_price_id
                }
    console.log(item)
    if (Object.hasOwnProperty(req.body.product, req.session.cart)){
      req.session.cart[req.body.product].quantity += Number.parseFloat(req.body.quantity)
      req.session.cart[req.body.product].price = req.session.cart[req.body.product].quantity * product.price
    }
    else{
      req.session.cart[req.body.product] = item
    }

    if (req.user){
      let dbCart = await Cart.findOne({"user": req.user._id})
      if (dbCart){
        dbCart.items = req.session.cart
        await dbCart.save()
      }
      else{
        dbCart = new Cart({
          user: req.user._id, 
          items: req.session.cart
        })
    
        await dbCart.save()
      }
    }

    return res.json({success: true, item: item, cart: req.session.cart});
  }
  catch(error){
    console.log(error)
    return res.json({success: false, error, cart: req.session.cart});
  }
})

router
.route('/remove')
.get(async(req, res, next)=>{
  try {
    const itemId = req.query.item
    delete(req.session.cart[itemId])
    if (req.user){
      let dbCart = await Cart.findOne({"user": req.user._id}).exec()
      if (dbCart){
        dbCart.items = req.session.cart
        await dbCart.save()
      }
      else{
        dbCart = new Cart({
          user: req.user._id, 
          items: req.session.cart
        })
    
        await dbCart.save()
      }
    }
  }
  catch(error){
    console.error(error);
    req.session.error = true
    req.session.errMsg = error
  }
  
  res.redirect('/cart');
})

module.exports = router;
