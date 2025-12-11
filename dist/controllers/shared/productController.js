"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const productService_service_1 = __importDefault(require("../../services/shared/productService.service"));
const response_1 = require("../../utils/response");
class ProductController {
    async getAllProducts(req, res) {
        try {
            const filters = {
                gender: req.query.gender,
                category_id: req.query.category_id,
                search: req.query.search,
                min_price: req.query.min_price
                    ? Number(req.query.min_price)
                    : undefined,
                max_price: req.query.max_price
                    ? Number(req.query.max_price)
                    : undefined,
                latitude: req.query.latitude ? Number(req.query.latitude) : undefined,
                longitude: req.query.longitude
                    ? Number(req.query.longitude)
                    : undefined,
                radius: req.query.radius ? Number(req.query.radius) : 200,
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 20,
            };
            const products = await productService_service_1.default.getAllProducts(filters);
            return (0, response_1.successResponse)(res, products);
        }
        catch (error) {
            console.error("Get products error:", error.message);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async getProductById(req, res) {
        try {
            const product = await productService_service_1.default.getProductById(req.params.id);
            return (0, response_1.successResponse)(res, product);
        }
        catch (error) {
            console.error("Get product error:", error.message);
            return (0, response_1.errorResponse)(res, error.message, 404);
        }
    }
    async getProductsByCategory(req, res) {
        try {
            const products = await productService_service_1.default.getProductsByCategory(req.params.id);
            return (0, response_1.successResponse)(res, products);
        }
        catch (error) {
            console.error("Get products by category error:", error.message);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
}
exports.ProductController = ProductController;
exports.default = new ProductController();
//# sourceMappingURL=productController.js.map