const mongoose=require("mongoose");

const ledgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true ,"ledger must be associted with an account"],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true ,"amount is required for creating a ledger entry"],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true ,"ledger must be associted with an transaction"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"type can be either credit or debit",
        },required:[true,"ledger type is required"],
        immutable:true
    }
})

function preventledgermodification(){
    throw new Error("Ledger entries are immutable and can not be modified or deleted ");

}

ledgerSchema.pre('findOneAndDelete',preventledgermodification);
ledgerSchema.pre('updateOne',preventledgermodification);
ledgerSchema.pre('deleteOne',preventledgermodification);
ledgerSchema.pre('remove',preventledgermodification);
ledgerSchema.pre('deleteMany',preventledgermodification);
ledgerSchema.pre('findOneAndUpdate',preventledgermodification);
ledgerSchema.pre('updateMany',preventledgermodification);
ledgerSchema.pre('findOneAndReplace',preventledgermodification)

const ledgerModel=mongoose.model("ledger",ledgerSchema);

module.exports=ledgerModel;