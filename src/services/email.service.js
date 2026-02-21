const nodemailer = require("nodemailer");

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  service:'gmail',
  auth: {
    type:'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

transporter.verify((error,success)=>{
    if(error){
        console.log('error connecting to email server',error);
    }else{
        console.log('email server is ready to send messages');
    }
});

const sendEmail= async (to , subject , text, html ) => {
  try{
    const info = await transporter.sendMail({
        from,
        to,
        subject,
        text, // Plain-text version of the message
        html, // HTML version of the message
  });

  console.log("Message sent:", info.messageId);
  console.log('preview url:%s',nodemailer.getTestMessageUrl(info));
}catch(error){
    console.log('error sending email',error);
}
};

async function sendregisterationemail(userEmail,name ){
    const subject ='welcome to backend ledger';
    const text=`hello ${name},\n\nthank u for registring at backend ledger. we are happy to have u as our user `;
    const html=`<p>hello ${name},</p><p>thank u for registring at backend ledger`;
    await sendEmail(userEmail,subject,text,html);
}

async function sendTransactionEmail(userEmail,name,amount,toAccount){
    const subject="Regarding your payment "
    const text =`Hello ${name},\n\n your payment of amount ${amount} is successful.for more queries u can email us `;
    const html =`<p> hello ${name},</p><p>your payment of amount ${amount} is successful.for more queries u can email us`;
    await sendEmail(userEmail,subject,text,html)
}
async function sendTransactionFailureEmail(userEmail,name,amount,toAccount){
    const subject="Payment Failure "
    const text =`Hello ${name},\n\n your payment of amount ${amount} has been failed .for more queries u can email us `;
    const html =`<p> hello ${name},</p><p>your payment of amount ${amount} has been failed .for more queries u can email us`;
    await sendEmail(userEmail,subject,text,html)
}
module.exports=sendregisterationemail;
module.exports=transporter;
module.exports= sendEmail;
module.exports=sendTransactionEmail;
module.exports=sendTransactionFailureEmail;