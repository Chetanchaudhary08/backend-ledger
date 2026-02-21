const accountModel = require("../models/account.model");
const accountmodel=require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const transactionModel = require("../models/transaction.model");
const emailservice=require("../services/email.service");
const mongoose=require("mongoose")
/** 
 * create a new transaction by following these 10 steps 
 * 1. validate request
 * 2.validate idempotency key
 * 3. check account status
 * 4.derive sender balance from ledger
 * 5.create transaction(pending)
 * 6.create debit ledger entry 
 * 7. create credit ledger enrty
 * 8. mark transaction completed 
 * 9.commit mongodb session 
 * 10.send email notification 
 * **/


async function createtransaction(req,res){

    const {fromAccount,toAccount,amount,idempotencyKey}=req.body;
    if(!fromAccount||!toAccount||!amount||!idempotencyKey){
        return res.status(400).json({
            message:"fromAccount,toAccount,amount,idempotencyKey"
        })
    }
    const fromUserAccount=await accountModel.findOne({
        _id:fromAccount,
    })
    const toUserAccount=await accountModel.findOne({
        _id:toAccount,
    })

    if(!fromUserAccount||!toUserAccount){
        return res.status(400).json({
            message:"invalid fromaccount or toaccount "
        })
    }

    //validate idepotency key

    const isTransactionAlreadyExists=await transactionModel.findOne({
        idempotencyKey:idempotencyKey
    })
    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status==="COMPLETED"){
            return res.status(200).json({
                message:"transaction already processed",
                transaction:isTransactionAlreadyExists
            })
        }
        if(isTransactionAlreadyExists.status==="PENDING"){
            return res.status(200).json({
                message:"transaction is still being processed",
            })
        }
        if(isTransactionAlreadyExists.status==="FAILED"){
            return res.status(200).json({
                message:"transaction processing failed , please tryv again",
            })
        }
        if(isTransactionAlreadyExists.status==="REVERSED"){
            return res.status(200).json({
                message:"transaction reversed , please try ",
            })
        }
    }

    //check account status

    if(fromUserAccount.status!=="ACTIVE"||toUserAccount.status!=="ACTIVE"){
        return res.status(400).json({
            message:"both fromaccount and to account must be active for a transaction"
        })
    }

    //derive sender balance from ledger 

    const balance=await fromUserAccount.getbalance();
    if(balance<amount){
        return res.status(400).json({
            message:`insufficient balance, current balance is ${balance},requested amount is ${amount}`
        })
    }
    let transaction;
    try{
    //create transaction 
    const session = await mongoose.startSession();
    session.startTransaction();
//little change 
    transaction=(await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    }],{session}))[0];

    const debitLedgerEntry=await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT"
    }],{session})

    // await(()=>{
    //     return new Promise((resolve)=>setTimeout(resolve,100*1000));
    // })()

    const creditLedgerEntry=await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT"
    }],{session})

    await transactionModel.findOneAndUpdate(
        {_id:transaction._id},
        {status:"COMPLETED"},
        {session}
    )

    await session.commitTransaction();
    session.endSession();
    }catch(err){
        await transactionModel.findOneAndUpdate(
            {idempotencyKey:idempotencyKey},
            {status:"FAILED"}
        )
        return res.status(500).json({
            message:"Transaction failed due to internal error",
            error :error.message,
        })
    }
    //send email notification 

    await emailservice.sendTransactionEmail(req.user.email,req.user.name,amount , toAccount)

    return res.status(201).json({
        message:"Transaction completed successfully",
        transaction :transaction
    })
}


async function createInitialFundsTransaction(req,res){
    const {toAccount,amount,idempotencyKey}=req.body;

    if(!toAccount||!amount||!idempotencyKey){
        return res.status(400).json({
            message:"to account,amount and idempotencykey are required"
        })
    }

    const toUserAccount=await accountModel.findOne({
        _id:toAccount,
    })
    if(!toAccount){
        return res.status(400).json({
            message:"invalid account"
        })
    }
    const fromUserAccount=await accountModel.findOne({
        systemUser:true,
        user:req.user._id,
    })
    if(!fromUserAccount){
        return res.status(400).json({
            message:"System user account not found "
        })
    }
    const transaction=new transactionModel.create({
        fromAccount:fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING",
    },{session})
    const debitLedgerEntry=await ledgerModel.create([{
        account:fromUserAccount._id,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT"
    }],{session})
     const creditLedgerEntry=await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT"
    }],{session})

    transaction.status="COMPLETED"
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        message:"initial funds transaction completed successfully ",
        transaction:transaction 
    })
}
module.exports={
    createtransaction,
    createInitialFundsTransaction
};