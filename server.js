import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "./routes/router.js";
import cors from "cors";

dotenv.config();

const app = express();

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function ConnectDB() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is missing in .env");
    }

    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      cached.promise = mongoose
        .connect(process.env.MONGO_URL, {
          bufferCommands: false,
        })
        .then((mongooseInstance) => {
          console.log("MongoDB Connected");
          return mongooseInstance;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;

  } catch (error) {
    console.error("DB CONNECTION ERROR:", error.message);
    throw error; // ✅ bas ye hi correct fix hai
  }
}

// Middleware
app.use(express.json());
app.use(cors());

// DB middleware
app.use(async (req, res, next) => {
  try {
    await ConnectDB();
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Database connection failed",
      success: false,
    });
  }
});

// Routes
app.use("/project", router);

app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>");
});

export default app;