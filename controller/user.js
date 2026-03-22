import User from "../model/UserModel.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

async function Register(req, res) {
    try {
        const { firstName, lastName, email, password } = req.body;
        const emailRegix = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        if (!emailRegix.test(email)) {
            return res.status(400).json({
                message: "Invalid email",
                success: false
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "password must be at least 6 characters",
                success: false
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "user already existed",
                success: false
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        let user = new User({
            firstName,
            lastName,
            email,
            password: hashPassword
        });

        await user.save();

        res.status(200).json({
            message: "user registered successfully",
            user,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

async function Login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({
                message: "incorrect email or password",
                success: false
            });
        }

        const isPassword = await bcrypt.compare(password, existingUser.password);

        if (!isPassword) {
            return res.status(400).json({
                message: "incorrect email or password",
                success: false
            });
        }

        const token = jwt.sign(
            {
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                email: existingUser.email
            },
            process.env.SECRET_KEY,
            {
                expiresIn : '1d'
            }
        );

        res.status(200).json({
            message: "user login successfully",
            user: {
                _id: existingUser._id,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                email: existingUser.email
            },
            token,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export { Register, Login };