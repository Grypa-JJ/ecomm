const express = require('express');
const cartsRepo = require('../repositories/carts');
const router = express.Router();
const productsRepo = require('../repositories/products');
const cartShowTemplate = require ('../views/carts/show')
// Recive a pos request to add an item to a cart
router.post('/cart/products', async (req, res) =>{
   // Figure out the cart

    let cart;
    if(!req.session.cartId) {



        
        cart = await cartsRepo.create({items: []});
        req.session.cartId = cart.id
    
    
    } else {
        cart = await cartsRepo.getOne(req.session.cartId);
    }
    const existingItem = cart.items.find(item => item.id === req.body.productId)
    if (existingItem) {
        existingItem.quantity++
    } else {
        cart.items.push({id: req.body.productId, quantity: 1})
    }
    await cartsRepo.update(cart.id, {
        items: cart.items
    });



    res.redirect('/cart');
});
// Recive a Get request to show all item in a cart
router.get('/cart', async (req, res) => {
    if(!req.session.cartId) {
        return res.redirect('/')
    }

    const cart = await cartsRepo.getOne(req.session.cartId);

    for (let item of cart.items) {
       
         const product = await productsRepo.getOne(item.id);
        
        item.product = product;
    }

    res.send(cartShowTemplate({ items: cart.items }))
});
//Recive a post request to delete an item from a cart
router.post('/cart/products/delete', async (req, res) => {
    const {itemId } = req.body;
    const cart = await cartsRepo.getOne(req.session.cartId);

    const items = cart.items.filter(item => item.id !== itemId);

    await cartsRepo.update(req.session.cartId,{ items });

    res.redirect('/cart');

})
module.exports = router;