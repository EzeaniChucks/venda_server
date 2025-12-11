"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorFeatureController = void 0;
const vendorFeatureService_1 = require("../../services/admin/vendorFeatureService");
const response_1 = require("../../utils/response");
exports.vendorFeatureController = {
    async createVendorOfTheMonth(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const vendorOfMonth = await vendorFeatureService_1.vendorFeatureService.createVendorOfTheMonth(req.body);
            return (0, response_1.successResponse)(res, vendorOfMonth, 'Vendor of the Month created successfully', 201);
        }
        catch (error) {
            console.error('Create Vendor of the Month error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async getAllVendorsOfMonth(req, res) {
        try {
            const result = await vendorFeatureService_1.vendorFeatureService.getAllVendorsOfMonth(req.query);
            return (0, response_1.successResponse)(res, {
                vendors: result.vendors,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / result.limit)
                }
            });
        }
        catch (error) {
            console.error('Get Vendors of the Month error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    },
    async getVendorOfTheMonthById(req, res) {
        try {
            const vendorOfMonth = await vendorFeatureService_1.vendorFeatureService.getVendorOfMonthById(req.params.id);
            return (0, response_1.successResponse)(res, vendorOfMonth);
        }
        catch (error) {
            console.error('Get Vendor of the Month error:', error);
            return (0, response_1.errorResponse)(res, error.message, 404);
        }
    },
    async updateVendorOfTheMonth(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const vendorOfMonth = await vendorFeatureService_1.vendorFeatureService.updateVendorOfMonth(req.params.id, req.body);
            return (0, response_1.successResponse)(res, vendorOfMonth, 'Vendor of the Month updated successfully');
        }
        catch (error) {
            console.error('Update Vendor of the Month error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async deleteVendorOfTheMonth(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const result = await vendorFeatureService_1.vendorFeatureService.deleteVendorOfMonth(req.params.id);
            return (0, response_1.successResponse)(res, result, result.message);
        }
        catch (error) {
            console.error('Delete Vendor of the Month error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async createCollaboration(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const collaboration = await vendorFeatureService_1.vendorFeatureService.createCollaboration(req.body);
            return (0, response_1.successResponse)(res, collaboration, 'Collaboration created successfully', 201);
        }
        catch (error) {
            console.error('Create collaboration error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async getAllCollaborations(req, res) {
        try {
            const result = await vendorFeatureService_1.vendorFeatureService.getAllCollaborations(req.query);
            return (0, response_1.successResponse)(res, {
                collaborations: result.collaborations,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / result.limit)
                }
            });
        }
        catch (error) {
            console.error('Get collaborations error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    },
    async getCollaborationById(req, res) {
        try {
            const collaboration = await vendorFeatureService_1.vendorFeatureService.getCollaborationById(req.params.id);
            return (0, response_1.successResponse)(res, collaboration);
        }
        catch (error) {
            console.error('Get collaboration error:', error);
            return (0, response_1.errorResponse)(res, error.message, 404);
        }
    },
    async updateCollaboration(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const collaboration = await vendorFeatureService_1.vendorFeatureService.updateCollaboration(req.params.id, req.body);
            return (0, response_1.successResponse)(res, collaboration, 'Collaboration updated successfully');
        }
        catch (error) {
            console.error('Update collaboration error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async deleteCollaboration(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const result = await vendorFeatureService_1.vendorFeatureService.deleteCollaboration(req.params.id);
            return (0, response_1.successResponse)(res, result, result.message);
        }
        catch (error) {
            console.error('Delete collaboration error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async createInfluencerPick(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const influencerPick = await vendorFeatureService_1.vendorFeatureService.createInfluencerPick(req.body);
            return (0, response_1.successResponse)(res, influencerPick, 'Influencer pick created successfully', 201);
        }
        catch (error) {
            console.error('Create influencer pick error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async getAllInfluencerPicks(req, res) {
        try {
            const result = await vendorFeatureService_1.vendorFeatureService.getAllInfluencerPicks(req.query);
            return (0, response_1.successResponse)(res, {
                picks: result.picks,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / result.limit)
                }
            });
        }
        catch (error) {
            console.error('Get influencer picks error:', error);
            return (0, response_1.errorResponse)(res, error.message);
        }
    },
    async getInfluencerPickById(req, res) {
        try {
            const influencerPick = await vendorFeatureService_1.vendorFeatureService.getInfluencerPickById(req.params.id);
            return (0, response_1.successResponse)(res, influencerPick);
        }
        catch (error) {
            console.error('Get influencer pick error:', error);
            return (0, response_1.errorResponse)(res, error.message, 404);
        }
    },
    async updateInfluencerPick(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const influencerPick = await vendorFeatureService_1.vendorFeatureService.updateInfluencerPick(req.params.id, req.body);
            return (0, response_1.successResponse)(res, influencerPick, 'Influencer pick updated successfully');
        }
        catch (error) {
            console.error('Update influencer pick error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    },
    async deleteInfluencerPick(req, res) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return (0, response_1.errorResponse)(res, 'Unauthorized: Admin access required', 403);
            }
            const result = await vendorFeatureService_1.vendorFeatureService.deleteInfluencerPick(req.params.id);
            return (0, response_1.successResponse)(res, result, result.message);
        }
        catch (error) {
            console.error('Delete influencer pick error:', error);
            return (0, response_1.errorResponse)(res, error.message, 400);
        }
    }
};
//# sourceMappingURL=vendorFeatureController.js.map