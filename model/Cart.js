const mongoose = require('mongoose');

// Define the schema for the cart item
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  }
});

// Define the schema for the shopping cart
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema], // Array of cart items
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Create the model for the shopping cart
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;