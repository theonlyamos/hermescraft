const filterByCategory = (e)=>{
  const category = $(e).val()
  window.location.href= `/shop?category=${category}`
}

const addToCart = (id, quantity=1)=>{
  $.ajax({
    url: '/cart',
    method: 'POST',
    data: {product: id, quantity: quantity},
    success: (result)=>{
      swal(result.item.name, "has been added to cart !", "success");
      
      let cartItems = ""
      let cartTotal = 0
      const cartLength = Object.keys(result.cart).length
      for (let k in result.cart){
        let item = result.cart[k]
        cartTotal += Number.parseFloat(item.total)
        let line = `<li class='header-cart-item'>
                      <div class='header-cart-item-img'>
                        <img src='/images/products/${item.image}' alt="IMG">
                      </div>
                      <div class='header-cart-item-txt'>
                        <a class='header-cart-item-name' href="#">
                          ${item.name}
                        </a>
                        <span class='header-cart-item-info'>
                            ${item.quantity} x \$${item.price}
                        </span>
                    </li>`
        cartItems += line
      }
      $("#cart-header .header-cart-wrapitem").html(cartItems)
      $(".cart-total").text(cartTotal)
      $(".cart-length").text(cartLength)
    },
    error: (e)=>{
      console.log(e)
    }
  })
}


$(()=>{
  
})
