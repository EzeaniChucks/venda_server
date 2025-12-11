import 'reflect-metadata';
import { AppDataSource } from '../config/data-source';

async function runMigrations() {
  try {
    console.log('🔄 Connecting to database...');
    await AppDataSource.initialize();
    
    console.log('🔄 Running pending migrations...');
    const migrations = await AppDataSource.runMigrations({ transaction: 'all' });
    
    if (migrations.length === 0) {
      console.log('✅ No pending migrations found. Database is up to date!');
    } else {
      console.log(`✅ Successfully ran ${migrations.length} migration(s):`);
      migrations.forEach(migration => {
        console.log(`   - ${migration.name}`);
      });
    }
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();
