"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const contentController_1 = require("../../controllers/admin/contentController");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken, auth_1.requireAdmin);
router.post('/news', [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('content').notEmpty().withMessage('Content is required'),
    (0, express_validator_1.body)('image').optional().isString(),
    (0, express_validator_1.body)('author').optional().isString()
], contentController_1.contentController.createNews);
router.get('/news', contentController_1.contentController.getAllNews);
router.get('/news/:id', contentController_1.contentController.getNewsById);
router.put('/news/:id', [
    (0, express_validator_1.body)('title').optional().notEmpty(),
    (0, express_validator_1.body)('content').optional().notEmpty(),
    (0, express_validator_1.body)('image').optional().isString(),
    (0, express_validator_1.body)('author').optional().isString(),
    (0, express_validator_1.body)('isActive').optional().isBoolean()
], contentController_1.contentController.updateNews);
router.delete('/news/:id', contentController_1.contentController.deleteNews);
router.post('/models', [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('bio').optional().isString(),
    (0, express_validator_1.body)('profileImage').optional().isString(),
    (0, express_validator_1.body)('portfolioImages').optional().isArray(),
    (0, express_validator_1.body)('instagramHandle').optional().isString(),
    (0, express_validator_1.body)('twitterHandle').optional().isString()
], contentController_1.contentController.createModel);
router.get('/models', contentController_1.contentController.getAllModels);
router.get('/models/:id', contentController_1.contentController.getModelById);
router.put('/models/:id', [
    (0, express_validator_1.body)('name').optional().notEmpty(),
    (0, express_validator_1.body)('bio').optional().isString(),
    (0, express_validator_1.body)('profileImage').optional().isString(),
    (0, express_validator_1.body)('portfolioImages').optional().isArray(),
    (0, express_validator_1.body)('instagramHandle').optional().isString(),
    (0, express_validator_1.body)('twitterHandle').optional().isString()
], contentController_1.contentController.updateModel);
router.delete('/models/:id', contentController_1.contentController.deleteModel);
exports.default = router;
//# sourceMappingURL=contentRoutes.js.map