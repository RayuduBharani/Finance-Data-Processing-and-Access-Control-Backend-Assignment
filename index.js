const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./DB/db');
const dotenv = require('dotenv');

// Routes
const authRoutes = require("./routes/authRoutes");
const FinancialRoutes = require("./routes/financialRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
dotenv.config();
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "*",
    credentials: true,
}))

// connection to DB
connectDB()

app.get("/", (req, res) => {
    res.send({
        success: "Server is working . . ."
    })
})

// Authentication Routes
app.use("/auth", authRoutes)

// Creating routes for financial data
app.use("/api", FinancialRoutes)

// Creating routes for dashboard data
app.use("/dashboard", dashboardRoutes)

// Catch-all for unmatched routes
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    })
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is Running on port ${PORT} . . .`)
})