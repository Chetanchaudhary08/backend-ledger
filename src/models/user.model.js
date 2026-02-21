const { default: mongoose } = require("mongoose");
const bcrypt=require("bcrypt")


const userschema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"email required"],
        trim:true,
        lowercase:true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email address'],
        unique:[true,"email already exists"]
    },
    name:{
        type:String,
        required:[true,"name is required"]
    },
    password:{
        type:String,
        required:[true,"password is required"],
        minlength:[6,"password is of atleast 6 charatacer"],
        select:false,
    },
    systemUser:{
        type:Boolean,
        default:false,
        immutable:true ,
        select:false
    }
},{
    timestamps:true
})

userschema.pre("save",async function(){
        if(!this.isModified("password")){
            return next()
        }
        const hash = await bcrypt.hash(this.password,10)
        this.password=hash
        return next()
})

userschema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password  )
}