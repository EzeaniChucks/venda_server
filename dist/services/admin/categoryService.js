"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const data_source_1 = require("../../config/data-source");
const Category_1 = require("../../entities/Category");
const categoryRepo = data_source_1.AppDataSource.getRepository(Category_1.Category);
exports.categoryService = {
    async createCategory(data) {
        const existingCategory = await categoryRepo.findOne({ where: [{ name: data.name }, { slug: data.slug }] });
        if (existingCategory) {
            throw new Error('Category with this name or slug already exists');
        }
        const category = categoryRepo.create(data);
        return await categoryRepo.save(category);
    },
    async getAllCategories(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 50;
        const skip = (page - 1) * limit;
        const [categories, total] = await categoryRepo.findAndCount({
            skip,
            take: limit,
            order: { name: 'ASC' }
        });
        return { categories, total, page, limit };
    },
    async getCategoryById(id) {
        const category = await categoryRepo.findOne({
            where: { id },
            relations: ['products']
        });
        if (!category) {
            throw new Error('Category not found');
        }
        return category;
    },
    async updateCategory(id, data) {
        const category = await categoryRepo.findOne({ where: { id } });
        if (!category) {
            throw new Error('Category not found');
        }
        if (data.name || data.slug) {
            const existingCategory = await categoryRepo.findOne({
                where: [{ name: data.name }, { slug: data.slug }]
            });
            if (existingCategory && existingCategory.id !== id) {
                throw new Error('Category with this name or slug already exists');
            }
        }
        Object.assign(category, data);
        return await categoryRepo.save(category);
    },
    async deleteCategory(id) {
        const category = await categoryRepo.findOne({
            where: { id },
            relations: ['products']
        });
        if (!category) {
            throw new Error('Category not found');
        }
        if (category.products && category.products.length > 0) {
            throw new Error('Cannot delete category with associated products. Please reassign or delete products first.');
        }
        await categoryRepo.remove(category);
        return { message: 'Category deleted successfully' };
    }
};
//# sourceMappingURL=categoryService.js.map