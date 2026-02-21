const express=require("express");
const { userregistercontroller, userlogincontroller, userlogoutcontroller } = require("../controllers/auth.controller");
const router=express.Router();


//post--> /api/auth/register
router.post("/register",userregistercontroller)
router.post("/login",userlogincontroller)


//-post /api/auth/logout
router.post('/logout',userlogoutcontroller)


module.exports=router;
