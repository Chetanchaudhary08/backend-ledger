const express=require('express');
const {authmiddleware} = require('../middleware/auth.middleware');
const {createAccountController} = require('../controllers/account.controller');
const {getUserAccountsController}=require('../controllers/account.controller');
const {getAccountBalanceController}=require('../controllers/account.controller');

const router=express.Router();

router.post("/",authmiddleware,createAccountController);
/*- GET /api/accounts
-GET all accounts of the logged in user 
- protected route 
*/
router.get('/',authmiddleware,getUserAccountsController)


// -GET /api/accounts/balance/:accountId

router.get("/balance/:accountId",authmiddleware,getAccountBalanceController);
module.exports=router;