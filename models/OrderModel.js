const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true,
    },
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
    shippingDetails: {
        fullName: { type: String, required: true },
        streetName: { type: String, required: true },
        houseNo: { type: Number, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        ZIPcode: { type: Number, required: true },
    },
    billingDetails: {
        fullName: { type: String, required: true },
        streetName: { type: String, required: true },
        houseNo: { type: Number, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        ZIPcode: { type: Number, required: true },
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    paymentDetails: {
        method: {
            type: String,
            enum: ['Credit Card', 'Debit Card', 'PayPal','Cash on Delivery'],
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed'],
            default: 'Pending',
        },
    },
    trackingInfo: {
        courierService: { type: String },
        trackingNumber: { type: String },
        estimatedDeliveryDate: { type: Date },
    },
    totalPrice: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
