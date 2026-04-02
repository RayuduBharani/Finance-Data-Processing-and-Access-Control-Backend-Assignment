const FinancialModel = require("../models/financialModel");

// Total income , Total expensesNet balance,Category wise totals,Recent activity,Monthly or weekly trends
const dashboardSummary = async (req, res) => {
    try {
        const totalIncome = await FinancialModel.aggregate([
            { $match: { type: "Income" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalExpenses = await FinancialModel.aggregate([
            { $match: { type: "Expense" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const netBalance = (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0);
        const categoryWiseTotalsIncome = await FinancialModel.aggregate([
            { $match: { type: "Income" } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } }
        ]);
        const categoryWiseTotalsExpenses = await FinancialModel.aggregate([
            { $match: { type: "Expense" } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } }
        ]);
        const recentActivityIncome = await FinancialModel.find({ type: "Income" }).sort({ createdAt: -1 }).limit(5);
        const recentActivityExpenses = await FinancialModel.find({ type: "Expense" }).sort({ createdAt: -1 }).limit(5);
        const monthlyTrends = await FinancialModel.aggregate([
            {
                $group: {
                    _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                    totalIncome: { $sum: { $cond: [{ $eq: ["$type", "Income"] }, "$amount", 0] } },
                    totalExpenses: { $sum: { $cond: [{ $eq: ["$type", "Expense"] }, "$amount", 0] } }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalIncome: totalIncome[0]?.total || 0,
                totalExpenses: totalExpenses[0]?.total || 0,
                netBalance,
                categoryWiseTotalsIncome,
                categoryWiseTotalsExpenses,
                monthlyTrends,
                recentActivityIncome,
                recentActivityExpenses
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    dashboardSummary
}