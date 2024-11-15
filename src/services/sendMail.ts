import nodemailer from "nodemailer"
import { envConfig } from "../config/config"

interface Idata{
    to:string,
    subject:string,
    text:string,
}
const sendMail =async (data:Idata)=>{
    let transporter = nodemailer.createTransport({
        service:'gmail',
        auth :{
            user:envConfig.email,
            pass:envConfig.emailPassword
        }
    })

    const mailOptions ={
        from:"Anupa Baral<baralshilpa2@gmail.com>",
        to:data.to,
        subject:data.subject,
        text:data.text
    }
    try{
        await transporter.sendMail(mailOptions)
    }
    catch(err){
        console.log(err)
    }
}
export default sendMail