import User from "../model/UserModel.js"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
dotenv.config()
async function Register(req , res) {
    try {
        const {firstName , lastName , email , password} = req.body
        const emailRegix = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (!firstName || !lastName || !email || !password) {
           return res.status(405).json({
                message : "All fields are required",
                success : false
            })
        }
        if (!emailRegix.test(email)) {
           return res.status(404).json({
                message : "Invalid email",
                success : false
            })
        }
            if (password.length < 6) {
              return res.status(409).json({
                    message : "password must be at least 6 characters",
                    success : false
                })
            }
            const existingUser = await User.findOne({email})
            if (existingUser) {
               return res.status(403).json({
                    message : "user already existed",
                    success : false
                })
            }
            const hashPassword = await bcrypt.hash(password , 10)
            let user = User({
                firstName,
                lastName,
                email,
                password : hashPassword
            })
            await user.save()
            res.status(200).json({
                message : 'user registered successfully',
                user,
                success : true
            })
    } catch (error) {
        console.log(error);
    }
}
async function Login(req , res) {
    try {
        const {email , password} = req.body

        if (!email || !password) {
           return res.status(405).json({
                message : "All fields are required",
                success : false
            })
        }
        
            const existingUser = await User.findOne({email})
            if (!existingUser) {
            res.status(403).json({
                    message : "incorrect email or password",
                    success : false
                })
                console.log("incorrect email");
                return
            }
            const isPassword = await bcrypt.compare(password , existingUser.password)
            if (!isPassword) {
                res.status(404).json({
                    message : "incorrect email or password",
                    success : false
                })
                console.log("incorrect password");
                return
            }
            const token = jwt.sign({firstname : existingUser.firstName , lastname : existingUser.lastName , email : existingUser.email , password : existingUser.password} , process.env.SCERET_KEY)
            console.log("token");
            res.status(200).json({
                message : 'user login successfully',
                existingUser,
                token,
                success : true
            })
    } catch (error) {
        console.log(error);
    }
}

export {Register , Login}