const express = require('express');
const passport = require('passport');
const router = express.Router();
const {stripeSecretKey} = require('../config');
const stripe = require('stripe')(stripeSecretKey)

const User = require('../models/user');

router.
route('/').
get((req, res, next)=>{
    error = req.session.error
    errMsg = req.session.errMsg
    msgTitle = req.session.msgTitle
    message = req.session.message
    req.session.error = false
    delete(req.session.errMsg)
    delete(req.session.msgTitle)
    delete(req.session.message)
    res.render('register', {title: "HermesCraft || Registration",
                            error, errMsg, msgTitle, message
    })
}).
post(async(req, res, next)=>{
    try {
        if (req.body.password !== req.body.cpassword){
            req.session.error = true
            req.session.errMsg = "Passwords do not match"
            return res.redirect("/register")
        }

        if (req.body.password.length < 6){
            req.session.error = true
            req.session.errMsg = "Password must be atleast 6 characters long"
            return res.redirect('/register')
        }

        delete(req.body.cpassword);
        
        let user = await User.register(new User(req.body), req.body.password)

        const customer = await stripe.customers.create({
            email: req.body.username,
            name: req.body.first_name+' '+req.body.last_name,
            phone: req.body.phone
        })	

        user = await User.findById(user._id)
        user.stripe_id = customer.id
        user = await user.save()
        console.log(user)

        req.session.message = "Registration Successful"
        res.redirect('/login')
    }
    catch(error){
        console.log(error)
        console.log(Object.keys(error))
        req.session.error = true
        req.session.errMsg = "Error during registration"
        res.redirect('/register')
    }

		
	
})

module.exports = router;
