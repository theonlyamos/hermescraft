const filterByCategory = (e)=>{
  const category = $(e).val()
  window.location.href= `/admin/products?category=${category}`
}
$(()=>{
  
})