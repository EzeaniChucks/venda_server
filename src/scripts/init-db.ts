import 'reflect-metadata';
import { AppDataSource } from '../config/data-source';
import { Admin } from '../entities/Admin';
import { Category } from '../entities/Category';
import * as bcrypt from 'bcrypt';

async function initializeDatabase() {
  console.log('🔄 Initializing VENDA database...\n');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    const categoryRepository = AppDataSource.getRepository(Category);
    const adminRepository = AppDataSource.getRepository(Admin);

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
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('\n🎉 Database initialization complete!\n');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
