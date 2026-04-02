const mongoose = require('mongoose');

const financialSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
        index : true
    },
    amount : {
        type : Number,
        required : true,
    },
    type : {
        type : String,
        enum : ["Income", "Expense"],
        required : true,
    },
    category : {
        type : String,
        required : true,
    },
    date : {
        type : Date,
        required : true,
    },
    notes : {
        type : String,
    },
    status : {
        type : String,
        enum : ['active', 'inactive'],
        default : 'active',
        index : true
    }
}, { timestamps : true })

const FinancialModel = mongoose.model("Financial", financialSchema);

module.exports = FinancialModel;