"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analyticsService_1 = __importDefault(require("../../services/vendor/analyticsService"));
const response_1 = require("../../utils/response");
class AnalyticsController {
    static convertToCSV(data) {
        const lines = ["Analytics Report"];
        lines.push(`Export Date: ${data.exportDate}`);
        lines.push(`Date Range: ${data.dateRange.startDate} to ${data.dateRange.endDate}`);
        lines.push("");
        lines.push("SUMMARY");
        lines.push("Metric,Value");
        lines.push(`Total Orders,${data.overview.summary.totalOrders}`);
        lines.push(`Total Revenue,${data.overview.summary.totalRevenue}`);
        lines.push(`Average Order Value,${data.overview.summary.avgOrderValue}`);
        lines.push(`Pending Orders,${data.overview.summary.pendingOrders}`);
        lines.push("");
        lines.push("SALES TRENDS");
        lines.push("Date,Sales,Orders");
        data.sales.data.forEach((item) => {
            lines.push(`${item.date},${item.sales},${item.orders}`);
        });
        return lines.join("\n");
    }
}
exports.AnalyticsController = AnalyticsController;
_a = AnalyticsController;
AnalyticsController.getVendorOverview = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { startDate, endDate } = req.query;
        const dateRange = {
            startDate: startDate
                ? new Date(startDate)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date(),
        };
        const data = await analyticsService_1.default.getVendorOverview(vendorId, dateRange);
        return (0, response_1.successResponse)(res, data, "Vendor overview retrieved successfully");
    }
    catch (error) {
        console.error("Vendor overview error:", error);
        return (0, response_1.errorResponse)(res, error.message || "Failed to retrieve vendor overview");
    }
};
AnalyticsController.getSalesTrends = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { period = "month", startDate, endDate } = req.query;
        const dateRange = {
            startDate: startDate
                ? new Date(startDate)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date(),
        };
        const data = await analyticsService_1.default.getSalesTrends(vendorId, period, dateRange);
        return (0, response_1.successResponse)(res, data, "Sales trends retrieved successfully");
    }
    catch (error) {
        console.error("Sales trends error:", error);
        return (0, response_1.errorResponse)(res, error.message || "Failed to retrieve sales trends");
    }
};
AnalyticsController.getProductPerformance = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { startDate, endDate } = req.query;
        const dateRange = {
            startDate: startDate
                ? new Date(startDate)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date(),
        };
        const data = await analyticsService_1.default.getProductPerformance(vendorId, dateRange);
        return (0, response_1.successResponse)(res, data, "Product performance retrieved successfully");
    }
    catch (error) {
        console.error("Product performance error:", error);
        return (0, response_1.errorResponse)(res, error.message || "Failed to retrieve product performance");
    }
};
AnalyticsController.getOrderAnalytics = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { startDate, endDate } = req.query;
        const dateRange = {
            startDate: startDate
                ? new Date(startDate)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date(),
        };
        const data = await analyticsService_1.default.getOrderAnalytics(vendorId, dateRange);
        return (0, response_1.successResponse)(res, data, "Order analytics retrieved successfully");
    }
    catch (error) {
        console.error("Order analytics error:", error);
        return (0, response_1.errorResponse)(res, error.message || "Failed to retrieve order analytics");
    }
};
AnalyticsController.getCustomerAnalytics = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { startDate, endDate } = req.query;
        const dateRange = {
            startDate: startDate
                ? new Date(startDate)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date(),
        };
        const data = await analyticsService_1.default.getCustomerAnalytics(vendorId, dateRange);
        return (0, response_1.successResponse)(res, data, "Customer analytics retrieved successfully");
    }
    catch (error) {
        console.error("Customer analytics error:", error);
        return (0, response_1.errorResponse)(res, error.message || "Failed to retrieve customer analytics");
    }
};
AnalyticsController.getRegionalAnalytics = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { startDate, endDate } = req.query;
        const dateRange = {
            startDate: startDate
                ? new Date(startDate)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date(),
        };
        const data = await analyticsService_1.default.getRegionalAnalytics(vendorId, dateRange);
        return (0, response_1.successResponse)(res, data, "Regional analytics retrieved successfully");
    }
    catch (error) {
        console.error("Regional analytics error:", error);
        return (0, response_1.errorResponse)(res, error.message || "Failed to retrieve regional analytics");
    }
};
AnalyticsController.getRealTimeAnalytics = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const data = await analyticsService_1.default.getRealTimeAnalytics(vendorId);
        return (0, response_1.successResponse)(res, data, "Real-time analytics retrieved successfully");
    }
    catch (error) {
        console.error("Real-time analytics error:", error);
        return (0, response_1.errorResponse)(res, error.message || "Failed to retrieve real-time analytics");
    }
};
AnalyticsController.exportAnalytics = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { format = "csv", startDate, endDate } = req.query;
        const dateRange = {
            startDate: startDate
                ? new Date(startDate)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: endDate ? new Date(endDate) : new Date(),
        };
        const [overview, sales, products, orders, customers, regional] = await Promise.all([
            analyticsService_1.default.getVendorOverview(vendorId, dateRange),
            analyticsService_1.default.getSalesTrends(vendorId, "custom", dateRange),
            analyticsService_1.default.getProductPerformance(vendorId, dateRange),
            analyticsService_1.default.getOrderAnalytics(vendorId, dateRange),
            analyticsService_1.default.getCustomerAnalytics(vendorId, dateRange),
            analyticsService_1.default.getRegionalAnalytics(vendorId, dateRange),
        ]);
        const allData = {
            overview,
            sales,
            products,
            orders,
            customers,
            regional,
            exportDate: new Date().toISOString(),
            dateRange,
        };
        if (format === "csv") {
            const csvData = _a.convertToCSV(allData);
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename=analytics-${vendorId}-${Date.now()}.csv`);
            return res.send(csvData);
        }
        else {
            return (0, response_1.successResponse)(res, allData, "Analytics data ready for export");
        }
    }
    catch (error) {
        console.error("Export analytics error:", error);
        return (0, response_1.errorResponse)(res, error.message || "Failed to export analytics");
    }
};
AnalyticsController.getPlatformOverview = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return (0, response_1.errorResponse)(res, "Unauthorized access", 403);
        }
        const totals = {
            totalVendors: 450,
            activeVendors: 320,
            totalCustomers: 12500,
            activeCustomers: 8900,
            totalOrders: 45000,
            platformRevenue: 45000000,
            today: {
                newVendors: 5,
                newCustomers: 89,
                newOrders: 450,
                revenue: 540000,
            },
            growth: {
                vendorGrowth: "+12%",
                customerGrowth: "+8%",
                revenueGrowth: "+15%",
            },
        };
        return (0, response_1.successResponse)(res, totals, "Platform overview retrieved successfully");
    }
    catch (error) {
        console.error("Platform overview error:", error);
        return (0, response_1.errorResponse)(res, error.message || "Failed to retrieve platform overview");
    }
};
//# sourceMappingURL=analyticsController.js.map