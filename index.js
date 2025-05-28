require('dotenv').config()

const mongoose = require('mongoose')
const config = require('./config.json')
mongoose.connect(process.env.MONGO_URI)

const User = require('./models/UserModel')
const Product = require('./models/ProductModel')
const Cart = require('./models/CartModel')
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { authenticateToken } = require('./utilities')
const saltRounds = 10 // 10 rounds of hashing (in every round it will add some random string)

const Order = require('./models/OrderModel')

app.use(express.json());
app.use(
    cors({
        origin: "*",
        credentials:true
    })
);

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
        return res.status(400).json({ error: true, message: "Email is required" });
    }
    if (!password) {
        return res
            .status(400)
            .json({ error: true, message: "Password is required" });
    }
    const isUser = await User.findOne({ email: email });
    if (isUser) {
        return res.json({ error: true, message: "User already exists" });
    }
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const user = new User({
        email: email,
        password: hashedPassword,
    });
    await user.save();
    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "36000m",
    });
    return res.json({
        error: false,
        user,
        accessToken,
        message: "Registration Successful",
    });
})


app.post('/login', async (req, res) => {
    const { email, password } = req.body
    if (!email) {
        return res.status(400).json({ error: true, message: 'Email is required' })
    }
    if (!password) {
        return res.status(400).json({ error: true, message: 'Password is required' })
    }
    const userInfo = await User.findOne({ email: email })
    if (!userInfo) {
        return res.status(400).json({ error: true, message: 'User not found' })
    }
    const isMatch = bcrypt.compareSync(password, userInfo.password);
    if (userInfo.email === email && isMatch) {
        const user = { user: userInfo };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "36000m",
        });
        return res.json({
            error: false,
            message: "Login Successful",
            email,
            accessToken,
        });
    } else {
        return res.status(400).json({
            error: true,
            message: "Invalid credentials",
        });
    }

})

app.get('/get-user', authenticateToken, async (req, res) => {
    const { user } = req.user
    const userInfo = await User.findOne({ _id: user._id })
    if (!userInfo) {
        res.sendStatus(401)
    }
    return res.json({
        user: {
            email: userInfo.email,
            _id: userInfo._id,
            createdOn: userInfo.createdOn
        },
        message: "User fetched"
    })
})

app.post('/add-product', authenticateToken, async (req, res) => {
    const product = req.body
    if (!product.label) {
        return res.status(400).json({
            error: true,
            message: "Label is required"
        })
    }
    if (!product.discountedPrice) {
        return res.status(400).json({
            error: true,
            message: "Price is required"
        })
    }
    if (!product.tag) {
        return res.status(400).json({
            error: true,
            message: "Tag is required"
        })
    }
    try {
        const image = product.image
        const label = product.label
        const tag = product.tag
        const price = product.price
        const discountedPrice = product.discountedPrice
        const isOff = product.isOff
        const isNewIn = product.isNewIn
        const fill = product.fill
        const color = product.color
        const newProduct = new Product({
            image,
            label,
            tag,
            price,
            discountedPrice,
            isOff,
            isNewIn,
            fill,
            color
        })
        await newProduct.save()
        return res.json({ error: false, product, message: "Product added" })

    } catch (error) {
        return res
            .status(500)
            .json({ error: true, message: "internal server error" });
    }
})

app.get('/get-products', async (req, res) => {
    try {
        const products = await Product.find()
        return res.json({
            error: false,
            products,
            message: "Products fetched successfully"
        })
    } catch (error) {

    }
})

app.get('/search-product', authenticateToken, async (req, res) => {
    const { query } = req.query
    if (!query) {
        return res.status(400).json({ error: true, message: 'Search query is required' })
    }
    try {
        const matchingProducts = await Product.find({
            $or: [
                { label: { $regex: new RegExp(query, "i") } },
                { discountedPrice: isNaN(query) ? null : Number(query) }, 
                { tag: { $regex: new RegExp(query, "i") } }
            ],
        })
        return res.json({
            error: false,
            products: matchingProducts,
            message: "Products retrieved successfully"
        })
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' })
    }
})

// cart management
app.post('/add-to-cart', authenticateToken, async (req, res) => {
    const { productId, quantity } = req.body
    const { user } = req.user
    if (!productId) {
        return res.status(400).json({ error: true, message: 'ProductId is required' })
    }
    if (!quantity) {
        return res.status(400).json({ error: true, message: 'Qunatity is required' })
    }
    try {
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(400).json({ error: true, message: "Product is not present" })
        }
        let cart = await Cart.findOne({ userId: user._id })
        if (!cart) {
            cart = new Cart({
                userId: user._id, items: [{ productId, quantity }]
            })
        }
        else {
            // check if product already exist or not
            const index = await cart.items.findIndex((item) => item.productId.toString() === productId)
            if (index >= 0) {
                // product exists
                cart.items[index].quantity += quantity
            }
            else {
                cart.items.push({ productId, quantity })
            }
        }
        await cart.save()
        res.json({
            error: false,
            cart,
            message: 'Product added to cart'
        })
    } catch (error) {
        return res.status(500).json({ error: true, message: 'Internal server error' })
    }
})

app.delete('/delete-from-cart', authenticateToken, async (req, res) => {
    const { productId } = req.body
    const { user } = req.user
    if (!productId) {
        return res.status(400).json({ error: true, message: 'ProductId is required' })
    }
    try {
        const cart = await Cart.findOne({ userId: user._id })
        if (!cart) {
            return res.status(404).json({ error: true, message: 'Cart does not exist' })
        }
        else {
            const index = cart.items.findIndex((item) => item.productId.toString() === productId)
            if (index >= 0) {
                cart.items.splice(index, 1)
                await cart.save()
                return res.json({ error: false, message: 'Product removed successfully' })
            }
            return res.status(400).json({ error: true, message: 'Product does not exist' })
        }
    } catch (error) {
        return res.status(500).json({ error: true, message: 'Internal server error' })
    }
})

app.get('/get-cart-items', authenticateToken, async (req, res) => {
    const { user } = req.user;
    try {
        const cart = await Cart.findOne({ userId: user._id });
        if (!cart || !cart.items.length) {
            return res.json({
                error: false,
                products: [],
                message: 'Cart is empty',
            });
        }

        // Fetch all products and their quantities in parallel
        const productsWithQuantities = await Promise.all(
            cart.items.map(async (item) => {
                const product = await Product.findById(item.productId);
                if (!product) {
                    return null; 
                }
                return { product, quantity: item.quantity };
            })
        );

        // Filter out any null values (in case of missing products)
        const validProducts = productsWithQuantities.filter(Boolean);

        return res.json({
            error: false,
            products: validProducts,
            message: 'Cart items retrieved successfully',
        });
    } catch (error) {
        console.error(error); 
        return res.status(500).json({ error: true, message: 'Internal server error' });
    }
});


app.put('/update-cart/:productId', authenticateToken, async (req, res) => {
    const productId = req.params.productId
    const { user } = req.user
    const { quantity } = req.body
    try {
        const cart = await Cart.findOne({ userId: user._id })
        if (!cart) {
            return res.status(404).json({ error: true, message: 'Cart does not exist' })
        }
        const index = await cart.items.findIndex((item) => item.productId.toString() === productId)
        if (index >= 0) {
            cart.items[index].quantity = quantity
            await cart.save()
            return res.json({ error: false, message: 'Product quantity updated' })
        }
        return res.status(404).json({ error: true, message: 'Product does not exist' })
    } catch (error) {
        return res.status(500).json({ error: true, message: 'internsl server error' })
    }

})

app.delete('/clear-cart', authenticateToken, async (req, res) => {
    const { user } = req.user
    try {
        const cart = await Cart.findOneAndDelete({ userId: user._id })
        if (!cart) {
            return res.status(404).json({ error: true, message: "Cart does not  exist" })
        }

        return res.json({ error: false, messge: "Cart cleared successfully" })
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error" })
    }
})

// order management
app.post('/create-order', authenticateToken, async (req, res) => {
    const { billingDetails, shippingDetails, paymentDetails, totalPrice } = req.body
    const { user } = req.user
    const userId = user._id
 
    try {
        let cart = await Cart.findOne({ userId: userId })
        const orderedItems = cart.items
        const cartId = cart._id
        if (!cart) {
            console.error('Cart not found for userId:', userId);
            cart = new Cart({ userId, items: [] }); // Customize default cart properties if needed
            await cart.save();
            console.log('New cart created:', cart)
            return res.status(404).json({ error: true, message: 'Cart not found' });
        }
        const newOrder = new Order({
            userId,
            cartId,
            items: orderedItems,
            billingDetails,
            shippingDetails,
            paymentDetails,
            totalPrice
        })
        try {
            await newOrder.save();
            cart.items = []
            await cart.save()
            console.log('Order saved:', newOrder);
        } catch (error) {
            console.error('Error saving order:', error.message);
        }
        return res.json({ error: false, newOrder, message: "Order created successfully" })
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error" })
    }
})

app.get('/get-orders', authenticateToken, async (req, res) => {
    const { user } = req.user;  // Extract user info from the token
    const userId = user._id;

    try {
        // Fetch all orders for the user
        const orders = await Order.find({ userId: userId }).populate({
            path: 'items.productId', // Populate productId in the items array
            model: 'Product' // Specify the Product model
        })

        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: true, message: 'No orders found for this user.' });
        }

        // Respond with the orders data
        return res.json({ error: false, orders });
    } catch (error) {
        console.error('Error fetching orders:', error.message);
        return res.status(500).json({ error: true, message: 'Internal server error' });
    }
});


app.get('/get-order/:orderId', authenticateToken, async (req, res) => {
    const orderId = req.params.orderId
    try {
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ error: true, message: "Order not foujnd" })
        }
        return res.json({ error: false, message: "Order details found", order })
    } catch (error) {
        return res.status(500).json({ error: true, message: "Internal server error" })
    }
})

app.put('/orders/:orderId/cancel', async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: true, message: 'Order not found' });
        }

        if (['Shipped', 'Delivered'].includes(order.orderStatus)) {
            return res.status(400).json({ error: true, message: 'Order cannot be canceled after shipment' });
        }

        order.orderStatus = 'Cancelled';
        await order.save();

        res.status(200).json({ error: false, order, message: 'Order cancelled successfully' });
    } catch (error) {
        res.status(500).json({ error: true, message: "Internal server error" });
    }
});

app.get('/orders/:orderId/track', async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: true, message: 'Order not found' });
        }

        res.status(200).json({
            error: false,
            orderStatus: order.orderStatus,
            trackingInfo: order.trackingInfo || 'Tracking details not available',
        });
    } catch (error) {
        console.error('Error tracking order:', error);
        res.status(500).json({ error: true, message: "Internal server error" });
    }
});


app.post('/checkout', authenticateToken, async (req, res) => {
    const { user } = req.user
    const { email, password } = req.body
    try {
        const userInfo = await User.findOne({ email:email })
        if (!userInfo) {
            return res.status(404).json({ error: true, message: "User not found." })
        }
        const isPasswordValid = await bcrypt.compare(password, userInfo.password)
        if (!isPasswordValid) {
            return res.status(401).json({ error: true, message: "Invalid password" })
        }
        if (user._id.toString() !== userInfo._id.toString()) {
            return res.status(403).json({error: true, message: 'You are not authorized to perform this action.'});
        }
        return res.json({error:false, message:"Details are correct"})

    } catch (error) {

    }
})

app.listen(8000)