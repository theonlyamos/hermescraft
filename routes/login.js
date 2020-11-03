const express = require('express');
const passport = require('passport');
const Cart = require('../models/cart');
const router = express.Router();

router.
route('/').
get((req, res, next)=>{
    error = req.session.error
    errMsg = req.session.errMsg
    msgTitle = req.session.msgTitle
    message = req.session.message
    req.session.error = false
    req.session.errMsg = undefined
    req.session.msgTitle = undefined
    req.session.message = undefined
    res.render('login', {title: "HermesCraft || Login",
                        error, errMsg, msgTitle, message
    })
}).
post(async(req, res, next)=>{
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.log(err)
            return res.redirect('/login')
        }
    
        if (!user) {
            req.session.error = true
            req.session.errMsg = info.message
            return res.redirect('/login');
        }
        req.logIn(user, async function(err) {
          if (err) {
                console.log(err)
                return res.redirect('/login')
          }
          let cart = await Cart.findOne({"user": req.user._id}).exec()
          if (cart){
            req.session.cart = cart.items
          }
          else {
            cart = new Cart({
                user: req.user._id, 
                items: req.session.cart
              })
          
              await cart.save().catch((error)=>console.log(error))
          }
          return res.redirect('/shop');
        });
    
    })(req, res, next);
})
module.exports = router;
