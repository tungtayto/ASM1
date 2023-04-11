const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
    nameProduct: {
        type: String,
    },
    priceProduct: {
        type: Number,
    },
    color: {
        type: String
    },
    typePr: {
        type: String,
    },
})
const ProductModel = new mongoose.model('product', ProductSchema);
module.exports = ProductModel;