import jwt from "jsonwebtoken"
import {envConfig} from "../config/config"


const generateToken =(userId:string)=>{
    // token generation
    const token = jwt.sign({userId:userId} ,envConfig.jwt as string,{
        expiresIn:envConfig.expiresIn
    }

    )
    return token
}
export default generateToken