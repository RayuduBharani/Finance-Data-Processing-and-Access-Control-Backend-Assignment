const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : [true, "Username is required"],
        trim : true,
    },
    email : {
        type : String,
        required : [true, "Email is required"],
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    password : {
        type : String,
        required : [true, "Password is required"],
        minlength : [6, "Password must be at least 6 characters"]
    },
    role : {
        type : String,
        enum : ['viewer', 'analyst', 'admin'],
        default : "viewer"
    },
    status : {
        type : String,
        enum : ['active', 'inactive'],
        default : "active"
    }
}, { timestamps : true })


// user model
const UserModel = mongoose.model("User", userSchema)
module.exports = UserModel;