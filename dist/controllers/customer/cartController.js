"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const express_validator_1 = require("express-validator");
const cartService_1 = __importDefault(require("../../services/customer/cartService"));
const response_1 = require("../../utils/response");
class CartController {
    async getCart(req, res) {
        try {
            const cart = await cartService_1.default.getCart(req.user.id);
            return (0, response_1.successResponse)(res, cart);
        }
        catch (error) {
            console.error('Get cart error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
    async addToCart(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const cartItem = await cartService_1.default.addToCart(req.user.id, req.body);
            return (0, response_1.successResponse)(res, cartItem, 'Item added to cart', 201);
        }
        catch (error) {
            console.error('Add to cart error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async updateCartItem(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return (0, response_1.validationErrorResponse)(res, errors.array());
            }
            const { quantity } = req.body;
            const cartItem = await cartService_1.default.updateCartItem(req.user.id, req.params.id, quantity);
            return (0, response_1.successResponse)(res, cartItem, 'Cart updated');
        }
        catch (error) {
            console.error('Update cart error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async removeFromCart(req, res) {
        try {
            await cartService_1.default.removeFromCart(req.user.id, req.params.id);
            return (0, response_1.successResponse)(res, null, 'Item removed from cart');
        }
        catch (error) {
            console.error('Remove from cart error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
    async clearCart(req, res) {
        try {
            await cartService_1.default.clearCart(req.user.id);
            return (0, response_1.successResponse)(res, null, 'Cart cleared');
        }
        catch (error) {
            console.error('Clear cart error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    }
}
exports.CartController = CartController;
exports.default = new CartController();
//# sourceMappingURL=cartController.js.map