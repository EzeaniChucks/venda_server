"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistController = void 0;
const wishlistService_1 = __importDefault(require("../../services/customer/wishlistService"));
const response_1 = require("../../utils/response");
class WishlistController {
    async getWishlist(req, res) {
        try {
            const wishlist = await wishlistService_1.default.getWishlist(req.user.id);
            return (0, response_1.successResponse)(res, wishlist);
        }
        catch (error) {
            console.error('Get wishlist error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async addToWishlist(req, res) {
        try {
            const { product_id } = req.body;
            const item = await wishlistService_1.default.addToWishlist(req.user.id, product_id);
            return (0, response_1.successResponse)(res, item, 'Added to wishlist', 201);
        }
        catch (error) {
            console.error('Add to wishlist error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async removeFromWishlist(req, res) {
        try {
            const result = await wishlistService_1.default.removeFromWishlist(req.user.id, req.params.id);
            return (0, response_1.successResponse)(res, result, 'Removed from wishlist');
        }
        catch (error) {
            console.error('Remove from wishlist error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async checkWishlist(req, res) {
        try {
            const result = await wishlistService_1.default.isInWishlist(req.user.id, req.params.productId);
            return (0, response_1.successResponse)(res, result);
        }
        catch (error) {
            console.error('Check wishlist error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
}
exports.WishlistController = WishlistController;
exports.default = new WishlistController();
//# sourceMappingURL=wishlistController.js.map