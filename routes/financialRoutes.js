const express = require('express');
const router = express.Router();
const { getFinancialData, createFinancialEntry, updateFinancialEntry, deleteFinancialEntry, getFinancialEntry, filterRecords, SearchRecords } = require("../controllers/financialController");
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');
const { apiLimiter } = require('../middlewares/rateLimit');

// Getting financial data
router.get("/financial-data", apiLimiter ,authMiddleware, authorizeRoles("admin", "viewer", "analyst"), getFinancialData)

// getting single financial entry
router.get("/financial-data/:id", apiLimiter, authMiddleware, authorizeRoles("admin", "viewer", "analyst"), getFinancialEntry)

// creating financial report
router.post("/create-report", apiLimiter, authMiddleware, authorizeRoles("admin"), createFinancialEntry)

// Updating financial entry
router.put("/update-report/:id", apiLimiter, authMiddleware, authorizeRoles("admin"), updateFinancialEntry)

// Deleting financial entry
router.delete("/delete-report/:id", apiLimiter, authMiddleware, authorizeRoles("admin"), deleteFinancialEntry)

// Filtering records based on criteria such as date, category, or type
router.get("/filter-records", apiLimiter, authMiddleware, authorizeRoles("admin", "viewer", "analyst"), filterRecords);

// Search functionality to find specific financial entries based on keywords or amounts
router.get("/search-records", apiLimiter, authMiddleware, authorizeRoles("admin", "viewer", "analyst"), SearchRecords);

module.exports = router;