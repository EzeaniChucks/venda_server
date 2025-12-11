"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkProductLimit = exports.cancelSubscription = exports.upgrade = exports.verifySubscription = exports.subscribe = exports.getCurrentSubscription = exports.getPlans = void 0;
const subscriptionService_1 = __importDefault(require("../../services/subscription/subscriptionService"));
const productLimitService_1 = __importDefault(require("../../services/subscription/productLimitService"));
const SubscriptionPlan_1 = require("../../entities/SubscriptionPlan");
const getPlans = async (req, res) => {
    try {
        const plans = await subscriptionService_1.default.getPlans();
        res.json({ success: true, data: plans });
    }
    catch (error) {
        console.error("Get plans error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPlans = getPlans;
const getCurrentSubscription = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const subscription = await subscriptionService_1.default.getVendorSubscription(vendorId);
        const quota = await productLimitService_1.default.getRemainingQuota(vendorId);
        res.json({
            success: true,
            data: {
                subscription,
                quota,
            },
        });
    }
    catch (error) {
        console.error("Get subscription error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCurrentSubscription = getCurrentSubscription;
const subscribe = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { tier } = req.body;
        if (!tier || !Object.values(SubscriptionPlan_1.PlanTier).includes(tier)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid subscription tier" });
        }
        if (tier === SubscriptionPlan_1.PlanTier.FREE) {
            const subscription = await subscriptionService_1.default.createFreeSubscription(vendorId);
            return res.json({ success: true, data: subscription });
        }
        const paymentData = await subscriptionService_1.default.initializeSubscription(vendorId, tier);
        res.json({ success: true, data: paymentData });
    }
    catch (error) {
        console.error("Subscribe error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.subscribe = subscribe;
const verifySubscription = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { reference } = req.body;
        if (!reference) {
            return res
                .status(400)
                .json({ success: false, message: "Payment reference is required" });
        }
        const subscription = await subscriptionService_1.default.verifyAndActivateSubscription(reference, vendorId);
        res.json({ success: true, data: subscription });
    }
    catch (error) {
        console.error("Verify subscription error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.verifySubscription = verifySubscription;
const upgrade = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { tier } = req.body;
        if (!tier || !Object.values(SubscriptionPlan_1.PlanTier).includes(tier)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid subscription tier" });
        }
        const paymentData = await subscriptionService_1.default.upgradeSubscription(vendorId, tier);
        res.json({ success: true, data: paymentData });
    }
    catch (error) {
        console.error("Upgrade subscription error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.upgrade = upgrade;
const cancelSubscription = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const subscription = await subscriptionService_1.default.cancelSubscription(vendorId);
        res.json({
            success: true,
            data: subscription,
            message: "Subscription cancelled. You will retain access until the end of your current billing period.",
        });
    }
    catch (error) {
        console.error("Cancel subscription error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.cancelSubscription = cancelSubscription;
const checkProductLimit = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const limitCheck = await productLimitService_1.default.checkProductLimit(vendorId);
        res.json({ success: true, data: limitCheck });
    }
    catch (error) {
        console.error("Check product limit error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.checkProductLimit = checkProductLimit;
//# sourceMappingURL=subscriptionController.js.map