const express = require('express');
const { dashboardSummary } = require('../controllers/dashboardController');
const { authMiddleware, authorizeRoles } = require('../middlewares/auth');
const { dashboardLimiter } = require('../middlewares/rateLimit');
const router = express.Router();

router.get("/summary", dashboardLimiter ,authMiddleware , authorizeRoles("admin" , "analyst"),dashboardSummary)

module.exports = router;