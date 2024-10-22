import { Request, Response } from "express";
import User from "../database/Models/userModel";
import sequelize from "../database/connection";
import bcrypt from 'bcrypt';
import generateToken from "../services/generateToken";
class UserController {
    static async register(req: Request, res: Response) {
        //incoming user data receive 
        const { username, email, password } = req.body
        if (!username || !email || !password) {
            res.status(400).json({
                message: "Please provide username,email,password"
            })
            return
        }
        // data --> users table ma insert garne 
        await User.create({
            username,
            email,
            password: bcrypt.hashSync(password, 10)

        })
        // await sequelize.query(`INSERT INTO users(id,username,email,password) VALUES (?,?,?,?)`, {
        //     replacements : ['b5a3f20d-6202-4159-abd9-0c33c6f70487', username,email,password], 
        // })
        res.status(201).json({
            message: "User registered successfully"
        })
    }

    static async login(req: Request, res: Response) {

        // accept incoming data -->email ,password

        const { email, password } = req.body
        if (!email || !password) {
            res.status(400).json({
                message: "please provide username ,email,password"
            })
            return
        }
        // check email exist or not
        const [user] = await User.findAll({
            where: {
                email: email
            }
        })//findAll --> data returns in array if not found returns []

        // if yes check password
        if(!user){
            res.status(404).json({
                message:"No user with that email 😭"
            })
        }
        else{
           const isEqual= bcrypt.compareSync(password,user.password)//arguments:plane password ,hashed password
           if(!isEqual){
            res.status(401).json({

                message:"Invalid password 😭"
           })}
           else{
            // if password is correct then generate token
         const token=   generateToken(user.id)
            res.status(200).json({
                message:"Logged in successfully",
                token
            })
           
           }


        }


        // if password also matches then token generation (jwt)

    }
}
export default UserController