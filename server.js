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
app.use("/project", router)

// Database connection with proper event handling
let isConnected = false 

const ConnectDB = async () => {
    try {
        if (!isConnected) {
            await mongoose.connect(process.env.MONGO_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000, 
                socketTimeoutMS: 45000, 
            })
            console.log("MongoDB connected successfully")
            isConnected = true
        }
    } catch (error) {
        console.error("MongoDB connection error:", error)
        isConnected = false
        throw error 
    }
}

// Connection event handlers
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected')
    isConnected = false
})

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err)
    isConnected = false
})


app.use(async (req, res, next) => {
    try {
        if (!isConnected) {
            await ConnectDB() 
        }
        next()
    } catch (error) {
        res.status(500).json({ 
            error: "Database connection failed",
            details: error.message 
        })
    }
})

// testing api
app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>")
})


export default app