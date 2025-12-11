// routes/analytics.routes.ts
import { Router } from "express";
import { AnalyticsController } from "../../controllers/vendor/analyticsController";
import { authenticate } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";
import { query } from "express-validator";
import { AuthRequest } from "../../types";

const router = Router();

// Cache middleware
const cacheMiddleware = (duration: number) => {
  return (req: any, res: any, next: any) => {
    // Only cache GET requests
    if (req.method !== "GET") return next();

    const key = `analytics:${req.user?.id}:${req.originalUrl}`;

    // Check cache (using Redis or similar)
    // This is a placeholder - implement your caching logic
    const cached = null; // await redis.get(key);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Override res.json to cache response
    const originalJson = res.json;
    res.json = function (data: any) {
      // Cache the response
      // await redis.setex(key, duration, JSON.stringify(data));
      originalJson.call(this, data);
    };

    next();
  };
};

// Vendor Analytics Routes (with caching applied individually)
router.get(
  "/overview",
  authenticate,
  cacheMiddleware(300), // 5 minutes cache
  [
    query("startDate").optional().isISO8601().toDate(),
    query("endDate").optional().isISO8601().toDate(),
  ],
  validateRequest,
  AnalyticsController.getVendorOverview
);

router.get(
  "/sales",
  authenticate,
  cacheMiddleware(300),
  [
    query("period")
      .optional()
      .isIn(["today", "week", "month", "quarter", "year", "custom"]),
    query("startDate").optional().isISO8601().toDate(),
    query("endDate").optional().isISO8601().toDate(),
  ],
  validateRequest,
  AnalyticsController.getSalesTrends
);

router.get(
  "/products",
  authenticate,
  cacheMiddleware(300),
  [
    query("startDate").optional().isISO8601().toDate(),
    query("endDate").optional().isISO8601().toDate(),
  ],
  validateRequest,
  AnalyticsController.getProductPerformance
);

router.get(
  "/orders",
  authenticate,
  cacheMiddleware(300),
  [
    query("startDate").optional().isISO8601().toDate(),
    query("endDate").optional().isISO8601().toDate(),
  ],
  validateRequest,
  AnalyticsController.getOrderAnalytics
);

router.get(
  "/customers",
  authenticate,
  cacheMiddleware(300),
  [
    query("startDate").optional().isISO8601().toDate(),
    query("endDate").optional().isISO8601().toDate(),
  ],
  validateRequest,
  AnalyticsController.getCustomerAnalytics
);

router.get(
  "/regional",
  authenticate,
  cacheMiddleware(300),
  [
    query("startDate").optional().isISO8601().toDate(),
    query("endDate").optional().isISO8601().toDate(),
  ],
  validateRequest,
  AnalyticsController.getRegionalAnalytics
);

router.get(
  "/real-time",
  authenticate,
  // No cache for real-time data
  AnalyticsController.getRealTimeAnalytics
);

router.get(
  "/export",
  authenticate,
  [
    query("format").optional().isIn(["csv", "pdf"]),
    query("startDate").optional().isISO8601().toDate(),
    query("endDate").optional().isISO8601().toDate(),
  ],
  validateRequest,
  AnalyticsController.exportAnalytics
);

// Admin Analytics Routes
router.get(
  "/admin/platform-overview",
  authenticate,
  (req: AuthRequest, res, next) => {
    if (req.user!.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    next();
  },
  cacheMiddleware(300),
  AnalyticsController.getPlatformOverview
);

// Additional admin endpoints
router.get(
  "/admin/vendors-performance",
  authenticate,
  (req: AuthRequest, res, next) => {
    if (req.user!.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    next();
  },
  cacheMiddleware(300),
  async (req, res) => {
    // Implement vendor performance ranking
    res.json({
      success: true,
      data: {
        topVendors: [
          {
            id: "uuid",
            businessName: "Fashion House",
            totalSales: 1200000,
            orders: 980,
            rating: 4.8,
            location: "Uyo, Akwa Ibom",
          },
        ],
      },
    });
  }
);

export default router;