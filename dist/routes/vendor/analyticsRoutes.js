"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../../controllers/vendor/analyticsController");
const auth_1 = require("../../middleware/auth");
const validateRequest_1 = require("../../middleware/validateRequest");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        if (req.method !== "GET")
            return next();
        const key = `analytics:${req.user?.id}:${req.originalUrl}`;
        const cached = null;
        if (cached) {
            return res.json(JSON.parse(cached));
        }
        const originalJson = res.json;
        res.json = function (data) {
            originalJson.call(this, data);
        };
        next();
    };
};
router.get("/overview", auth_1.authenticate, cacheMiddleware(300), [
    (0, express_validator_1.query)("startDate").optional().isISO8601().toDate(),
    (0, express_validator_1.query)("endDate").optional().isISO8601().toDate(),
], validateRequest_1.validateRequest, analyticsController_1.AnalyticsController.getVendorOverview);
router.get("/sales", auth_1.authenticate, cacheMiddleware(300), [
    (0, express_validator_1.query)("period")
        .optional()
        .isIn(["today", "week", "month", "quarter", "year", "custom"]),
    (0, express_validator_1.query)("startDate").optional().isISO8601().toDate(),
    (0, express_validator_1.query)("endDate").optional().isISO8601().toDate(),
], validateRequest_1.validateRequest, analyticsController_1.AnalyticsController.getSalesTrends);
router.get("/products", auth_1.authenticate, cacheMiddleware(300), [
    (0, express_validator_1.query)("startDate").optional().isISO8601().toDate(),
    (0, express_validator_1.query)("endDate").optional().isISO8601().toDate(),
], validateRequest_1.validateRequest, analyticsController_1.AnalyticsController.getProductPerformance);
router.get("/orders", auth_1.authenticate, cacheMiddleware(300), [
    (0, express_validator_1.query)("startDate").optional().isISO8601().toDate(),
    (0, express_validator_1.query)("endDate").optional().isISO8601().toDate(),
], validateRequest_1.validateRequest, analyticsController_1.AnalyticsController.getOrderAnalytics);
router.get("/customers", auth_1.authenticate, cacheMiddleware(300), [
    (0, express_validator_1.query)("startDate").optional().isISO8601().toDate(),
    (0, express_validator_1.query)("endDate").optional().isISO8601().toDate(),
], validateRequest_1.validateRequest, analyticsController_1.AnalyticsController.getCustomerAnalytics);
router.get("/regional", auth_1.authenticate, cacheMiddleware(300), [
    (0, express_validator_1.query)("startDate").optional().isISO8601().toDate(),
    (0, express_validator_1.query)("endDate").optional().isISO8601().toDate(),
], validateRequest_1.validateRequest, analyticsController_1.AnalyticsController.getRegionalAnalytics);
router.get("/real-time", auth_1.authenticate, analyticsController_1.AnalyticsController.getRealTimeAnalytics);
router.get("/export", auth_1.authenticate, [
    (0, express_validator_1.query)("format").optional().isIn(["csv", "pdf"]),
    (0, express_validator_1.query)("startDate").optional().isISO8601().toDate(),
    (0, express_validator_1.query)("endDate").optional().isISO8601().toDate(),
], validateRequest_1.validateRequest, analyticsController_1.AnalyticsController.exportAnalytics);
router.get("/admin/platform-overview", auth_1.authenticate, (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access",
        });
    }
    next();
}, cacheMiddleware(300), analyticsController_1.AnalyticsController.getPlatformOverview);
router.get("/admin/vendors-performance", auth_1.authenticate, (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Unauthorized access",
        });
    }
    next();
}, cacheMiddleware(300), async (req, res) => {
    res.json({
        success: true,
        data: {
            topVendors: [
                {
                    id: "uuid",
                    businessName: "Fashion House",
                    totalSales: 1200000,
                    orders: 980,
                    rating: 4.8,
                    location: "Uyo, Akwa Ibom",
                },
            ],
        },
    });
});
exports.default = router;
//# sourceMappingURL=analyticsRoutes.js.map