"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../config/data-source");
async function runMigrations() {
    try {
        console.log('🔄 Connecting to database...');
        await data_source_1.AppDataSource.initialize();
        console.log('🔄 Running pending migrations...');
        const migrations = await data_source_1.AppDataSource.runMigrations({ transaction: 'all' });
        if (migrations.length === 0) {
            console.log('✅ No pending migrations found. Database is up to date!');
        }
        else {
            console.log(`✅ Successfully ran ${migrations.length} migration(s):`);
            migrations.forEach(migration => {
                console.log(`   - ${migration.name}`);
            });
        }
        await data_source_1.AppDataSource.destroy();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error running migrations:', error);
        process.exit(1);
    }
}
runMigrations();
//# sourceMappingURL=run-migrations.js.map