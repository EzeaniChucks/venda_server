"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../config/data-source");
const Admin_1 = require("../entities/Admin");
const Category_1 = require("../entities/Category");
const bcrypt = __importStar(require("bcrypt"));
async function initializeDatabase() {
    console.log('🔄 Initializing VENDA database...\n');
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Database connection established\n');
        const categoryRepository = data_source_1.AppDataSource.getRepository(Category_1.Category);
        const adminRepository = data_source_1.AppDataSource.getRepository(Admin_1.Admin);
        console.log('📦 Inserting initial data...');
        const categories = [
            { name: 'Dresses', slug: 'dresses', description: 'Elegant dresses for all occasions', icon: '👗' },
            { name: 'Tops', slug: 'tops', description: 'Stylish tops and blouses', icon: '👚' },
            { name: 'Bottoms', slug: 'bottoms', description: 'Pants, skirts, and shorts', icon: '👖' },
            { name: 'Shoes', slug: 'shoes', description: 'Footwear for every style', icon: '👠' },
            { name: 'Accessories', slug: 'accessories', description: 'Complete your look', icon: '👜' },
            { name: 'Kids Fashion', slug: 'kids-fashion', description: 'Fashion for children', icon: '👶' }
        ];
        for (const cat of categories) {
            const existing = await categoryRepository.findOne({ where: { slug: cat.slug } });
            if (!existing) {
                const category = categoryRepository.create(cat);
                await categoryRepository.save(category);
                console.log(`✅ Category created: ${cat.name}`);
            }
        }
        const existingAdmin = await adminRepository.findOne({ where: { email: 'admin@venda.com' } });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = adminRepository.create({
                email: 'admin@venda.com',
                password: hashedPassword,
                fullName: 'VENDA Admin',
                isActive: true
            });
            await adminRepository.save(admin);
            console.log('✅ Admin user created (email: admin@venda.com, password: admin123)');
        }
        else {
            console.log('ℹ️  Admin user already exists');
        }
        console.log('\n🎉 Database initialization complete!\n');
        await data_source_1.AppDataSource.destroy();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}
initializeDatabase();
//# sourceMappingURL=init-db.js.map