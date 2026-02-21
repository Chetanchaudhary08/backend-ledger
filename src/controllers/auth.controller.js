const usermodel =require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailservice=require("../services/email.service");
const tokenBlackListModel=require("../models/blackList.model");


async function userregistercontroller(req,res){
    const {email,password,name}=req.body;

    const isexixtes=await usermodel.findOne({
        email:email
    })
    if(isexixtes){
        return res.status(422).json({
            message:"already exists",
            status:"failed"
        })
    }

    const user=await usermodel.create({
        email,password,name
    })

    const token =jwt.sign({userId:user._id},process.env.JWT_SECRET);
    res.cookie("token",token);
    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })

    await emailservice.sendRegistrationEmail(user.email,user.name);
}

//login controller
//post:- api/auth/login

async function userlogincontroller(req,res){
    const {email,password}=req.body;
    const user=await usermodel.findOne({email}).select("+password");

    if(!user){
            return res.status(503)({
                message:"user does not exist "
            })
    }
    const isvalidpassword= await user.comparePassword(password);
    if(!isvalidpassword){
            return res.status(401)({
                message:"not a valid password "
            })
    }
    const token =jwt.sign({userId:user._id},process.env.JWT_SECRET);
    res.cookie("token",token);
    res.status(200).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })
}


async function userlogoutcontroller(req,res){
    const token =req.cookies.token||req.headers.authorization?.split(" ")[1];

    if (!token ){
        return res.status(200).json({
            message:"user logged out successfully "
        })  
    }

    await tokenBlackListModel.create({
        token:token
    })

    res.clearCookie("token");

    return res.status(200).json({
        message:"user logged out successfully"
    })
} 



module.exports={
    userregistercontroller,
    userlogincontroller,
    userlogoutcontroller,
}