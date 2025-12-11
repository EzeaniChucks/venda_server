"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorCollaborationService = void 0;
const data_source_1 = require("../../config/data-source");
const VendorCollaboration_1 = require("../../entities/VendorCollaboration");
const Vendor_1 = require("../../entities/Vendor");
const VendorPartnership_1 = require("../../entities/VendorPartnership");
const VendorMessage_1 = require("../../entities/VendorMessage");
const entities_1 = require("../../entities");
const typeorm_1 = require("typeorm");
const collabRepo = data_source_1.AppDataSource.getRepository(VendorCollaboration_1.VendorCollaboration);
const productRepo = data_source_1.AppDataSource.getRepository(entities_1.Product);
const vendorRepo = data_source_1.AppDataSource.getRepository(Vendor_1.Vendor);
const partnershipRepo = data_source_1.AppDataSource.getRepository(VendorPartnership_1.VendorPartnership);
const messageRepo = data_source_1.AppDataSource.getRepository(VendorMessage_1.VendorMessage);
class VendorCollaborationService {
    async getVendorDirectory(query, vendorId) {
        const page = parseInt(String(query.page)) || 1;
        const limit = parseInt(String(query.limit)) || 20;
        const skip = (page - 1) * limit;
        const queryBuilder = vendorRepo
            .createQueryBuilder("vendor")
            .leftJoinAndSelect("vendor.vendorProfile", "vendorProfile")
            .where("vendor.isApproved = :isApproved", { isApproved: true })
            .andWhere("vendor.isActive = :isActive", { isActive: true });
        if (vendorId) {
            queryBuilder.andWhere("vendor.id != :vendorId", { vendorId });
        }
        if (query.search) {
            queryBuilder.andWhere("(vendor.businessName ILIKE :search OR vendor.city ILIKE :search OR vendor.state ILIKE :search OR vendorProfile.businessDescription ILIKE :search)", { search: `%${query.search}%` });
        }
        if (query.state) {
            queryBuilder.andWhere("vendor.state = :state", { state: query.state });
        }
        if (query.city) {
            queryBuilder.andWhere("vendor.city = :city", { city: query.city });
        }
        const [vendors, total] = await queryBuilder
            .select([
            "vendor.id",
            "vendor.businessName",
            "vendor.email",
            "vendor.city",
            "vendor.state",
            "vendor.subscriptionTier",
            "vendor.vendorOfMonthCount",
            "vendor.createdAt",
            "vendorProfile.profileImage",
            "vendorProfile.businessDescription",
            "vendorProfile.rating",
            "vendorProfile.totalSales",
        ])
            .skip(skip)
            .take(limit)
            .orderBy("vendor.vendorOfMonthCount", "DESC")
            .addOrderBy("vendor.createdAt", "DESC")
            .getManyAndCount();
        return {
            vendors,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async sendPartnershipRequest(requesterId, data) {
        const requester = await vendorRepo.findOne({ where: { id: requesterId } });
        const recipient = await vendorRepo.findOne({
            where: { id: data.recipientId },
        });
        if (!requester || !recipient) {
            throw new Error("Vendor not found");
        }
        if (requesterId === data.recipientId) {
            throw new Error("Cannot send partnership request to yourself");
        }
        const existing = await partnershipRepo.findOne({
            where: [
                {
                    requesterId,
                    recipientId: data.recipientId,
                    status: "pending",
                },
                {
                    requesterId: data.recipientId,
                    recipientId: requesterId,
                    status: "pending",
                },
            ],
        });
        if (existing) {
            throw new Error("Partnership request already exists");
        }
        const partnership = partnershipRepo.create({
            requesterId,
            recipientId: data.recipientId,
            partnershipType: data.partnershipType,
            message: data.message,
            terms: data.terms,
            status: "pending",
        });
        return await partnershipRepo.save(partnership);
    }
    async getPartnershipRequests(vendorId, type) {
        const where = type === "sent" ? { requesterId: vendorId } : { recipientId: vendorId };
        return await partnershipRepo.find({
            where,
            relations: ["requester", "recipient"],
            order: { createdAt: "DESC" },
        });
    }
    async respondToPartnership(vendorId, partnershipId, action, declineReason) {
        const partnership = await partnershipRepo.findOne({
            where: { id: partnershipId, recipientId: vendorId },
            relations: ["requester", "recipient"],
        });
        if (!partnership) {
            throw new Error("Partnership request not found");
        }
        if (partnership.status !== "pending") {
            throw new Error("Partnership request already processed");
        }
        if (action === "accept") {
            partnership.status = "accepted";
            partnership.acceptedAt = new Date();
        }
        else {
            partnership.status = "declined";
            partnership.declinedAt = new Date();
            partnership.declineReason = declineReason;
        }
        return await partnershipRepo.save(partnership);
    }
    async getMyPartnerships(vendorId) {
        return await partnershipRepo.find({
            where: [
                { requesterId: vendorId, status: "accepted" },
                { recipientId: vendorId, status: "accepted" },
            ],
            relations: ["requester", "recipient"],
            order: { acceptedAt: "DESC" },
        });
    }
    async sendMessage(senderId, data) {
        const sender = await vendorRepo.findOne({ where: { id: senderId } });
        const receiver = await vendorRepo.findOne({
            where: { id: data.receiverId },
        });
        if (!sender || !receiver) {
            throw new Error("Vendor not found");
        }
        const message = messageRepo.create({
            senderId,
            receiverId: data.receiverId,
            message: data.message,
            collaborationId: data.collaborationId,
            attachments: data.attachments,
            isRead: false,
        });
        return await messageRepo.save(message);
    }
    async getConversation(vendorId, otherVendorId) {
        const messages = await messageRepo.find({
            where: [
                { senderId: vendorId, receiverId: otherVendorId },
                { senderId: otherVendorId, receiverId: vendorId },
            ],
            relations: ["sender", "receiver"],
            order: { createdAt: "ASC" },
        });
        const unreadMessages = messages.filter((m) => m.receiverId === vendorId && !m.isRead);
        if (unreadMessages.length > 0) {
            await messageRepo.update({ receiverId: vendorId, senderId: otherVendorId, isRead: false }, { isRead: true });
        }
        return messages;
    }
    async getConversations(vendorId) {
        const sentMessages = await messageRepo
            .createQueryBuilder("message")
            .where("message.senderId = :vendorId", { vendorId })
            .orWhere("message.receiverId = :vendorId", { vendorId })
            .leftJoinAndSelect("message.sender", "sender")
            .leftJoinAndSelect("message.receiver", "receiver")
            .orderBy("message.createdAt", "DESC")
            .getMany();
        const conversationMap = new Map();
        for (const message of sentMessages) {
            const otherVendorId = message.senderId === vendorId ? message.receiverId : message.senderId;
            if (!conversationMap.has(otherVendorId)) {
                const unreadCount = await messageRepo.count({
                    where: {
                        senderId: otherVendorId,
                        receiverId: vendorId,
                        isRead: false,
                    },
                });
                conversationMap.set(otherVendorId, {
                    vendor: message.senderId === vendorId ? message.receiver : message.sender,
                    lastMessage: message,
                    unreadCount,
                });
            }
        }
        return Array.from(conversationMap.values());
    }
    async getUnreadCount(vendorId) {
        return await messageRepo.count({
            where: { receiverId: vendorId, isRead: false },
        });
    }
    async getNetworkStats(vendorId) {
        const [vendorsCount, conversations, partnerships, collaborations, unreadCount,] = await Promise.all([
            vendorRepo.count({
                where: {
                    isApproved: true,
                    isActive: true,
                    id: (0, typeorm_1.Not)(vendorId),
                },
            }),
            messageRepo
                .createQueryBuilder("message")
                .where("message.senderId = :vendorId OR message.receiverId = :vendorId", { vendorId })
                .select("DISTINCT message.senderId, message.receiverId")
                .getRawMany(),
            partnershipRepo.count({
                where: [
                    { requesterId: vendorId, status: "accepted" },
                    { recipientId: vendorId, status: "accepted" },
                ],
            }),
            collabRepo.count({
                where: [{ vendor1Id: vendorId }, { vendor2Id: vendorId }],
            }),
            messageRepo.count({
                where: { receiverId: vendorId, isRead: false },
            }),
        ]);
        const activeChats = new Set();
        conversations.forEach((conv) => {
            if (conv.senderId !== vendorId)
                activeChats.add(conv.senderId);
            if (conv.receiverId !== vendorId)
                activeChats.add(conv.receiverId);
        });
        return {
            connectedVendors: vendorsCount,
            activeChats: activeChats.size,
            partnerships,
            collaborations,
            unreadMessages: unreadCount,
        };
    }
    async proposeCollaboration(vendorId, data) {
        const vendor1 = await vendorRepo.findOne({ where: { id: vendorId } });
        const vendor2 = await vendorRepo.findOne({
            where: { id: data.partnerVendorId },
        });
        if (!vendor1 || !vendor2) {
            throw new Error("Vendor not found");
        }
        if (vendorId === data.partnerVendorId) {
            throw new Error("Cannot create collaboration with yourself");
        }
        const collaboration = collabRepo.create({
            vendor1Id: vendorId,
            vendor2Id: data.partnerVendorId,
            title: data.title,
            description: data.description,
            productIds: data.productIds,
            bannerImage: data.bannerImage,
            startDate: data.startDate,
            endDate: data.endDate,
            status: "proposed",
            isFeatured: false,
        });
        return await collabRepo.save(collaboration);
    }
    async respondToCollaboration(vendorId, collaborationId, action) {
        const collaboration = await collabRepo.findOne({
            where: { id: collaborationId },
            relations: ["vendor1", "vendor2"],
        });
        if (!collaboration) {
            throw new Error("Collaboration not found");
        }
        if (collaboration.vendor1Id !== vendorId &&
            collaboration.vendor2Id !== vendorId) {
            throw new Error("You are not part of this collaboration");
        }
        if (collaboration.vendor2Id !== vendorId) {
            throw new Error("Only the invited vendor can respond to this collaboration");
        }
        if (collaboration.status !== "proposed") {
            throw new Error("Collaboration already processed");
        }
        collaboration.status =
            action === "accept"
                ? "accepted"
                : "rejected";
        return await collabRepo.save(collaboration);
    }
    async getMyCollaborations(vendorId) {
        return await collabRepo.find({
            where: [{ vendor1Id: vendorId }, { vendor2Id: vendorId }],
            relations: [
                "vendor1",
                "vendor2",
                "vendor1.vendorProfile",
                "vendor2.vendorProfile",
            ],
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                isFeatured: true,
                startDate: true,
                endDate: true,
                createdAt: true,
                vendor1: {
                    id: true,
                    businessName: true,
                    vendorProfile: {
                        profileImage: true,
                    },
                },
                vendor2: {
                    id: true,
                    businessName: true,
                    vendorProfile: {
                        profileImage: true,
                    },
                },
            },
            order: { createdAt: "DESC" },
        });
    }
    async getCollaborationById(collaborationId, vendorId) {
        return await collabRepo.findOne({
            where: { id: collaborationId },
            relations: [
                "vendor1",
                "vendor2",
                "vendor1.vendorProfile",
                "vendor2.vendorProfile",
            ],
            select: {
                vendor1: {
                    id: true,
                    businessName: true,
                    vendorProfile: {
                        profileImage: true,
                        rating: true,
                        totalSales: true,
                    },
                },
                vendor2: {
                    id: true,
                    businessName: true,
                    vendorProfile: {
                        profileImage: true,
                        rating: true,
                        totalSales: true,
                    },
                },
            },
        });
    }
    async getCollaborationProducts(collaborationId, vendorId) {
        const collaboration = await collabRepo.findOne({
            where: { id: collaborationId },
            select: ["vendor1Id", "vendor2Id", "productIds"],
        });
        if (!collaboration) {
            throw new Error("Collaboration not found");
        }
        if (collaboration.vendor1Id !== vendorId &&
            collaboration.vendor2Id !== vendorId) {
            throw new Error("You are not part of this collaboration");
        }
        if (!collaboration.productIds || collaboration.productIds.length === 0) {
            return [];
        }
        const products = await productRepo.find({
            where: {
                id: (0, typeorm_1.In)(collaboration.productIds),
                isActive: true,
                isApproved: true,
            },
            relations: ["vendor", "vendor.vendorProfile"],
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                discountPrice: true,
                images: true,
                stockQuantity: true,
                rating: true,
                totalSales: true,
                madeInNigeria: true,
                originState: true,
                originCity: true,
                vendor: {
                    id: true,
                    businessName: true,
                    vendorProfile: {
                        profileImage: true,
                    },
                },
            },
        });
        return products;
    }
    async updateCollaborationStatus(vendorId, collaborationId, status) {
        const collaboration = await collabRepo.findOne({
            where: { id: collaborationId },
        });
        if (!collaboration) {
            throw new Error("Collaboration not found");
        }
        if (collaboration.vendor1Id !== vendorId &&
            collaboration.vendor2Id !== vendorId) {
            throw new Error("You are not part of this collaboration");
        }
        collaboration.status = status;
        return await collabRepo.save(collaboration);
    }
}
exports.VendorCollaborationService = VendorCollaborationService;
exports.default = new VendorCollaborationService();
//# sourceMappingURL=collaborationService.js.map