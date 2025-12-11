"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorProductController = void 0;
const productService_1 = __importDefault(require("../../services/vendor/productService"));
const response_1 = require("../../utils/response");
class VendorProductController {
    async createProduct(req, res) {
        try {
            const vendorId = req.user.id;
            const product = await productService_1.default.createProduct(vendorId, req.body);
            return (0, response_1.successResponse)(res, product, "Product created successfully. Awaiting approval.", 201);
        }
        catch (error) {
            console.error("Create product error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async updateProduct(req, res) {
        try {
            const vendorId = req.user.id;
            const { id } = req.params;
            const product = await productService_1.default.updateProduct(vendorId, id, req.body);
            return (0, response_1.successResponse)(res, product, "Product updated successfully");
        }
        catch (error) {
            console.error("Update product error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async deleteProduct(req, res) {
        try {
            const vendorId = req.user.id;
            const { id } = req.params;
            await productService_1.default.deleteProduct(vendorId, id);
            return (0, response_1.successResponse)(res, null, "Product deleted successfully");
        }
        catch (error) {
            console.error("Delete product error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async toggleProductStatus(req, res) {
        try {
            const vendorId = req.user.id;
            const { id } = req.params;
            const product = await productService_1.default.toggleProductStatus(vendorId, id);
            return (0, response_1.successResponse)(res, product, "Product status updated successfully");
        }
        catch (error) {
            console.error("Toggle product status error:", error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.VendorProductController = VendorProductController;
exports.default = new VendorProductController();
//# sourceMappingURL=productController.js.map