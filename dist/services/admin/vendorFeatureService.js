"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorFeatureService = void 0;
const data_source_1 = require("../../config/data-source");
const VendorOfTheMonth_1 = require("../../entities/VendorOfTheMonth");
const VendorCollaboration_1 = require("../../entities/VendorCollaboration");
const InfluencerPick_1 = require("../../entities/InfluencerPick");
const Vendor_1 = require("../../entities/Vendor");
const vendorOfMonthRepo = data_source_1.AppDataSource.getRepository(VendorOfTheMonth_1.VendorOfTheMonth);
const vendorCollaborationRepo = data_source_1.AppDataSource.getRepository(VendorCollaboration_1.VendorCollaboration);
const influencerPickRepo = data_source_1.AppDataSource.getRepository(InfluencerPick_1.InfluencerPick);
const vendorRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
exports.vendorFeatureService = {
    async createVendorOfTheMonth(data) {
        const vendor = await vendorRepo.findOne({ where: { id: data.vendorId } });
        if (!vendor) {
            throw new Error('Vendor not found');
        }
        const existing = await vendorOfMonthRepo.findOne({
            where: { month: data.month, year: data.year }
        });
        if (existing) {
            throw new Error(`Vendor of the Month already exists for ${data.month}/${data.year}`);
        }
        const vendorOfMonth = vendorOfMonthRepo.create({
            ...data,
            featuredOnHomepage: true
        });
        const result = await vendorOfMonthRepo.save(vendorOfMonth);
        vendor.vendorOfMonthCount += 1;
        await vendorRepo.save(vendor);
        return result;
    },
    async getAllVendorsOfMonth(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;
        const skip = (page - 1) * limit;
        const [vendors, total] = await vendorOfMonthRepo.findAndCount({
            skip,
            take: limit,
            order: { year: 'DESC', month: 'DESC' },
            relations: ['vendor']
        });
        return { vendors, total, page, limit };
    },
    async getVendorOfMonthById(id) {
        const vendorOfMonth = await vendorOfMonthRepo.findOne({
            where: { id },
            relations: ['vendor']
        });
        if (!vendorOfMonth) {
            throw new Error('Vendor of the Month not found');
        }
        return vendorOfMonth;
    },
    async updateVendorOfMonth(id, data) {
        const vendorOfMonth = await vendorOfMonthRepo.findOne({ where: { id } });
        if (!vendorOfMonth) {
            throw new Error('Vendor of the Month not found');
        }
        Object.assign(vendorOfMonth, data);
        return await vendorOfMonthRepo.save(vendorOfMonth);
    },
    async deleteVendorOfMonth(id) {
        const vendorOfMonth = await vendorOfMonthRepo.findOne({
            where: { id },
            relations: ['vendor']
        });
        if (!vendorOfMonth) {
            throw new Error('Vendor of the Month not found');
        }
        const vendor = vendorOfMonth.vendor;
        if (vendor && vendor.vendorOfMonthCount > 0) {
            vendor.vendorOfMonthCount -= 1;
            await vendorRepo.save(vendor);
        }
        await vendorOfMonthRepo.remove(vendorOfMonth);
        return { message: 'Vendor of the Month deleted successfully' };
    },
    async createCollaboration(data) {
        const vendor1 = await vendorRepo.findOne({ where: { id: data.vendor1Id } });
        const vendor2 = await vendorRepo.findOne({ where: { id: data.vendor2Id } });
        if (!vendor1 || !vendor2) {
            throw new Error('One or both vendors not found');
        }
        if (data.vendor1Id === data.vendor2Id) {
            throw new Error('Cannot create collaboration with the same vendor');
        }
        const collaboration = vendorCollaborationRepo.create({
            ...data,
            status: 'proposed'
        });
        return await vendorCollaborationRepo.save(collaboration);
    },
    async getAllCollaborations(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = query.status;
        const where = {};
        if (status) {
            where.status = status;
        }
        const [collaborations, total] = await vendorCollaborationRepo.findAndCount({
            where,
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
            relations: ['vendor1', 'vendor2']
        });
        return { collaborations, total, page, limit };
    },
    async getCollaborationById(id) {
        const collaboration = await vendorCollaborationRepo.findOne({
            where: { id },
            relations: ['vendor1', 'vendor2']
        });
        if (!collaboration) {
            throw new Error('Collaboration not found');
        }
        return collaboration;
    },
    async updateCollaboration(id, data) {
        const collaboration = await vendorCollaborationRepo.findOne({ where: { id } });
        if (!collaboration) {
            throw new Error('Collaboration not found');
        }
        Object.assign(collaboration, data);
        return await vendorCollaborationRepo.save(collaboration);
    },
    async deleteCollaboration(id) {
        const collaboration = await vendorCollaborationRepo.findOne({ where: { id } });
        if (!collaboration) {
            throw new Error('Collaboration not found');
        }
        await vendorCollaborationRepo.remove(collaboration);
        return { message: 'Collaboration deleted successfully' };
    },
    async createInfluencerPick(data) {
        const influencerPick = influencerPickRepo.create({
            ...data,
            isFeatured: true
        });
        return await influencerPickRepo.save(influencerPick);
    },
    async getAllInfluencerPicks(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;
        const skip = (page - 1) * limit;
        const [picks, total] = await influencerPickRepo.findAndCount({
            skip,
            take: limit,
            order: { createdAt: 'DESC' }
        });
        return { picks, total, page, limit };
    },
    async getInfluencerPickById(id) {
        const pick = await influencerPickRepo.findOne({ where: { id } });
        if (!pick) {
            throw new Error('Influencer pick not found');
        }
        return pick;
    },
    async updateInfluencerPick(id, data) {
        const pick = await influencerPickRepo.findOne({ where: { id } });
        if (!pick) {
            throw new Error('Influencer pick not found');
        }
        Object.assign(pick, data);
        return await influencerPickRepo.save(pick);
    },
    async deleteInfluencerPick(id) {
        const pick = await influencerPickRepo.findOne({ where: { id } });
        if (!pick) {
            throw new Error('Influencer pick not found');
        }
        await influencerPickRepo.remove(pick);
        return { message: 'Influencer pick deleted successfully' };
    }
};
//# sourceMappingURL=vendorFeatureService.js.map