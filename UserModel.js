const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    nameUser: {
        type: String,
    },
    emailUser: {
        type: String,
    },
    passUser: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
})
const UserModel = new mongoose.model('user', UserSchema);
module.exports = UserModel;