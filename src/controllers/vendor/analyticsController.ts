// controllers/analytics.controller.ts
import { Request, Response } from "express";
import AnalyticsService from "../../services/vendor/analyticsService";
import { successResponse, errorResponse } from "../../utils/response";
import { AuthRequest } from "../../types";

export class AnalyticsController {
  // Get vendor overview
  static getVendorOverview = async (req: AuthRequest, res: Response) => {
    try {
      const vendorId = req.user!.id;
      const { startDate, endDate } = req.query;

      const dateRange = {
        startDate: startDate
          ? new Date(startDate as string)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endDate: endDate ? new Date(endDate as string) : new Date(),
      };

      const data = await AnalyticsService.getVendorOverview(
        vendorId,
        dateRange
      );

      return successResponse(
        res,
        data,
        "Vendor overview retrieved successfully"
      );
    } catch (error: any) {
      console.error("Vendor overview error:", error);
      return errorResponse(
        res,
        error.message || "Failed to retrieve vendor overview"
      );
    }
  };

  // Get sales trends
  static getSalesTrends = async (req: AuthRequest, res: Response) => {
    try {
      const vendorId = req.user!.id;
      const { period = "month", startDate, endDate } = req.query;

      const dateRange = {
        startDate: startDate
          ? new Date(startDate as string)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
      };

      const data = await AnalyticsService.getSalesTrends(
        vendorId,
        period as string,
        dateRange
      );

      return successResponse(res, data, "Sales trends retrieved successfully");
    } catch (error: any) {
      console.error("Sales trends error:", error);
      return errorResponse(
        res,
        error.message || "Failed to retrieve sales trends"
      );
    }
  };

  // Get product performance
  static getProductPerformance = async (req: AuthRequest, res: Response) => {
    try {
      const vendorId = req.user!.id;
      const { startDate, endDate } = req.query;

      const dateRange = {
        startDate: startDate
          ? new Date(startDate as string)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
      };

      const data = await AnalyticsService.getProductPerformance(
        vendorId,
        dateRange
      );

      return successResponse(
        res,
        data,
        "Product performance retrieved successfully"
      );
    } catch (error: any) {
      console.error("Product performance error:", error);
      return errorResponse(
        res,
        error.message || "Failed to retrieve product performance"
      );
    }
  };

  // Get order analytics
  static getOrderAnalytics = async (req: AuthRequest, res: Response) => {
    try {
      const vendorId = req.user!.id;
      const { startDate, endDate } = req.query;

      const dateRange = {
        startDate: startDate
          ? new Date(startDate as string)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
      };

      const data = await AnalyticsService.getOrderAnalytics(
        vendorId,
        dateRange
      );

      return successResponse(
        res,
        data,
        "Order analytics retrieved successfully"
      );
    } catch (error: any) {
      console.error("Order analytics error:", error);
      return errorResponse(
        res,
        error.message || "Failed to retrieve order analytics"
      );
    }
  };

  // Get customer analytics
  static getCustomerAnalytics = async (req: AuthRequest, res: Response) => {
    try {
      const vendorId = req.user!.id;
      const { startDate, endDate } = req.query;

      const dateRange = {
        startDate: startDate
          ? new Date(startDate as string)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
      };

      const data = await AnalyticsService.getCustomerAnalytics(
        vendorId,
        dateRange
      );

      return successResponse(
        res,
        data,
        "Customer analytics retrieved successfully"
      );
    } catch (error: any) {
      console.error("Customer analytics error:", error);
      return errorResponse(
        res,
        error.message || "Failed to retrieve customer analytics"
      );
    }
  };

  // Get regional analytics
  static getRegionalAnalytics = async (req: AuthRequest, res: Response) => {
    try {
      const vendorId = req.user!.id;
      const { startDate, endDate } = req.query;

      const dateRange = {
        startDate: startDate
          ? new Date(startDate as string)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
      };

      const data = await AnalyticsService.getRegionalAnalytics(
        vendorId,
        dateRange
      );

      return successResponse(
        res,
        data,
        "Regional analytics retrieved successfully"
      );
    } catch (error: any) {
      console.error("Regional analytics error:", error);
      return errorResponse(
        res,
        error.message || "Failed to retrieve regional analytics"
      );
    }
  };

  // Get real-time analytics
  static getRealTimeAnalytics = async (req: AuthRequest, res: Response) => {
    try {
      const vendorId = req.user!.id;
      const data = await AnalyticsService.getRealTimeAnalytics(vendorId);

      return successResponse(
        res,
        data,
        "Real-time analytics retrieved successfully"
      );
    } catch (error: any) {
      console.error("Real-time analytics error:", error);
      return errorResponse(
        res,
        error.message || "Failed to retrieve real-time analytics"
      );
    }
  };

  // Export analytics data
  static exportAnalytics = async (req: AuthRequest, res: Response) => {
    try {
      const vendorId = req.user!.id;
      const { format = "csv", startDate, endDate } = req.query;

      const dateRange = {
        startDate: startDate
          ? new Date(startDate as string)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
      };

      // Get all analytics data
      const [overview, sales, products, orders, customers, regional] =
        await Promise.all([
          AnalyticsService.getVendorOverview(vendorId, dateRange),
          AnalyticsService.getSalesTrends(vendorId, "custom", dateRange),
          AnalyticsService.getProductPerformance(vendorId, dateRange),
          AnalyticsService.getOrderAnalytics(vendorId, dateRange),
          AnalyticsService.getCustomerAnalytics(vendorId, dateRange),
          AnalyticsService.getRegionalAnalytics(vendorId, dateRange),
        ]);

      const allData = {
        overview,
        sales,
        products,
        orders,
        customers,
        regional,
        exportDate: new Date().toISOString(),
        dateRange,
      };

      if (format === "csv") {
        // Convert to CSV (simplified example)
        const csvData = this.convertToCSV(allData);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=analytics-${vendorId}-${Date.now()}.csv`
        );
        return res.send(csvData);
      } else {
        // Return JSON for PDF generation on frontend
        return successResponse(res, allData, "Analytics data ready for export");
      }
    } catch (error: any) {
      console.error("Export analytics error:", error);
      return errorResponse(res, error.message || "Failed to export analytics");
    }
  };

  // Admin analytics
  static getPlatformOverview = async (req: AuthRequest, res: Response) => {
    try {
      // Check if user is admin
      if (req.user!.role !== "admin") {
        return errorResponse(res, "Unauthorized access", 403);
      }

      // Get platform-wide analytics
      const totals = {
        totalVendors: 450,
        activeVendors: 320,
        totalCustomers: 12500,
        activeCustomers: 8900,
        totalOrders: 45000,
        platformRevenue: 45000000,
        today: {
          newVendors: 5,
          newCustomers: 89,
          newOrders: 450,
          revenue: 540000,
        },
        growth: {
          vendorGrowth: "+12%",
          customerGrowth: "+8%",
          revenueGrowth: "+15%",
        },
      };

      return successResponse(
        res,
        totals,
        "Platform overview retrieved successfully"
      );
    } catch (error: any) {
      console.error("Platform overview error:", error);
      return errorResponse(
        res,
        error.message || "Failed to retrieve platform overview"
      );
    }
  };

  // Convert data to CSV (simplified)
  private static convertToCSV(data: any): string {
    // This is a simplified CSV conversion
    // In production, you'd want a proper CSV library
    const lines = ["Analytics Report"];
    lines.push(`Export Date: ${data.exportDate}`);
    lines.push(
      `Date Range: ${data.dateRange.startDate} to ${data.dateRange.endDate}`
    );
    lines.push("");

    // Add summary
    lines.push("SUMMARY");
    lines.push("Metric,Value");
    lines.push(`Total Orders,${data.overview.summary.totalOrders}`);
    lines.push(`Total Revenue,${data.overview.summary.totalRevenue}`);
    lines.push(`Average Order Value,${data.overview.summary.avgOrderValue}`);
    lines.push(`Pending Orders,${data.overview.summary.pendingOrders}`);
    lines.push("");

    // Add sales data
    lines.push("SALES TRENDS");
    lines.push("Date,Sales,Orders");
    data.sales.data.forEach((item: any) => {
      lines.push(`${item.date},${item.sales},${item.orders}`);
    });

    return lines.join("\n");
  }
}
