"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentService = void 0;
const data_source_1 = require("../../config/data-source");
const News_1 = require("../../entities/News");
const Model_1 = require("../../entities/Model");
const newsRepo = data_source_1.AppDataSource.getRepository(News_1.News);
const modelRepo = data_source_1.AppDataSource.getRepository(Model_1.Model);
exports.contentService = {
    async createNews(data) {
        const news = newsRepo.create({
            ...data,
            isActive: true
        });
        return await newsRepo.save(news);
    },
    async getAllNews(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;
        const skip = (page - 1) * limit;
        const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined;
        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [news, total] = await newsRepo.findAndCount({
            where,
            skip,
            take: limit,
            order: { createdAt: 'DESC' }
        });
        return { news, total, page, limit };
    },
    async getNewsById(id) {
        const news = await newsRepo.findOne({ where: { id } });
        if (!news) {
            throw new Error('News article not found');
        }
        return news;
    },
    async updateNews(id, data) {
        const news = await newsRepo.findOne({ where: { id } });
        if (!news) {
            throw new Error('News article not found');
        }
        Object.assign(news, data);
        return await newsRepo.save(news);
    },
    async deleteNews(id) {
        const news = await newsRepo.findOne({ where: { id } });
        if (!news) {
            throw new Error('News article not found');
        }
        await newsRepo.remove(news);
        return { message: 'News article deleted successfully' };
    },
    async createModel(data) {
        const model = modelRepo.create(data);
        return await modelRepo.save(model);
    },
    async getAllModels(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;
        const skip = (page - 1) * limit;
        const [models, total] = await modelRepo.findAndCount({
            skip,
            take: limit,
            order: { name: 'ASC' }
        });
        return { models, total, page, limit };
    },
    async getModelById(id) {
        const model = await modelRepo.findOne({ where: { id } });
        if (!model) {
            throw new Error('Model not found');
        }
        return model;
    },
    async updateModel(id, data) {
        const model = await modelRepo.findOne({ where: { id } });
        if (!model) {
            throw new Error('Model not found');
        }
        Object.assign(model, data);
        return await modelRepo.save(model);
    },
    async deleteModel(id) {
        const model = await modelRepo.findOne({ where: { id } });
        if (!model) {
            throw new Error('Model not found');
        }
        await modelRepo.remove(model);
        return { message: 'Model deleted successfully' };
    }
};
//# sourceMappingURL=contentService.js.map