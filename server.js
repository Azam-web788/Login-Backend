import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import router from "./routes/router.js"
import cors from "cors"
dotenv.config()
const app = express()

// policies
app.use(express.json())
app.use(cors())

// middleware
app.use("/project" , router)

// database connection
let connection = false
const ConnectDB = async () => {
    try {
        connection = true
         await mongoose.connect(process.env.MONGO_URL)
        console.log("mongodb connected succcessfully");
    } catch (error) {
        console.log(error);
    }
}
// condition of database
app.use(async (req , res , next) =>{
    if (!connection) {
        await ConnectDB()
    }
    next()
})
// testing api
app.get("/" , (req , res) =>{
    res.send("<h1>Hello world</h1>")
})