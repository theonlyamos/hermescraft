var express = require('express');
var Product = require('../models/product');
var Category = require('../models/category');
const {stripeSecretKey} = require('../config');
const stripe = require('stripe')(stripeSecretKey)
var router = express.Router();
router.use(express.json())

router
.route('/stripe')
.get(async(req, res, next)=>{
  console.log(req.body)
    res.json({status: 'success'})
})
.post(async(req, res, next)=>{
    console.log(req.body)
    res.json({status: 'success'})
})

module.exports = router;
