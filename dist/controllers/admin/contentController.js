"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentController = void 0;
const contentService_1 = require("../../services/admin/contentService");
const response_1 = require("../../utils/response");
exports.contentController = {
    async createNews(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const news = await contentService_1.contentService.createNews(req.body);
            return (0, response_1.successResponse)(res, news, 'News article created successfully', 201);
        }
        catch (error) {
            console.error('Create news error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async getAllNews(req, res) {
        try {
            const result = await contentService_1.contentService.getAllNews(req.query);
            return (0, response_1.successResponse)(res, {
                news: result.news,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / result.limit)
                }
            });
        }
        catch (error) {
            console.error('Get news error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    },
    async getNewsById(req, res) {
        try {
            const news = await contentService_1.contentService.getNewsById(req.params.id);
            return (0, response_1.successResponse)(res, news);
        }
        catch (error) {
            console.error('Get news error:', error);
            return (0, response_1.errorResponse)(res, error.message, 404);
        }
    },
    async updateNews(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const news = await contentService_1.contentService.updateNews(req.params.id, req.body);
            return (0, response_1.successResponse)(res, news, 'News article updated successfully');
        }
        catch (error) {
            console.error('Update news error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async deleteNews(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const result = await contentService_1.contentService.deleteNews(req.params.id);
            return (0, response_1.successResponse)(res, result, result.message);
        }
        catch (error) {
            console.error('Delete news error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async createModel(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const model = await contentService_1.contentService.createModel(req.body);
            return (0, response_1.successResponse)(res, model, 'Model created successfully', 201);
        }
        catch (error) {
            console.error('Create model error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async getAllModels(req, res) {
        try {
            const result = await contentService_1.contentService.getAllModels(req.query);
            return (0, response_1.successResponse)(res, {
                models: result.models,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / result.limit)
                }
            });
        }
        catch (error) {
            console.error('Get models error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    },
    async getModelById(req, res) {
        try {
            const model = await contentService_1.contentService.getModelById(req.params.id);
            return (0, response_1.successResponse)(res, model);
        }
        catch (error) {
            console.error('Get model error:', error);
            return (0, response_1.errorResponse)(res, error.message, 404);
        }
    },
    async updateModel(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const model = await contentService_1.contentService.updateModel(req.params.id, req.body);
            return (0, response_1.successResponse)(res, model, 'Model updated successfully');
        }
        catch (error) {
            console.error('Update model error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async deleteModel(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const result = await contentService_1.contentService.deleteModel(req.params.id);
            return (0, response_1.successResponse)(res, result, result.message);
        }
        catch (error) {
            console.error('Delete model error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
};
//# sourceMappingURL=contentController.js.map