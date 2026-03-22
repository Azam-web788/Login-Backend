import express from "express"
import {Register, Login } from "../controller/user.js"
let router = express.Router()

router.post("/register" , Register)
router.post("/login" , Login)

export default router