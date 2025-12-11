import "reflect-metadata";
import { DataSource } from "typeorm";
import "dotenv/config"; // Add this line
import { join } from "path";

const sslEnabled = process.env.DB_SSL === undefined;

export const AppDataSource = new DataSource({
  type: "postgres",
  // url: process.env.DATABASE_URL + "?sslmode=disable",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // synchronize: process.env.NODE_ENV === "development",
  // logging: process.env.NODE_ENV === "development",
  // migrations: [__dirname + "/../migrations/*{.ts,.js}"],
  migrationsTableName: "migrations",
  entities: [join(__dirname, "../entities/*.{ts,js}")],
  migrations: [join(__dirname, "../migrations/*.{ts,js}")],
  logging: false,
  synchronize: false,
  migrationsRun: false, // Don't auto run migrations on app start
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connection established successfully");
    return AppDataSource;
  } catch (error) {
    console.error("❌ Error during Data Source initialization:", error);
    throw error;
  }
};
