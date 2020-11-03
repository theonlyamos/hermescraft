var express = require('express');
var Category = require('../models/category');
var ProductImage = require('../models/product-image');
var Product = require('../models/product');
const { Page, PageLink } = require('../models/page');
var router = express.Router();

router.use(express.json())

router
.route('/')
.get(async(req, res, next)=>{
  let result;
  let category = req.query.category
  let page = req.query.page ? req.query.page : 1
  if (!category || category == 'all'){
    result = await Product.paginate({}, {page: page,  populate: 'images'})
    //products = await Product.find({}).populate('images').limit(20).exec();
  }
  else {
    result = await Product.paginate({category: category}, {page: page, populate: 'images'})
    //products = await Product.find({category: category}).populate('images').limit(20).exec();
  }

  const products = result.docs
  const totalDocs = result.totalDocs
  const pagingCounter = result.pagingCounter
  const totalPages = result.totalPages
  const limit = result.limit
  const currentPage = result.page
  
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
  let error = req.session.error
  let errMsg = req.session.errMsg
  let msgTitle = req.session.msgTitle
  let message = req.session.message
  req.session.error = false
  req.session.errMsg = ""
  req.session.msgTitle = ""
  req.session.message = ""

  const pages = await Page.find({}).populate("banner").populate("sections")
                          .exec().catch((error)=>console.log(error));
  const curPage = await Page.findOne({"name": "Shop"}).populate("banner").populate("sections")
                          .exec().catch((error)=>console.log(error));

  res.render('products', { title: 'HermesCraft || Shop',
                        categories,
                        currentCat: category,
                        pages,
                        curPage,
                        products,
                        totalDocs,
                        pagingCounter,
                        totalPages,
                        limit,
                        currentPage,
                        cart,
                        cartTotal,
                        cartLength: Object.keys(cart).length,
                        error,
                        errMsg,
                        msgTitle,
                        message,
                        user: req.user
  });
});

router.
route('/product/:productId')
.get(async(req, res, next)=>{
  let cart = req.session.cart
  if (!cart){
    cart = {}
  }
  let cartTotal = 0
  for (let k in cart){
    cartTotal += Number.parseFloat(cart[k].total)
  }
  const prodId = req.params.productId
  const newdoc = await Product.findById(prodId).populate('images').exec(); 
  const relatedProds = await Product.find({category: newdoc.category}).populate('images').exec();
  
  const pages = await Page.find({}).populate("banner").populate("sections")
                          .exec().catch((error)=>console.log(error));
  const curPage = await Page.findOne({"name": "Shop"}).populate("banner").populate("sections")
                          .exec().catch((error)=>console.log(error));
  return res.render('product', {title: `Shop - ${newdoc.name}`,
                                product: newdoc,
                                related: relatedProds,
                                pages,
                                curPage,
                                cart: cart,
                                cartTotal: cartTotal,
                                cartLength: Object.keys(cart).length
                    })
})

module.exports = router
