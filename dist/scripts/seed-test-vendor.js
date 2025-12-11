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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTestVendor = void 0;
require("reflect-metadata");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Vendor_1 = require("../entities/Vendor");
const VendorProfile_1 = require("../entities/VendorProfile");
const Product_1 = require("../entities/Product");
const Category_1 = require("../entities/Category");
const VENDOR_EMAIL = 'john_vendor@venda.com';
const VENDOR_PASSWORD = 'Cert123**';
const VENDOR_PHONE = '08067268692';
const VENDOR_BUSINESS_NAME = 'John\'s Fashion Hub';
const ABUJA_COORDINATES = {
    latitude: 9.072264,
    longitude: 7.491302,
    city: 'Abuja',
    state: 'FCT',
    address: 'Plot 123, Wuse 2, Abuja, FCT'
};
const createCategories = async (dataSource) => {
    const categoryRepo = dataSource.getRepository(Category_1.Category);
    const categories = [
        { name: 'Clothing', slug: 'clothing', description: 'Fashion clothing items' },
        { name: 'Accessories', slug: 'accessories', description: 'Fashion accessories' },
        { name: 'Footwear', slug: 'footwear', description: 'Shoes and sandals' },
        { name: 'Jewelry', slug: 'jewelry', description: 'Jewelry and watches' },
        { name: 'Bags', slug: 'bags', description: 'Bags and purses' },
    ];
    const createdCategories = [];
    for (const cat of categories) {
        let category = await categoryRepo.findOne({ where: { slug: cat.slug } });
        if (!category) {
            category = categoryRepo.create(cat);
            await categoryRepo.save(category);
        }
        createdCategories.push(category);
    }
    return createdCategories;
};
const createTestVendor = async (dataSource) => {
    const vendorRepo = dataSource.getRepository(Vendor_1.Vendor);
    const profileRepo = dataSource.getRepository(VendorProfile_1.VendorProfile);
    let vendor = await vendorRepo.findOne({ where: { email: VENDOR_EMAIL } });
    if (vendor) {
        console.log('Test vendor already exists. Skipping vendor creation.');
        return vendor;
    }
    const hashedPassword = await bcrypt_1.default.hash(VENDOR_PASSWORD, 10);
    vendor = vendorRepo.create({
        email: VENDOR_EMAIL,
        password: hashedPassword,
        businessName: VENDOR_BUSINESS_NAME,
        phone: VENDOR_PHONE,
        latitude: ABUJA_COORDINATES.latitude,
        longitude: ABUJA_COORDINATES.longitude,
        city: ABUJA_COORDINATES.city,
        state: ABUJA_COORDINATES.state,
        address: ABUJA_COORDINATES.address,
        isApproved: true,
        isActive: true,
        isVerified: true,
        subscriptionTier: 'starter',
        subscriptionExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        wallet: { balance: 5000, pendingBalance: 0 },
    });
    vendor = await vendorRepo.save(vendor);
    console.log('✅ Test vendor created:', vendor.email);
    const profile = profileRepo.create({
        vendorId: vendor.id,
        businessName: VENDOR_BUSINESS_NAME,
        businessDescription: 'Premium fashion items from clothing to accessories. Quality guaranteed!',
        businessAddress: ABUJA_COORDINATES.address,
        businessPhone: VENDOR_PHONE,
        isApproved: true,
    });
    await profileRepo.save(profile);
    console.log('✅ Vendor profile created');
    return vendor;
};
const createTestProducts = async (dataSource, vendor, categories) => {
    const productRepo = dataSource.getRepository(Product_1.Product);
    const [clothingCat, accessoriesCat, footwearCat, jewelryCat, bagsCat] = categories;
    const products = [
        {
            name: 'Premium Cotton T-Shirt',
            description: 'Soft, breathable cotton t-shirt perfect for casual wear. Available in multiple colors and sizes.',
            price: 3500,
            discountPrice: 2800,
            stockQuantity: 50,
            images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500'],
            gender: 'unisex',
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['White', 'Black', 'Navy', 'Gray'],
            categoryId: clothingCat.id,
            madeInNigeria: true,
            originState: 'FCT',
            originCity: 'Abuja',
            stylesTags: ['casual', 'streetwear'],
            isApproved: true,
            isFeatured: true,
            rating: 4.5,
            totalReviews: 12,
        },
        {
            name: 'Ankara Print Dress',
            description: 'Beautiful Ankara print dress with vibrant colors. Perfect for parties and special occasions.',
            price: 12000,
            stockQuantity: 25,
            images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'],
            gender: 'female',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Multi-color', 'Blue/Gold', 'Red/Green'],
            categoryId: clothingCat.id,
            madeInNigeria: true,
            originState: 'FCT',
            originCity: 'Abuja',
            stylesTags: ['traditional', 'luxury', 'ankara'],
            isApproved: true,
            isFeatured: true,
            rating: 4.8,
            totalReviews: 20,
        },
        {
            name: 'Slim Fit Jeans',
            description: 'Classic slim fit jeans with stretch fabric for comfort. Durable and stylish.',
            price: 8500,
            discountPrice: 7000,
            stockQuantity: 40,
            images: ['https://images.unsplash.com/photo-1542272454315-7f6fa8d3a5a9?w=500'],
            gender: 'male',
            sizes: ['28', '30', '32', '34', '36', '38'],
            colors: ['Blue', 'Black', 'Gray'],
            categoryId: clothingCat.id,
            madeInNigeria: false,
            stylesTags: ['casual', 'denim'],
            isApproved: true,
            rating: 4.3,
            totalReviews: 8,
        },
        {
            name: 'Leather Handbag',
            description: 'Elegant leather handbag with multiple compartments. Perfect for work or casual outings.',
            price: 15000,
            stockQuantity: 15,
            images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500'],
            gender: 'female',
            sizes: ['One Size'],
            colors: ['Brown', 'Black', 'Tan'],
            categoryId: bagsCat.id,
            madeInNigeria: false,
            stylesTags: ['luxury', 'formal'],
            isApproved: true,
            rating: 4.6,
            totalReviews: 15,
        },
        {
            name: 'Designer Wristwatch',
            description: 'Elegant stainless steel wristwatch with leather strap. Water-resistant and stylish.',
            price: 25000,
            discountPrice: 20000,
            stockQuantity: 20,
            images: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500'],
            gender: 'unisex',
            sizes: ['One Size'],
            colors: ['Silver', 'Gold', 'Rose Gold'],
            categoryId: jewelryCat.id,
            madeInNigeria: false,
            stylesTags: ['luxury', 'formal', 'accessories'],
            isApproved: true,
            isFeatured: true,
            rating: 4.9,
            totalReviews: 25,
        },
        {
            name: 'Leather Belt',
            description: 'Genuine leather belt with metal buckle. Perfect for formal and casual wear.',
            price: 4500,
            stockQuantity: 30,
            images: ['https://images.unsplash.com/photo-1624222247344-550fb60583c2?w=500'],
            gender: 'male',
            sizes: ['32', '34', '36', '38', '40'],
            colors: ['Brown', 'Black'],
            categoryId: accessoriesCat.id,
            madeInNigeria: true,
            originState: 'FCT',
            stylesTags: ['formal', 'accessories'],
            isApproved: true,
            rating: 4.4,
            totalReviews: 10,
        },
        {
            name: 'Canvas Sneakers',
            description: 'Comfortable canvas sneakers perfect for everyday wear. Lightweight and breathable.',
            price: 9500,
            discountPrice: 7500,
            stockQuantity: 35,
            images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
            gender: 'unisex',
            sizes: ['38', '39', '40', '41', '42', '43', '44'],
            colors: ['White', 'Black', 'Navy', 'Red'],
            categoryId: footwearCat.id,
            madeInNigeria: false,
            stylesTags: ['casual', 'streetwear', 'sneakers'],
            isApproved: true,
            rating: 4.7,
            totalReviews: 18,
        },
        {
            name: 'Formal Leather Shoes',
            description: 'Classic leather oxford shoes for formal occasions. Comfortable and elegant.',
            price: 18000,
            stockQuantity: 20,
            images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500'],
            gender: 'male',
            sizes: ['40', '41', '42', '43', '44', '45'],
            colors: ['Black', 'Brown'],
            categoryId: footwearCat.id,
            madeInNigeria: false,
            stylesTags: ['formal', 'luxury'],
            isApproved: true,
            isFeatured: true,
            rating: 4.5,
            totalReviews: 14,
        },
        {
            name: 'Fashion Sunglasses',
            description: 'Trendy sunglasses with UV protection. Perfect for sunny days.',
            price: 5500,
            discountPrice: 4000,
            stockQuantity: 45,
            images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'],
            gender: 'unisex',
            sizes: ['One Size'],
            colors: ['Black', 'Brown', 'Gold'],
            categoryId: accessoriesCat.id,
            madeInNigeria: false,
            stylesTags: ['casual', 'accessories', 'summer'],
            isApproved: true,
            rating: 4.2,
            totalReviews: 7,
        },
        {
            name: 'Women\'s Sandals',
            description: 'Comfortable leather sandals perfect for casual wear. Stylish and durable.',
            price: 7000,
            stockQuantity: 30,
            images: ['https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=500'],
            gender: 'female',
            sizes: ['36', '37', '38', '39', '40', '41'],
            colors: ['Brown', 'Black', 'Beige'],
            categoryId: footwearCat.id,
            madeInNigeria: true,
            originState: 'FCT',
            stylesTags: ['casual', 'summer'],
            isApproved: true,
            rating: 4.4,
            totalReviews: 11,
        },
        {
            name: 'Statement Necklace',
            description: 'Elegant statement necklace with semi-precious stones. Perfect for special occasions.',
            price: 8500,
            stockQuantity: 18,
            images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500'],
            gender: 'female',
            sizes: ['One Size'],
            colors: ['Gold', 'Silver', 'Rose Gold'],
            categoryId: jewelryCat.id,
            madeInNigeria: true,
            originState: 'FCT',
            originCity: 'Abuja',
            stylesTags: ['luxury', 'accessories', 'jewelry'],
            isApproved: true,
            rating: 4.7,
            totalReviews: 9,
        },
        {
            name: 'Backpack',
            description: 'Stylish and functional backpack with laptop compartment. Perfect for work or school.',
            price: 12500,
            discountPrice: 10000,
            stockQuantity: 25,
            images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
            gender: 'unisex',
            sizes: ['One Size'],
            colors: ['Black', 'Navy', 'Gray'],
            categoryId: bagsCat.id,
            madeInNigeria: false,
            stylesTags: ['casual', 'work', 'school'],
            isApproved: true,
            isFeatured: true,
            rating: 4.6,
            totalReviews: 16,
        },
    ];
    let processedCount = 0;
    for (const productData of products) {
        const existingProduct = await productRepo.findOne({
            where: {
                name: productData.name,
                vendorId: vendor.id
            }
        });
        if (existingProduct) {
            await productRepo.update(existingProduct.id, {
                images: productData.images,
                sizes: productData.sizes,
                colors: productData.colors,
                stylesTags: productData.stylesTags,
                description: productData.description,
                price: productData.price,
                discountPrice: productData.discountPrice,
                stockQuantity: productData.stockQuantity
            });
            console.log(`🔄 Updated ${productData.name}`);
        }
        else {
            const product = productRepo.create({
                ...productData,
                vendorId: vendor.id,
            });
            await productRepo.save(product);
            console.log(`✅ Created ${productData.name}`);
        }
        processedCount++;
    }
    console.log(`🎉 Processed ${processedCount} products (created/updated)`);
};
const seedTestVendor = async (dataSource) => {
    try {
        console.log('🌱 Starting test vendor seed...\n');
        const categories = await createCategories(dataSource);
        console.log(`✅ Categories ready: ${categories.length}\n`);
        const vendor = await createTestVendor(dataSource);
        await createTestProducts(dataSource, vendor, categories);
        console.log('\n✅ Test vendor seed completed successfully!');
        console.log('\n📊 Vendor Details:');
        console.log(`   Email: ${VENDOR_EMAIL}`);
        console.log(`   Password: ${VENDOR_PASSWORD}`);
        console.log(`   Phone: ${VENDOR_PHONE}`);
        console.log(`   Location: ${ABUJA_COORDINATES.city}, ${ABUJA_COORDINATES.state}`);
        console.log(`   Subscription: starter (expires in 1 year)`);
        console.log(`   Wallet Balance: ₦5,000\n`);
    }
    catch (error) {
        console.error('❌ Error seeding test vendor:', error);
        throw error;
    }
};
exports.seedTestVendor = seedTestVendor;
if (require.main === module) {
    Promise.resolve().then(() => __importStar(require('../config/data-source'))).then(({ AppDataSource }) => {
        AppDataSource.initialize()
            .then(async (dataSource) => {
            await (0, exports.seedTestVendor)(dataSource);
            await dataSource.destroy();
            process.exit(0);
        })
            .catch((error) => {
            console.error('Error initializing database:', error);
            process.exit(1);
        });
    });
}
//# sourceMappingURL=seed-test-vendor.js.map