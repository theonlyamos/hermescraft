var express = require('express');
var Category = require('../models/category.js');
var Product = require('../models/product');
const { Page, PageImage, PageSection, PageCarouselItem, CarouselImage, PageLink } = require('../models/page');
var router = express.Router();

router.
route('/').
get(async function(req, res, next) {
  const categories = await Category.find({}).populate('image')
                                  .exec().catch((error)=>console.log(error))
  for (let i = 0; i < categories.length; i++){
    const category = categories[i]
    const link = await PageLink.findById(category.link).populate('text')
                                .exec().catch((error)=>console.log(error))
    category.link = link
    categories[i] = category
  }
  const products = await Product.find({}).populate('images').limit(8).exec();
  let cart = req.session.cart
  if (!cart){
    cart = {}
  }
  let cartTotal = 0
  for (let k in cart){
    cartTotal += Number.parseFloat(cart[k].total)
  }
  const pages = await Page.find({}).catch((error)=>console.log(error));

  let curPage = await Page.findOne({"name": "Home"}).populate("banner")
                          .exec().catch((error)=>console.log(error));

  for (let i = 0; i < curPage.sections.length; i++){
    let section =  await PageSection.findById(curPage.sections[i]).populate('header')
                                    .populate('paragraphs').populate('spans')
                                    .populate('background').populate('images')
                                    .exec().catch((error)=>console.log(error));

    let links = []
    for (let t = 0; t < section.links.length; t++){
      let link =  await PageLink.findById(section.links[t]).populate('text')
                                .exec().catch((error)=>console.log(error))
      links.push(link)
    }
    curPage.sections[i] = section
    curPage.sections[i].links = links
    
    
  }

  if (curPage.carousel){
    for (let i = 0; i < curPage.carousel.length; i++){
      let carousel = await PageCarouselItem.findById(curPage.carousel[i]).populate('header')
                                    .populate('background').populate('description')
                                    .exec().catch((error)=>console.log(error));
      carousel.link =  await PageLink.findById(carousel.link).populate('text')
                                .exec().catch((error)=>console.log(error))
      curPage.carousel[i] = carousel
    }
  }

  res.render('index', { title: 'HermesCraft || Home',
                        curPage,
                        pages,
                        categories,
                        products,
                        cart,
                        cartLength: Object.keys(cart).length,
                        cartTotal,
                        user: req.user
  });
});

router.
route('/contact')
.get(async(req, res, next)=>{
  let cart = req.session.cart
  if (!cart){
    cart = {}
  }
  let cartTotal = 0
  for (let k in cart){
    cartTotal += Number.parseFloat(cart[k].total)
  }
  const pages = await Page.find({}).populate("banner").populate("sections")
                          .exec().catch((error)=>console.log(error));
  const curPage = await Page.findOne({"name": "Contact"}).populate("banner").populate("sections")
                          .exec().catch((error)=>console.log(error));
  const { googleApiKey  } = require('../config');
  res.render('contact', { title: 'HermesCraft || Contact Us',
                          pages,
                          curPage,
                          cart,
                          cartLength: Object.keys(cart).length,
                          cartTotal,
                          user: req.user,
                          googleApiKey
                        })
})

router.
route('/about')
.get(async(req, res, next)=>{
  let cart = req.session.cart
  if (!cart){
    cart = {}
  }
  let cartTotal = 0
  for (let k in cart){
    cartTotal += Number.parseFloat(cart[k].total)
  }
  const pages = await Page.find({}).catch((error)=>console.log(error));

  const curPage = await Page.findOne({"name": "About"}).populate("banner")
                            .exec().catch((error)=>console.log(error));

  for (let i = 0; i < curPage.sections.length; i++){
    let section =  await PageSection.findById(curPage.sections[i])
                                    .populate('header').populate('images')
                                    .populate('paragraphs').populate('spans')
                                    .exec().catch((error)=>console.log(error));
    curPage.sections[i] = section

  }
  res.render('about', {title: 'HermesCraft || About Us',
                        pages,
                        curPage,
                        cart,
                        cartLength: Object.keys(cart).length,
                        cartTotal,
                        user: req.user
                      })
})

router.get('/logout', async (req, res, next) => {
  req.session.destroy();
  res.clearCookie();
  res.redirect('/')
});

module.exports = router;
