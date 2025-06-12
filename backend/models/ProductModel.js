const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Product = new Schema({
    image: {type:String},
    label: {type:String},
    tag: {type:String},
    price: {type:Number},
    discountedPrice: {type:Number},
    isOff:{type:Boolean},
    isNewIn: {type:Boolean},
    fill:{type:String},
    color:{type:String},
},{
    timestamps:true
})

module.exports = mongoose.model('Product', Product)