const FinancialModel = require("../models/financialModel");

// Getting financial data for the dashboard
const getFinancialData = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    if (page < 1 || limit < 1) {
        return res.status(400).json({
            success: false,
            error: "Page and limit must be positive integers"
        });
    }
    try {
        const financialData = await FinancialModel.find({ userId: req.user._id , status : "active" })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));
        res.status(200).json({
            success: true,
            data: financialData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// getting single financial entry
const getFinancialEntry = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            success: false,
            error: "Financial entry ID is required"
        });
    }
    try {
        const financialEntry = await FinancialModel.findById(id);
        if (!financialEntry) {
            return res.status(404).json({
                success: false,
                error: "Financial entry not found"
            });
        }
        if (req.user.role !== "admin" && financialEntry.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: "You do not have permission to access this entry"
            });
        }
        
        res.status(200).json({
            success: true,
            data: financialEntry
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Creating new financial entry
const createFinancialEntry = async (req, res) => {
    const { amount, category, date, notes, type } = req.body;
    if (!amount || !category || !date || !type) {
        return res.status(400).json({
            success: false,
            error: "Amount, category, date, and type are required fields"
        });
    }
    try {
        // console.log(req.user)
        const newEntry = new FinancialModel({
            userId: req.user._id,
            amount,
            category,
            date,
            notes,
            type
        });
        await newEntry.save();
        res.status(201).json({
            success: true,
            data: newEntry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
// Updating financial entry
const updateFinancialEntry = async (req, res) => {
    const { id } = req.params;
    const { amount, category, date, notes, type } = req.body;
    if (!id) {
        return res.status(400).json({
            success: false,
            error: "Financial entry ID is required"
        });
    }
    try {
        const entry = await FinancialModel.findById(id);
        if (!entry) {
            return res.status(404).json({
                success: false,
                error: "Financial entry not found"
            });
        }
        if (req.user.role !== "admin" && entry.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: "You do not have permission to update this entry"
            });
        }
        
        const updatedEntry = await FinancialModel.findByIdAndUpdate(
            id,
            { amount, category, date, notes, type },
            { new: true }
        );
        res.status(200).json({
            success: true,
            data: updatedEntry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Deleting financial entry
const deleteFinancialEntry = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            success: false,
            error: "Financial entry ID is required"
        });
    }
    try {
        const entry = await FinancialModel.findById(id);
        if (!entry) {
            return res.status(404).json({
                success: false,
                error: "Financial entry not found"
            });
        }
        if (req.user.role !== "admin" && entry.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: "You do not have permission to delete this entry"
            });
        }
        
        await FinancialModel.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Financial entry deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// it is not working properly because of the date format in the query params , need to fix it
const filterRecords = async (req, res) => {
    const { date, category, type, notes } = req.query;
    try {
        let filter = {};

        if (req.user?.role !== "admin") {
            filter.userId = req.user._id;
        }

        if (date) {
            const selectedDate = new Date(date);

            if (Number.isNaN(selectedDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid date format"
                });
            }

            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            filter.date = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }
        if (category) {
            filter.category = category.trim();
        }
        if (type) {
            filter.type = type.trim();
        }
        if (notes) {
            filter.notes = { $regex: notes.trim(), $options: "i" };
        }
        const data = await FinancialModel.find(filter);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Search functionality to find specific financial entries based on keywords or amounts
const SearchRecords = async (req, res) => {
    const { keyword, minAmount, maxAmount } = req.query;
    try {
        let filter = {};
        if (req.user?.role !== "admin") {
            filter.userId = req.user._id;
        }
        if (keyword) {
            filter.$or = [
                { category: { $regex: keyword.trim(), $options: "i" } },
                { notes: { $regex: keyword.trim(), $options: "i" } }
            ];
        }
        if (minAmount) {
            filter.amount = { ...filter.amount, $gte: parseFloat(minAmount) };
        }
        if (maxAmount) {
            filter.amount = { ...filter.amount, $lte: parseFloat(maxAmount) };
        }
        const data = await FinancialModel.find(filter);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


module.exports = { getFinancialData, createFinancialEntry, updateFinancialEntry, deleteFinancialEntry, getFinancialEntry, filterRecords, SearchRecords };