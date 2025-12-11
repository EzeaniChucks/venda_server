"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const categoryService_1 = require("../../services/admin/categoryService");
const response_1 = require("../../utils/response");
exports.categoryController = {
    async createCategory(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const category = await categoryService_1.categoryService.createCategory(req.body);
            return (0, response_1.successResponse)(res, category, 'Category created successfully', 201);
        }
        catch (error) {
            console.error('Create category error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async getAllCategories(req, res) {
        try {
            const result = await categoryService_1.categoryService.getAllCategories(req.query);
            return (0, response_1.successResponse)(res, {
                categories: result.categories,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / result.limit)
                }
            });
        }
        catch (error) {
            console.error('Get categories error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    },
    async getCategoryById(req, res) {
        try {
            const category = await categoryService_1.categoryService.getCategoryById(req.params.id);
            return (0, response_1.successResponse)(res, category);
        }
        catch (error) {
            console.error('Get category error:', error);
            return (0, response_1.errorResponse)(res, error.message, 404);
        }
    },
    async updateCategory(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const category = await categoryService_1.categoryService.updateCategory(req.params.id, req.body);
            return (0, response_1.successResponse)(res, category, 'Category updated successfully');
        }
        catch (error) {
            console.error('Update category error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async deleteCategory(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const result = await categoryService_1.categoryService.deleteCategory(req.params.id);
            return (0, response_1.successResponse)(res, result, result.message);
        }
        catch (error) {
            console.error('Delete category error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
};
//# sourceMappingURL=categoryController.js.map