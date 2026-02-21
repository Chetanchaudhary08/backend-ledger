const mongoose=require("mongoose");

function connectTodb(){
    mongoose.connect(process.env.MONGO_URL)
    .then(()=>{
        console.log("database connected");
    }).
    catch(err=>{
        console.log("error connecting to db ")
        process.exit(1);
    })
}

module.exports=connectTodb;