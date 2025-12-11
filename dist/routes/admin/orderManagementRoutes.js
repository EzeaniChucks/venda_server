"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderManagementController_1 = require("../../controllers/admin/orderManagementController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken, auth_1.requireAdmin);
router.get('/orders', orderManagementController_1.orderManagementController.getAllOrders);
router.get('/orders/stats', orderManagementController_1.orderManagementController.getOrderStats);
router.get('/orders/:id', orderManagementController_1.orderManagementController.getOrderById);
router.get('/transactions', orderManagementController_1.orderManagementController.getAllTransactions);
router.get('/transactions/stats', orderManagementController_1.orderManagementController.getTransactionStats);
router.get('/transactions/:id', orderManagementController_1.orderManagementController.getTransactionById);
exports.default = router;
//# sourceMappingURL=orderManagementRoutes.js.map