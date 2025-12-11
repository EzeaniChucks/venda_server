"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
require("dotenv/config");
const path_1 = require("path");
const sslEnabled = process.env.DB_SSL === undefined;
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    migrationsTableName: "migrations",
    entities: [(0, path_1.join)(__dirname, "../entities/*.{ts,js}")],
    migrations: [(0, path_1.join)(__dirname, "../migrations/*.{ts,js}")],
    logging: false,
    synchronize: false,
    migrationsRun: false,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
});
const initializeDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        console.log("✅ Database connection established successfully");
        return exports.AppDataSource;
    }
    catch (error) {
        console.error("❌ Error during Data Source initialization:", error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=data-source.js.map