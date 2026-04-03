const bcrypt = require('bcryptjs');
const userModel = require("../models/userModel")
const jwt = require('jsonwebtoken');

// Register User
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({
            error: "All fields are required"
        })
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: "Invalid email format"
        })
    }
    if (password.length < 6) {
        return res.status(400).json({
            error: "Password must be at least 6 characters long"
        })
    }
    if (role !== "admin" && role !== "analyst" && role !== "viewer") {
        return res.status(400).json({
            error: "Invalid role specified"
        })
    }
    const existingUser = await userModel.findOne({ email })
    if (existingUser) {
        return res.status(400).json({
            error: "User already exists with this email"
        })
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new userModel({
            username,
            email,
            password: hashedPassword,
            role: role || "viewer"
        })
        await newUser.save()
        return res.status(201).json({
            success: "User registered successfully",
            user: newUser
        })
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            error: "Email and password are required"
        })
    }
    try {
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                error: "Invalid password please try again"
            })
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role, status: user.status }, process.env.JWT_SECRET, { expiresIn: "1h" })
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 
        });
        return res.status(200).json({
            success: "User logged in successfully",
            token: token
        })
    }
    catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}

module.exports = {
    registerUser,
    loginUser
}