"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const data_source_1 = require("./config/data-source");
const orderTracking_socket_1 = require("./sockets/orderTracking.socket");
const renewalCronService_1 = __importDefault(require("./services/subscription/renewalCronService"));
const authRoutes_1 = __importDefault(require("./routes/customer/authRoutes"));
const authRoutes_2 = __importDefault(require("./routes/vendor/authRoutes"));
const authRoutes_3 = __importDefault(require("./routes/rider/authRoutes"));
const authRoutes_4 = __importDefault(require("./routes/admin/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/shared/productRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/customer/cartRoutes"));
const wishlistRoutes_1 = __importDefault(require("./routes/customer/wishlistRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/customer/orderRoutes"));
const walletRoutes_1 = __importDefault(require("./routes/customer/walletRoutes"));
const vendorRoutes_1 = __importDefault(require("./routes/vendor/vendorRoutes"));
const orderRoutes_2 = __importDefault(require("./routes/vendor/orderRoutes"));
const riderRoutes_1 = __importDefault(require("./routes/rider/riderRoutes"));
const riderDocumentRoutes_1 = __importDefault(require("./routes/rider/riderDocumentRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/admin/adminRoutes"));
const adminDocumentRoutes_1 = __importDefault(require("./routes/admin/adminDocumentRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/admin/categoryRoutes"));
const contentRoutes_1 = __importDefault(require("./routes/admin/contentRoutes"));
const vendorFeatureRoutes_1 = __importDefault(require("./routes/admin/vendorFeatureRoutes"));
const orderManagementRoutes_1 = __importDefault(require("./routes/admin/orderManagementRoutes"));
const payments_1 = __importDefault(require("./routes/shared/payments"));
const upload_1 = __importDefault(require("./routes/shared/upload"));
const fashion_feed_1 = __importDefault(require("./routes/shared/fashion-feed"));
const verification_routes_1 = __importDefault(require("./routes/shared/verification.routes"));
const passwordReset_routes_1 = __importDefault(require("./routes/shared/passwordReset.routes"));
const wallet_routes_1 = __importDefault(require("./routes/shared/wallet.routes"));
const location_routes_1 = __importDefault(require("./routes/shared/location.routes"));
const bankRoutes_1 = __importDefault(require("./routes/shared/bankRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/vendor/analyticsRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/shared/notificationRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 8080;
const allowedOrigins = [
    "http://localhost:5000",
    "https://localhost:5000",
    "http://127.0.0.1:5000",
    "https://4a7c364f-04c2-4fe1-ae17-20ee3047c6a4-00-ckknkalgy9ty.kirk.replit.dev",
    "http://4a7c364f-04c2-4fe1-ae17-20ee3047c6a4-00-ckknkalgy9ty.kirk.replit.dev",
];
const corsOptions = {
    origin: function (origin, callback) {
        console.log("🔍 CORS Request from origin:", origin || "no origin");
        if (!origin) {
            console.log("✅ CORS: Allowing request with no origin");
            return callback(null, true);
        }
        if (allowedOrigins.some((allowed) => origin.includes(allowed) || allowed.includes(origin))) {
            console.log("✅ CORS: Origin whitelisted:", origin);
            return callback(null, true);
        }
        if (origin.includes("replit.dev") ||
            origin.includes("localhost") ||
            origin.includes("127.0.0.1")) {
            console.log("✅ CORS: Replit/localhost domain allowed:", origin);
            return callback(null, true);
        }
        console.log("✅ CORS: Development mode - allowing origin:", origin);
        callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
};
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("dev"));
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "VENDA API Server (TypeScript + TypeORM) is running",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
    });
});
app.get("/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        database: "connected",
    });
});
app.use("/api/customer/auth", authRoutes_1.default);
app.use("/api/vendor/auth", authRoutes_2.default);
app.use("/api/rider/auth", authRoutes_3.default);
app.use("/api/admin/auth", authRoutes_4.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/payments", payments_1.default);
app.use("/api/upload", upload_1.default);
app.use('/api/bank', bankRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use("/api/customer/cart", cartRoutes_1.default);
app.use("/api/customer/wishlist", wishlistRoutes_1.default);
app.use("/api/customer/orders", orderRoutes_1.default);
app.use("/api/customer/wallet", walletRoutes_1.default);
app.use("/api/verification", verification_routes_1.default);
app.use("/api/shared/auth", passwordReset_routes_1.default);
app.use("/api/v2/wallet", wallet_routes_1.default);
app.use("/api/locations", location_routes_1.default);
app.use("/api/vendor", vendorRoutes_1.default);
app.use("/api/vendor/orders", orderRoutes_2.default);
app.use('/api/vendor/analytics', analyticsRoutes_1.default);
app.use("/api/rider/documents", riderDocumentRoutes_1.default);
app.use("/api/rider", riderRoutes_1.default);
app.use("/api/admin/documents", adminDocumentRoutes_1.default);
app.use("/api/admin/categories", categoryRoutes_1.default);
app.use("/api/admin/content", contentRoutes_1.default);
app.use("/api/admin/features", vendorFeatureRoutes_1.default);
app.use("/api/admin/management", orderManagementRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/fashion-feed", fashion_feed_1.default);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});
const startServer = async () => {
    try {
        await (0, data_source_1.initializeDatabase)();
        renewalCronService_1.default.start();
        const httpServer = (0, http_1.createServer)(app);
        (0, orderTracking_socket_1.initializeOrderTracking)(httpServer);
        httpServer.listen(PORT, "0.0.0.0", () => {
            console.log(`\n🚀 VENDA API Server (TypeScript + TypeORM) started successfully!`);
            console.log(`📍 Server running on port ${PORT} (bound to 0.0.0.0)`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`   Health: http://localhost:${PORT}/health`);
            console.log(`\n🔌 WebSocket: Real-time order tracking enabled`);
            console.log(`\n✨ Ready to accept requests!`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map