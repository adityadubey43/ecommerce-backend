const { model } = require('mongoose');
const Product = require('../model/products');
const Purchase = require('../model/purchase');
const Cart = require('../model/Cart');
const { ObjectId } = require('mongodb');

module.exports.product_post = (req, res) => {
    const product = new Product(req.body);

    product.save()
        .then(savedProduct => {
            res.status(201).json(savedProduct);
        })
        .catch(error => {
            console.error('Error saving product:', error);
            res.status(500).json({ error: 'Failed to save product' });
        });
    console.log('product added');
}
module.exports.product_get = (req, res) => {
    console.log(req.url);
    Product.find()
        .then(products => {
            res.status(200).json(products);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        });
}
module.exports.productdetails_get = (req, res) => {
    console.log("inside product details", req.url);
    const id = req.params.productid;

    Product.findById(id)
        .then((result) => {
            console.log(result)
            res.status(200).json(result);
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.createPurchase_post = (req, res) => {
    // Extract data from the request body
    console.log(req.body);
    const { userId, productId, totalPrice, quantity,transactionID,duration} = req.body;
    console.log(userId, productId, totalPrice, quantity,transactionID,duration);
    currentDate = new Date();
    console.log(currentDate);
    let endDate = new Date(currentDate);
    endDate.setMonth(currentDate.getMonth() + duration);
    console.log(endDate);

    // Create a new purchase record
    const purchase = new Purchase({
        user: userId,
        product: productId,
        totalPrice,
        quantity,
        transactionID,
        duration,
        endDate
    });

    // Save the purchase record to the database
    purchase.save()
        .then((savedPurchase) => {
            res.status(201).json({ message: 'Purchase created successfully', purchase: savedPurchase });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        });
};
exports.createPurchase_get = (req, res) => {
    const authHeader = req.headers.authorization;
// console.log("form data",authHeader);
if (authHeader) {
    const user = authHeader.split(' ')[1];
    console.log("UserID extracted from Authorization Header:", user);
    Purchase.find({user})
    .populate('product')
    .then((result) => {
        if (!result) {
            return res.status(404).json({ error: 'Purchase not found' });
        }
        // console.log("Purchase Document:", result);
        
        res.status(200).json(result);
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
    console.log("Inside create purchase for user ID:", user);
}
}

exports.addtocart_post = (req,res)=>{
    const { productId, userId, quantity } = req.body;

    // Find the user's cart or create a new one if it doesn't exist
    Cart.findOne({ userId })
        .then(cart => {
            if (!cart) {
                cart = new Cart({ userId, items: [] });
            }

            // Check if the product already exists in the cart
            const existingItemIndex = cart.items.findIndex(item => item.productId.equals(productId));

            if (existingItemIndex !== -1) {
                // If product already exists, update its quantity
                cart.items[existingItemIndex].quantity += quantity;
            } else {
                // If product doesn't exist, add it to the cart
                cart.items.push({ productId, quantity });
            }

            // Save the updated cart
            return cart.save();
        })
        .then(() => {
            res.status(201).json({ message: 'Item added to cart successfully' });
        })
        .catch(error => {
            console.error('Error adding item to cart:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
}
module.exports.cart = (req,res)=>{
    const authHeader = req.headers.authorization;
    // console.log("form data",authHeader);
    if (authHeader) {
        const user = authHeader.split(' ')[1];
    
        Cart.find({ userId: user }) // Assuming userId is the field representing the user's ID
          .populate('items.productId')
          .then(result => {
            if (!result) {
              // If cart not found, return empty array
              res.status(404).json({ message: 'Cart not found' });
            } else {
              // If cart found, return cart items
              
              const cart = result[0].items
            //   console.log(cart)
              res.status(200).json(cart);
            }
          })
          .catch(error => {
            console.error('Error retrieving cart items:', error);
            res.status(500).json({ error: 'Cart is empty' });
          });
      } else {
        res.status(400).json({ error: 'Authorization header not provided' });
      }
}

module.exports.deleteCartItem_post = (req,res)=>{
    console.log("delete")
    const { productId, userId } = req.body;

    // Find the user's cart
    Cart.findOne({ userId })
        .then(cart => {
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            // Check if the product exists in the cart
            const existingItemIndex = cart.items.findIndex(item => item.productId.equals(productId));

            if (existingItemIndex !== -1) {
                // Remove the item from the cart
                cart.items.splice(existingItemIndex, 1);

                // Save the updated cart
                return cart.save().then(() => {
                    res.status(200).json({ message: 'Item removed from cart successfully' });
                });
            } else {
                res.status(404).json({ message: 'Item not found in the cart' });
            }
        })
        .catch(error => {
            console.error('Error removing item from cart:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
}
