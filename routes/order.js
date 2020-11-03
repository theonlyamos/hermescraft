const stripe = require('stripe')('sk_test_jLrSf2i1YLL4ZGKRMNY5ZeAn00sWXiuSJW');

const getOrders = async()=>{
  const paymentIntents = await stripe.paymentIntents.list({
    limit: 3,
  });
    console.log(paymentIntents.data.map((p,i)=>p.charges.data))
}

getOrders()
