// services/analytics.service.ts
import {
  Repository,
  Between,
  In,
  MoreThanOrEqual,
  LessThanOrEqual,
} from "typeorm";
import { Order, OrderStatus } from "../../entities/Order";
import { OrderItem, VendorStatus } from "../../entities/OrderItem";
import { Product } from "../../entities/Product";
import { Customer } from "../../entities/Customer";
import { Vendor } from "../../entities/Vendor";
import { VendorProfile } from "../../entities/VendorProfile";
import { AppDataSource } from "../../config/data-source";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface SummaryStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  conversionRate: number;
  pendingOrders: number;
  vsLastPeriod: {
    orders: string;
    revenue: string;
    avgOrder: string;
  };
}

interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

interface ProductPerformance {
  id: string;
  name: string;
  sales: number;
  orders: number;
  stock: number;
  rating: number;
  images?: string[];
}

interface OrderDistribution {
  status: OrderStatus;
  count: number;
  percentage: number;
  color: string;
}

interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
}

interface RegionalInsight {
  region: string;
  sales: number;
  customers: number;
  growth: string;
}

export class AnalyticsService {
  private orderRepository: Repository<Order>;
  private orderItemRepository: Repository<OrderItem>;
  private productRepository: Repository<Product>;
  private customerRepository: Repository<Customer>;
  private vendorRepository: Repository<Vendor>;
  private vendorProfileRepository: Repository<VendorProfile>;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderItemRepository = AppDataSource.getRepository(OrderItem);
    this.productRepository = AppDataSource.getRepository(Product);
    this.customerRepository = AppDataSource.getRepository(Customer);
    this.vendorRepository = AppDataSource.getRepository(Vendor);
    this.vendorProfileRepository = AppDataSource.getRepository(VendorProfile);
  }

  // Get vendor overview analytics
  async getVendorOverview(
    vendorId: string,
    dateRange: DateRange
  ): Promise<{
    summary: SummaryStats;
    today: {
      orders: number;
      revenue: number;
      newCustomers: number;
    };
    performance: {
      vsLastWeek: string;
      vsLastMonth: string;
    };
  }> {
    const { startDate, endDate } = dateRange;

    // Get current period stats
    const currentOrders = await this.orderItemRepository
      .createQueryBuilder("item")
      .select("COUNT(DISTINCT item.orderId)", "totalOrders")
      .addSelect("SUM(item.totalPrice)", "totalRevenue")
      .where("item.vendorId = :vendorId", { vendorId })
      .andWhere("item.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .getRawOne();

    // Get previous period stats for comparison
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(endDate);
    const periodDays = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    previousStartDate.setDate(previousStartDate.getDate() - periodDays);
    previousEndDate.setDate(previousEndDate.getDate() - periodDays);

    const previousOrders = await this.orderItemRepository
      .createQueryBuilder("item")
      .select("COUNT(DISTINCT item.orderId)", "totalOrders")
      .addSelect("SUM(item.totalPrice)", "totalRevenue")
      .where("item.vendorId = :vendorId", { vendorId })
      .andWhere("item.createdAt BETWEEN :startDate AND :endDate", {
        startDate: previousStartDate,
        endDate: previousEndDate,
      })
      .getRawOne();

    const totalOrders = parseInt(currentOrders?.totalOrders || "0");
    const totalRevenue = parseFloat(currentOrders?.totalRevenue || "0");
    const prevTotalOrders = parseInt(previousOrders?.totalOrders || "0");
    const prevTotalRevenue = parseFloat(previousOrders?.totalRevenue || "0");

    // Calculate percentages
    const orderChange =
      prevTotalOrders > 0
        ? (((totalOrders - prevTotalOrders) / prevTotalOrders) * 100).toFixed(1)
        : "0.0";

    const revenueChange =
      prevTotalRevenue > 0
        ? (
            ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) *
            100
          ).toFixed(1)
        : "0.0";

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const prevAvgOrderValue =
      prevTotalOrders > 0 ? prevTotalRevenue / prevTotalOrders : 0;
    const avgOrderChange =
      prevAvgOrderValue > 0
        ? (
            ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) *
            100
          ).toFixed(1)
        : "0.0";

    // Get pending orders
    const pendingOrders = await this.orderItemRepository.count({
      where: {
        vendorId,
        vendorStatus: In(["pending", "accepted", "preparing"]),
        createdAt: Between(startDate, endDate),
      },
    });

    // Get today's stats
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    const todayStats = await this.orderItemRepository
      .createQueryBuilder("item")
      .select("COUNT(DISTINCT item.orderId)", "orders")
      .addSelect("SUM(item.totalPrice)", "revenue")
      .where("item.vendorId = :vendorId", { vendorId })
      .andWhere("item.createdAt BETWEEN :startDate AND :endDate", {
        startDate: todayStart,
        endDate: todayEnd,
      })
      .getRawOne();

    // Get new customers today
    const newCustomers = await this.getNewCustomersCount(
      vendorId,
      todayStart,
      todayEnd
    );

    return {
      summary: {
        totalOrders,
        totalRevenue,
        avgOrderValue,
        conversionRate: 3.2, // This would come from marketing analytics
        pendingOrders,
        vsLastPeriod: {
          orders: `${Number(orderChange) > 0 ? "+" : ""}${orderChange}%`,
          revenue: `${Number(revenueChange) > 0 ? "+" : ""}${revenueChange}%`,
          avgOrder: `${
            Number(avgOrderChange) > 0 ? "+" : ""
          }${avgOrderChange}%`,
        },
      },
      today: {
        orders: parseInt(todayStats?.orders || "0"),
        revenue: parseFloat(todayStats?.revenue || "0"),
        newCustomers,
      },
      performance: {
        vsLastWeek: "+15%",
        vsLastMonth: "+28%",
      },
    };
  }

  // Get sales trends
  async getSalesTrends(vendorId: string, period: string, dateRange: DateRange) {
    const { startDate, endDate } = dateRange;

    // Get interval and format for PostgreSQL
    const { interval, dateFormat } = this.getPeriodConfig(period);

    const salesData = await this.orderItemRepository
      .createQueryBuilder("item")
      .select(
        `TO_CHAR(DATE_TRUNC('${interval}', item.created_at), '${dateFormat}')`,
        "date"
      )
      .addSelect("SUM(item.total_price)", "sales")
      .addSelect("COUNT(DISTINCT item.order_id)", "orders")
      .where("item.vendor_id = :vendorId", { vendorId })
      .andWhere("item.created_at BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .groupBy(`DATE_TRUNC('${interval}', item.created_at)`)
      .orderBy(`DATE_TRUNC('${interval}', item.created_at)`, "ASC")
      .getRawMany();

    // Format the response
    const formattedData = salesData.map((item) => ({
      date: item.date,
      sales: parseFloat(item.sales || "0"),
      orders: parseInt(item.orders || "0"),
    }));

    const totalSales = formattedData.reduce((sum, item) => sum + item.sales, 0);
    const totalOrders = formattedData.reduce(
      (sum, item) => sum + item.orders,
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      period,
      year: new Date().getFullYear(),
      data: formattedData,
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue,
      },
    };
  }

  private getPeriodConfig(period: string): {
    interval: string;
    dateFormat: string;
  } {
    const configs: Record<string, { interval: string; dateFormat: string }> = {
      today: { interval: "hour", dateFormat: "HH24" },
      week: { interval: "day", dateFormat: "Dy" }, // Mon, Tue, etc.
      month: { interval: "day", dateFormat: "DD" },
      custom: { interval: "day", dateFormat: "Mon DD" },
      year: { interval: "month", dateFormat: "Mon" }, // Jan, Feb, etc.
      quarter: { interval: "quarter", dateFormat: '"Q"Q YYYY' }, // Q1 2024, Q2 2024
    };

    return configs[period] || { interval: "day", dateFormat: "Mon DD" };
  }

  // Get product performance
  async getProductPerformance(
    vendorId: string,
    dateRange: DateRange
  ): Promise<{
    topProducts: ProductPerformance[];
    lowStock: ProductPerformance[];
    categories: Array<{
      category: string;
      sales: number;
      products: number;
    }>;
  }> {
    const { startDate, endDate } = dateRange;

    // Get top selling products
    const topProducts = await this.orderItemRepository
      .createQueryBuilder("item")
      .innerJoin("item.order", "order")
      .select("item.productId", "id")
      .addSelect("item.productName", "name")
      .addSelect("SUM(item.totalPrice)", "sales")
      .addSelect("SUM(item.quantity)", "orders")
      .where("item.vendorId = :vendorId", { vendorId })
      .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("order.orderStatus != :cancelled", { cancelled: "cancelled" })
      .groupBy("item.productId, item.productName")
      .orderBy("sales", "DESC")
      .limit(10)
      .getRawMany();

    // Get product details for stock and rating
    const productIds = topProducts.map((p) => p.id);
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
      select: ["id", "stockQuantity", "rating", "images"],
    });

    const enhancedProducts = topProducts.map((item) => {
      const product = products.find((p) => p.id === item.id);
      return {
        id: item.id,
        name: item.name,
        sales: parseFloat(item.sales || "0"),
        orders: parseInt(item.orders || "0"),
        stock: product?.stockQuantity || 0,
        rating: product?.rating || 0,
        images: product?.images || [],
      };
    });

    // Get low stock products
    const lowStockProducts = await this.productRepository.find({
      where: {
        vendorId,
        stockQuantity: LessThanOrEqual(10),
        isActive: true,
      },
      select: ["id", "name", "stockQuantity", "rating", "images"],
      take: 5,
    });

    const lowStock = lowStockProducts.map((product) => ({
      id: product.id,
      name: product.name,
      sales: 0, // Would need to calculate
      orders: 0,
      stock: product.stockQuantity,
      rating: product.rating || 0,
      images: product.images || [],
    }));

    // Get category performance
    const categories = await this.getCategoryPerformance(vendorId, dateRange);

    return {
      topProducts: enhancedProducts,
      lowStock,
      categories,
    };
  }

  // Get order analytics
  async getOrderAnalytics(
    vendorId: string,
    dateRange: DateRange
  ): Promise<{
    statusDistribution: OrderDistribution[];
    fulfillmentMetrics: {
      avgProcessingTime: string;
      avgDeliveryTime: string;
      onTimeRate: number;
    };
    recentOrders: Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      amount: number;
      status: OrderStatus;
      date: string;
    }>;
  }> {
    const { startDate, endDate } = dateRange;

    // Get order status distribution
    const statusDistribution = await this.orderItemRepository
      .createQueryBuilder("item")
      .innerJoin("item.order", "order")
      .select("order.orderStatus", "status")
      .addSelect("COUNT(DISTINCT item.orderId)", "count")
      .where("item.vendorId = :vendorId", { vendorId })
      .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .groupBy("order.orderStatus")
      .getRawMany();

    const totalOrders = statusDistribution.reduce(
      (sum, item) => sum + parseInt(item.count),
      0
    );

    // Status colors
    const statusColors: Record<OrderStatus, string> = {
      pending: "#FFA726",
      confirmed: "#29B6F6",
      processing: "#AB47BC",
      dispatched: "#7E57C2",
      out_for_delivery: "#5C6BC0",
      ready_for_pickup: "#5C6BC0",
      delivered: "#66BB6A",
      refunded: "#7E57C2",
      returned: "#EF5350",
      cancelled: "#EF5350",
    };

    const distribution = statusDistribution.map((item) => ({
      status: item.status,
      count: parseInt(item.count),
      percentage:
        totalOrders > 0
          ? Math.round((parseInt(item.count) / totalOrders) * 100)
          : 0,
      color: statusColors[item.status as OrderStatus] || "#9E9E9E",
    }));

    // Get fulfillment metrics
    const fulfillmentMetrics = await this.calculateFulfillmentMetrics(
      vendorId,
      dateRange
    );

    // Get recent orders
    const recentOrders = await this.orderItemRepository
      .createQueryBuilder("item")
      .innerJoin("item.order", "order")
      .innerJoin("order.customer", "customer")
      .select([
        "order.id",
        "order.orderNumber",
        "order.totalAmount",
        "order.orderStatus",
        "order.createdAt",
        "customer.fullName",
      ])
      .where("item.vendorId = :vendorId", { vendorId })
      .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .orderBy("order.createdAt", "DESC")
      .limit(10)
      .getRawMany();

    const formattedOrders = recentOrders.map((order) => ({
      id: order.order_id,
      orderNumber: order.order_orderNumber,
      customerName: order.customer_fullName || "Unknown",
      amount: parseFloat(order.order_totalAmount),
      status: order.order_orderStatus,
      date: format(new Date(order.order_createdAt), "MMM dd, yyyy"),
    }));

    return {
      statusDistribution: distribution,
      fulfillmentMetrics,
      recentOrders: formattedOrders,
    };
  }

  // Get customer analytics
  async getCustomerAnalytics(
    vendorId: string,
    dateRange: DateRange
  ): Promise<{
    customerSegments: CustomerSegment[];
    topCustomers: Array<{
      id: string;
      name: string;
      totalSpent: number;
      orders: number;
      lastOrder: string;
    }>;
    demographics: {
      states: Array<{ state: string; customers: number; revenue: number }>;
      cities: Array<{ city: string; customers: number; revenue: number }>;
    };
  }> {
    const { startDate, endDate } = dateRange;

    // Get customer segments
    const customerOrders = await this.orderItemRepository
      .createQueryBuilder("item")
      .innerJoin("item.order", "order")
      .innerJoin("order.customer", "customer")
      .select("customer.id", "customerId")
      .addSelect("customer.fullName", "name")
      .addSelect("COUNT(DISTINCT item.orderId)", "orderCount")
      .addSelect("SUM(item.totalPrice)", "totalSpent")
      .addSelect("MAX(order.createdAt)", "lastOrder")
      .where("item.vendorId = :vendorId", { vendorId })
      .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("order.orderStatus != :cancelled", { cancelled: "cancelled" })
      .groupBy("customer.id, customer.fullName")
      .getRawMany();

    const totalCustomers = customerOrders.length;

    // Segment customers
    const newCustomers = customerOrders.filter((c) => {
      const orderCount = parseInt(c.orderCount);
      return orderCount === 1;
    }).length;

    const returningCustomers = customerOrders.filter((c) => {
      const orderCount = parseInt(c.orderCount);
      return orderCount > 1 && orderCount <= 5;
    }).length;

    const loyalCustomers = customerOrders.filter((c) => {
      const orderCount = parseInt(c.orderCount);
      return orderCount > 5;
    }).length;

    const segments = [
      {
        segment: "New Customers",
        count: newCustomers,
        percentage:
          totalCustomers > 0
            ? Math.round((newCustomers / totalCustomers) * 100)
            : 0,
      },
      {
        segment: "Returning Customers",
        count: returningCustomers,
        percentage:
          totalCustomers > 0
            ? Math.round((returningCustomers / totalCustomers) * 100)
            : 0,
      },
      {
        segment: "Loyal Customers",
        count: loyalCustomers,
        percentage:
          totalCustomers > 0
            ? Math.round((loyalCustomers / totalCustomers) * 100)
            : 0,
      },
    ];

    // Get top customers
    const topCustomers = customerOrders
      .sort(
        (a, b) =>
          parseFloat(b.totalSpent || "0") - parseFloat(a.totalSpent || "0")
      )
      .slice(0, 10)
      .map((customer) => ({
        id: customer.customerId,
        name: customer.name || "Unknown",
        totalSpent: parseFloat(customer.totalSpent || "0"),
        orders: parseInt(customer.orderCount || "0"),
        lastOrder: customer.lastOrder
          ? format(new Date(customer.lastOrder), "MMM dd, yyyy")
          : "Never",
      }));

    // Get demographics
    const demographics = await this.getCustomerDemographics(
      vendorId,
      dateRange
    );

    return {
      customerSegments: segments,
      topCustomers,
      demographics,
    };
  }

  // Get regional analytics (Akwa Ibom focused)
  async getRegionalAnalytics(
    vendorId: string,
    dateRange: DateRange
  ): Promise<{
    akwaIbomStats: {
      totalSales: number;
      orders: number;
      customers: number;
      avgOrderValue: number;
    };
    topCities: Array<{ city: string; sales: number }>;
    popularProducts: Array<{ name: string; sales: number }>;
    regionalStats: RegionalInsight[];
  }> {
    const { startDate, endDate } = dateRange;

    // Get vendor state
    const vendor = await this.vendorRepository.findOne({
      where: { id: vendorId },
      select: ["state", "city"],
    });

    const vendorState = vendor?.state || "Unknown";

    // Get sales by region
    const regionalSales = await this.orderItemRepository
      .createQueryBuilder("item")
      .innerJoin("item.order", "order")
      .innerJoin("order.customer", "customer")
      .select("customer.state", "state")
      .addSelect("SUM(item.totalPrice)", "sales")
      .addSelect("COUNT(DISTINCT item.orderId)", "orders")
      .addSelect("COUNT(DISTINCT customer.id)", "customers")
      .where("item.vendorId = :vendorId", { vendorId })
      .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("order.orderStatus != :cancelled", { cancelled: "cancelled" })
      .groupBy("customer.state")
      .orderBy("sales", "DESC")
      .getRawMany();

    // Calculate Akwa Ibom specific stats
    const akwaIbomData = regionalSales.find((r) => r.state === "Akwa Ibom") || {
      sales: "0",
      orders: "0",
      customers: "0",
    };

    const akwaIbomSales = parseFloat(akwaIbomData.sales || "0");
    const akwaIbomOrders = parseInt(akwaIbomData.orders || "0");
    const akwaIbomCustomers = parseInt(akwaIbomData.customers || "0");
    const akwaIbomAvgOrder =
      akwaIbomOrders > 0 ? akwaIbomSales / akwaIbomOrders : 0;

    // Get top cities in Akwa Ibom
    const topCities = await this.getTopCities(vendorId, dateRange, "Akwa Ibom");

    // Get popular products in region
    const popularProducts = await this.getPopularProductsByRegion(
      vendorId,
      dateRange,
      "Akwa Ibom"
    );

    // Format regional insights
    const regionalStats = regionalSales.map((region) => {
      const sales = parseFloat(region.sales || "0");
      const orders = parseInt(region.orders || "0");
      const customers = parseInt(region.customers || "0");

      // Calculate growth (simplified - would compare with previous period)
      const growth = region.state === vendorState ? "+12%" : "+5%";

      return {
        region: region.state || "Unknown",
        sales,
        customers,
        growth,
      };
    });

    return {
      akwaIbomStats: {
        totalSales: akwaIbomSales,
        orders: akwaIbomOrders,
        customers: akwaIbomCustomers,
        avgOrderValue: akwaIbomAvgOrder,
      },
      topCities,
      popularProducts,
      regionalStats,
    };
  }

  // Get real-time analytics
  async getRealTimeAnalytics(vendorId: string): Promise<{
    liveStats: {
      currentOrders: number;
      todayRevenue: number;
      pendingMessages: number;
    };
    recentActivity: Array<{
      type: "order" | "review" | "stock" | "payment";
      message: string;
      time: string;
      amount?: number;
    }>;
  }> {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    // Get current pending orders
    const currentOrders = await this.orderItemRepository.count({
      where: {
        vendorId,
        vendorStatus: In(["pending", "accepted", "preparing"]),
        createdAt: Between(todayStart, todayEnd),
      },
    });

    // Get today's revenue
    const todayRevenue = await this.orderItemRepository
      .createQueryBuilder("item")
      .select("SUM(item.totalPrice)", "revenue")
      .where("item.vendorId = :vendorId", { vendorId })
      .andWhere("item.createdAt BETWEEN :startDate AND :endDate", {
        startDate: todayStart,
        endDate: todayEnd,
      })
      .getRawOne();

    // Get recent activity (last 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const recentOrders = await this.orderItemRepository.find({
      where: {
        vendorId,
        createdAt: MoreThanOrEqual(twoHoursAgo),
      },
      relations: ["order"],
      order: { createdAt: "DESC" },
      take: 5,
    });

    const recentActivity: {
      type: "order" | "review" | "stock";
      message: string;
      time: string;
      amount?: number;
    }[] = recentOrders.map((order) => ({
      type: "order" as const,
      message: `New order #${order.order.orderNumber}` as string,
      time: this.getTimeAgo(order.createdAt),
      amount: order.totalPrice,
    }));

    // Add simulated activities
    recentActivity.push(
      {
        type: "review" as const,
        message: "New 5-star review on Product A",
        time: "15 minutes ago",
      },
      {
        type: "stock" as const,
        message: "Low stock alert: Product C (5 left)",
        time: "30 minutes ago",
      }
    );

    return {
      liveStats: {
        currentOrders,
        todayRevenue: parseFloat(todayRevenue?.revenue || "0"),
        pendingMessages: 3, // This would come from messaging service
      },
      recentActivity,
    };
  }

  // Helper methods
  private async getNewCustomersCount(
    vendorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const newCustomers = await this.orderItemRepository
      .createQueryBuilder("item")
      .innerJoin("item.order", "order")
      .innerJoin("order.customer", "customer")
      .select("customer.id", "customerId")
      .addSelect("COUNT(DISTINCT item.orderId)", "orderCount")
      .where("item.vendorId = :vendorId", { vendorId })
      .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .groupBy("customer.id")
      .having("COUNT(DISTINCT item.orderId) = 1")
      .getRawMany();

    return newCustomers.length;
  }

  private async getCategoryPerformance(vendorId: string, dateRange: DateRange) {
    // This would join with category table
    return [
      { category: "Men's Fashion", sales: 450000, products: 24 },
      { category: "Women's Fashion", sales: 380000, products: 32 },
      { category: "Accessories", sales: 120000, products: 15 },
    ];
  }

  private async calculateFulfillmentMetrics(
    vendorId: string,
    dateRange: DateRange
  ) {
    // Simplified - would need more complex calculations
    return {
      avgProcessingTime: "2.5h",
      avgDeliveryTime: "1.2d",
      onTimeRate: 94,
    };
  }

  private async getCustomerDemographics(
    vendorId: string,
    dateRange: DateRange
  ) {
    const { startDate, endDate } = dateRange;

    const states = await this.orderItemRepository
      .createQueryBuilder("item")
      .innerJoin("item.order", "order")
      .innerJoin("order.customer", "customer")
      .select("customer.state", "state")
      .addSelect("COUNT(DISTINCT customer.id)", "customers")
      .addSelect("SUM(item.totalPrice)", "revenue")
      .where("item.vendorId = :vendorId", { vendorId })
      .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("customer.state IS NOT NULL")
      .groupBy("customer.state")
      .orderBy("revenue", "DESC")
      .getRawMany();

    const cities = await this.orderItemRepository
      .createQueryBuilder("item")
      .innerJoin("item.order", "order")
      .innerJoin("order.customer", "customer")
      .select("customer.city", "city")
      .addSelect("COUNT(DISTINCT customer.id)", "customers")
      .addSelect("SUM(item.totalPrice)", "revenue")
      .where("item.vendorId = :vendorId", { vendorId })
      .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("customer.city IS NOT NULL")
      .groupBy("customer.city")
      .orderBy("revenue", "DESC")
      .limit(10)
      .getRawMany();

    return {
      states: states.map((s) => ({
        state: s.state,
        customers: parseInt(s.customers || "0"),
        revenue: parseFloat(s.revenue || "0"),
      })),
      cities: cities.map((c) => ({
        city: c.city,
        customers: parseInt(c.customers || "0"),
        revenue: parseFloat(c.revenue || "0"),
      })),
    };
  }

  private async getTopCities(
    vendorId: string,
    dateRange: DateRange,
    state: string
  ) {
    const { startDate, endDate } = dateRange;

    const cities = await this.orderItemRepository
      .createQueryBuilder("item")
      .innerJoin("item.order", "order")
      .innerJoin("order.customer", "customer")
      .select("customer.city", "city")
      .addSelect("SUM(item.totalPrice)", "sales")
      .where("item.vendorId = :vendorId", { vendorId })
      .andWhere("customer.state = :state", { state })
      .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .andWhere("customer.city IS NOT NULL")
      .groupBy("customer.city")
      .orderBy("sales", "DESC")
      .limit(5)
      .getRawMany();

    return cities.map((c) => ({
      city: c.city,
      sales: parseFloat(c.sales || "0"),
    }));
  }

  private async getPopularProductsByRegion(
    vendorId: string,
    dateRange: DateRange,
    state: string
  ) {
    const { startDate, endDate } = dateRange;

    const products = await this.orderItemRepository
      .createQueryBuilder("item")
      .innerJoin("item.order", "order")
      .innerJoin("order.customer", "customer")
      .select("item.productName", "name")
      .addSelect("SUM(item.totalPrice)", "sales")
      .where("item.vendorId = :vendorId", { vendorId })
      .andWhere("customer.state = :state", { state })
      .andWhere("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .groupBy("item.productName")
      .orderBy("sales", "DESC")
      .limit(5)
      .getRawMany();

    return products.map((p) => ({
      name: p.name,
      sales: parseFloat(p.sales || "0"),
    }));
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
}

export default new AnalyticsService();
