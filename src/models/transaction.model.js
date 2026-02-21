const mongoose=require("mongoose");

const transactionSchema=new mongoose.Schema({

    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"transaction must be associated with a from account"],
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"transaction must be associated with a to account"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            messages:"status either pending , completed, failed or reversed "
        },
        default:"PENDING"
    },
    amount:{
        type:Number,
        required:[true,"amonut is needed to crete a transaction"],
        min:[0,"transaction amount can not be negative "]
    },
    idempotencyKey:{
        type:String,
        required:[true,"idempotency key required to  create a transaction"],
        index:true,
        unique:true
    }
},{
    timestamps:true
})
const transactionModel=mongoose.model("transaction",transactionSchema);
module.exports=transactionModel;