import "reflect-metadata";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { initializeDatabase } from "./config/data-source";
import { initializeOrderTracking } from "./sockets/orderTracking.socket";
import renewalCronService from "./services/subscription/renewalCronService";

// Entity-specific auth routes
import customerAuthRoutes from "./routes/customer/authRoutes";
import vendorAuthRoutes from "./routes/vendor/authRoutes";
import riderAuthRoutes from "./routes/rider/authRoutes";
import adminAuthRoutes from "./routes/admin/authRoutes";

// Shared routes
import productRoutes from "./routes/shared/productRoutes";
import cartRoutes from "./routes/customer/cartRoutes";
import wishlistRoutes from "./routes/customer/wishlistRoutes";
import customerOrderRoutes from "./routes/customer/orderRoutes";
import walletRoutes from "./routes/shared/walletRoutes";
import vendorRoutes from "./routes/vendor/vendorRoutes";
import vendorOrderRoutes from "./routes/vendor/orderRoutes";
import riderRoutes from "./routes/rider/riderRoutes";
import riderDocumentRoutes from "./routes/rider/riderDocumentRoutes";
import adminRoutes from "./routes/admin/adminRoutes";
import adminDocumentRoutes from "./routes/admin/adminDocumentRoutes";
import adminCategoryRoutes from "./routes/admin/categoryRoutes";
import adminContentRoutes from "./routes/admin/contentRoutes";
import adminVendorFeatureRoutes from "./routes/admin/vendorFeatureRoutes";
import adminOrderManagementRoutes from "./routes/admin/orderManagementRoutes";
import paymentRoutes from "./routes/shared/paymentsRoutes";
import uploadRoutes from "./routes/shared/upload";
import fashionFeedRoutes from "./routes/shared/fashion-feed";
import verificationRoutes from "./routes/shared/verification.routes";
import passwordResetRoutes from "./routes/shared/passwordReset.routes";
import locationRoutes from "./routes/shared/location.routes";
import bankRoutes from "./routes/shared/bankRoutes";
import analyticsRoutes from './routes/vendor/analyticsRoutes';
import notificationRoutes from './routes/shared/notificationRoutes';


dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 8080;

// CORS configuration for Replit environment
const allowedOrigins = [
  "http://localhost:5000",
  "https://localhost:5000",
  "http://127.0.0.1:5000",
  "https://4a7c364f-04c2-4fe1-ae17-20ee3047c6a4-00-ckknkalgy9ty.kirk.replit.dev",
  "http://4a7c364f-04c2-4fe1-ae17-20ee3047c6a4-00-ckknkalgy9ty.kirk.replit.dev",
];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    console.log("🔍 CORS Request from origin:", origin || "no origin");

    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      console.log("✅ CORS: Allowing request with no origin");
      return callback(null, true);
    }

    // Check if origin is in the whitelist
    if (
      allowedOrigins.some(
        (allowed) => origin.includes(allowed) || allowed.includes(origin)
      )
    ) {
      console.log("✅ CORS: Origin whitelisted:", origin);
      return callback(null, true);
    }

    // Allow any Replit domain or localhost
    if (
      origin.includes("replit.dev") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")
    ) {
      console.log("✅ CORS: Replit/localhost domain allowed:", origin);
      return callback(null, true);
    }

    // Default allow for development
    console.log("✅ CORS: Development mode - allowing origin:", origin);
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

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

// Entity-specific authentication endpoints
app.use("/api/customer/auth", customerAuthRoutes);
app.use("/api/vendor/auth", vendorAuthRoutes);
app.use("/api/rider/auth", riderAuthRoutes);
app.use("/api/admin/auth", adminAuthRoutes);

// Shared routes
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/upload", uploadRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/notifications', notificationRoutes);


// Customer routes
app.use("/api/customer/cart", cartRoutes);
app.use("/api/customer/wishlist", wishlistRoutes);
app.use("/api/customer/orders", customerOrderRoutes);
// app.use("/api/customer/wallet", walletRoutes);

// Advanced features
app.use("/api/verification", verificationRoutes);
app.use("/api/shared/auth", passwordResetRoutes);
app.use("/api/locations", locationRoutes);

// Vendor routes
app.use("/api/vendor", vendorRoutes);
app.use("/api/vendor/orders", vendorOrderRoutes);
app.use('/api/vendor/analytics', analyticsRoutes); // Add this

// Rider routes
app.use("/api/rider/documents", riderDocumentRoutes);
app.use("/api/rider", riderRoutes);

// Admin routes
app.use("/api/admin/documents", adminDocumentRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/content", adminContentRoutes);
app.use("/api/admin/features", adminVendorFeatureRoutes);
app.use("/api/admin/management", adminOrderManagementRoutes);
app.use("/api/admin", adminRoutes);

// Fashion feed
app.use("/api/fashion-feed", fashionFeedRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
);

const startServer = async () => {
  try {
    await initializeDatabase();

    // Start subscription renewal cron job
    renewalCronService.start();

    // Create HTTP server for Socket.io integration
    const httpServer = createServer(app);

    // Initialize WebSocket for order tracking
    initializeOrderTracking(httpServer);

    // Bind to 0.0.0.0 to make the server accessible externally (required for Replit)
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(
        `\n🚀 VENDA API Server (TypeScript + TypeORM) started successfully!`
      );
      console.log(`📍 Server running on port ${PORT} (bound to 0.0.0.0)`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`   Health: http://localhost:${PORT}/health`);
      console.log(`\n🔌 WebSocket: Real-time order tracking enabled`);
      console.log(`\n✨ Ready to accept requests!`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
