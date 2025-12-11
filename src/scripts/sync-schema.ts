import 'reflect-metadata';
import { AppDataSource } from '../config/data-source';

async function syncSchema() {
  try {
    console.log('🔄 Connecting to database...');
    await AppDataSource.initialize();
    
    console.log('🔄 Synchronizing schema...');
    await AppDataSource.synchronize();
    
    console.log('✅ Schema synchronized successfully!');
    console.log('📊 All entities have been synced to the database');
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error synchronizing schema:', error);
    process.exit(1);
  }
}

syncSchema();
