const {Router}=require("express");
const {authmiddleware}=require("../middleware/auth.middleware");
const {createtransaction}=require("../controllers/transaction.controller");
const {authSystemUserMiddleware} = require("../middleware/auth.middleware");
const {createInitialFundsTransaction} = require("../controllers/transaction.controller");

const transactionRoutes=Router();
//post - api/transaction
//create a new transation 

transactionRoutes.post("/",authmiddleware,createtransaction);


//post api/transactions/system/initial-funds
//create initial funds transaction from syste user 

transactionRoutes.post("/system/initial-funds",authSystemUserMiddleware,createInitialFundsTransaction);
module.exports=transactionRoutes;