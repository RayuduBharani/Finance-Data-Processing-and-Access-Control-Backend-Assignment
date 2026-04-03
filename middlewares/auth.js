const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Authentication Middleware for multiple roles management
const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: "No token provided, authorization denied"
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "bharani");
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: "Invalid token payload"
            });
        }

        const user = await userModel.findById(userId).select("_id username email role status");

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "User not found"
            });
        }

        req.user = user;

        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                error: "Invalid token payload"
            });
        }

        next();
    } 
    catch (error) {
        return res.status(401).json({
            success: false,
            error: "Invalid token, authorization denied"
        });
    }
}

// authorizeRoles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized user context"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: "You do not have permission to access this resource"
            });
        }
        next();
    };
}

module.exports = {
    authMiddleware,
    authorizeRoles
};