"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const categoryController_1 = require("../../controllers/admin/categoryController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken, auth_1.requireAdmin);
router.post('/', [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('slug').notEmpty().withMessage('Slug is required'),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('icon').optional().isString(),
    (0, express_validator_1.body)('parentId').optional().isUUID()
], categoryController_1.categoryController.createCategory);
router.get('/', categoryController_1.categoryController.getAllCategories);
router.get('/:id', categoryController_1.categoryController.getCategoryById);
router.put('/:id', [
    (0, express_validator_1.body)('name').optional().notEmpty(),
    (0, express_validator_1.body)('slug').optional().notEmpty(),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('icon').optional().isString(),
    (0, express_validator_1.body)('parentId').optional().isUUID()
], categoryController_1.categoryController.updateCategory);
router.delete('/:id', categoryController_1.categoryController.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map