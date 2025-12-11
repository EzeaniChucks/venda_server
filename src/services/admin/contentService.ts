import { AppDataSource } from '../../config/data-source';
import { News } from '../../entities/News';
import { Model } from '../../entities/Model';

const newsRepo = AppDataSource.getRepository(News);
const modelRepo = AppDataSource.getRepository(Model);

export const contentService = {
  async createNews(data: { title: string; content: string; image?: string; author?: string }) {
    const news = newsRepo.create({
      ...data,
      isActive: true
    });
    return await newsRepo.save(news);
  },

  async getAllNews(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;
    const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined;

    const where: any = {};
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

  async getNewsById(id: string) {
    const news = await newsRepo.findOne({ where: { id } });
    if (!news) {
      throw new Error('News article not found');
    }
    return news;
  },

  async updateNews(id: string, data: Partial<News>) {
    const news = await newsRepo.findOne({ where: { id } });
    if (!news) {
      throw new Error('News article not found');
    }

    Object.assign(news, data);
    return await newsRepo.save(news);
  },

  async deleteNews(id: string) {
    const news = await newsRepo.findOne({ where: { id } });
    if (!news) {
      throw new Error('News article not found');
    }

    await newsRepo.remove(news);
    return { message: 'News article deleted successfully' };
  },

  async createModel(data: { name: string; bio?: string; profileImage?: string; portfolioImages?: string[]; instagramHandle?: string; twitterHandle?: string }) {
    const model = modelRepo.create(data);
    return await modelRepo.save(model);
  },

  async getAllModels(query: any) {
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

  async getModelById(id: string) {
    const model = await modelRepo.findOne({ where: { id } });
    if (!model) {
      throw new Error('Model not found');
    }
    return model;
  },

  async updateModel(id: string, data: Partial<Model>) {
    const model = await modelRepo.findOne({ where: { id } });
    if (!model) {
      throw new Error('Model not found');
    }

    Object.assign(model, data);
    return await modelRepo.save(model);
  },

  async deleteModel(id: string) {
    const model = await modelRepo.findOne({ where: { id } });
    if (!model) {
      throw new Error('Model not found');
    }

    await modelRepo.remove(model);
    return { message: 'Model deleted successfully' };
  }
};
