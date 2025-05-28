const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // Reference to the User
    items: [
        {
            productId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Product', 
                required: true 
            }, // Reference to the Product
            quantity: { 
                type: Number, 
                required: true, 
                min: 1 
            } // Quantity of the product
        }
    ],
}, {
    timestamps:true
});


module.exports = mongoose.model('Cart', cartSchema)
