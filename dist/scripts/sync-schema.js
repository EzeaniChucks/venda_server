"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../config/data-source");
async function syncSchema() {
    try {
        console.log('🔄 Connecting to database...');
        await data_source_1.AppDataSource.initialize();
        console.log('🔄 Synchronizing schema...');
        await data_source_1.AppDataSource.synchronize();
        console.log('✅ Schema synchronized successfully!');
        console.log('📊 All entities have been synced to the database');
        await data_source_1.AppDataSource.destroy();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error synchronizing schema:', error);
        process.exit(1);
    }
}
syncSchema();
//# sourceMappingURL=sync-schema.js.map