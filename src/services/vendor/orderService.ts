import { errorResponse } from "../../utils/response";
import { AppDataSource } from "../../config/data-source";
import {
  Order,
  OrderItem,
  Product,
  Vendor,
  VendorStatus,
} from "../../entities";
import { Response } from "express";
import { getOrderTrackingSocket } from "../../sockets/orderTracking.socket";
import { OrderRejection } from "../../entities/OrderRejection";

export class VendorOrderService {
  private orderRepository = AppDataSource.getRepository(Order);
  private orderItemRepository = AppDataSource.getRepository(OrderItem);

  async getVendorOrders(vendorId: string, filters: any = {}): Promise<any> {
    const {
      status,
      page = 1,
      limit = 20,
      filterBy = "item", // 'item' or 'order'
      dateFrom,
      dateTo,
      search,
    } = filters;

    // console.log("Fetching vendor orders with filters:", {
    //   vendorId,
    //   status,
    //   filterBy,
    //   page,
    //   limit,
    // });

    const queryBuilder = this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.orderItems", "orderItems")
      .leftJoinAndSelect("order.customer", "customer")
      .leftJoinAndSelect("orderItems.vendor", "vendor")
      .leftJoinAndSelect("vendor.vendorProfile", "vendorProfile")
      .where("orderItems.vendorId = :vendorId", { vendorId });

    // Apply status filtering based on filterBy parameter
    if (status && status !== "all") {
      if (filterBy === "order") {
        // Filter by overall order status
        queryBuilder.andWhere("order.orderStatus = :status", { status });
      } else {
        // Default: filter by individual item status (vendor-specific)
        queryBuilder.andWhere("orderItems.vendorStatus = :status", { status });
      }
    }

    // Date range filtering
    if (dateFrom) {
      queryBuilder.andWhere("order.createdAt >= :dateFrom", {
        dateFrom: new Date(dateFrom),
      });
    }

    if (dateTo) {
      queryBuilder.andWhere("order.createdAt <= :dateTo", {
        dateTo: new Date(dateTo),
      });
    }

    // Search by order number or customer name
    if (search) {
      queryBuilder.andWhere(
        "(order.orderNumber ILIKE :search OR customer.fullName ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const orders = await queryBuilder
      .orderBy("order.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // console.log(`Found ${orders.length} orders out of ${total} total`);

    // Transform the response to group items by order and vendor
    const transformedOrders = orders.map((order) => {
      // Filter items for this specific vendor and transform them
      const vendorItems =
        order.orderItems
          ?.filter((item) => item.vendorId === vendorId)
          .map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            unitPrice: parseFloat(String(item.unitPrice)),
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            totalPrice: parseFloat(String(item.totalPrice)),
            vendorStatus: item.vendorStatus,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            vendor: item.vendor
              ? {
                  id: item.vendor.id,
                  businessName: item.vendor.businessName,
                  phone: item.vendor.phone,
                  vendorProfile: {
                    businessName: item.vendor.vendorProfile?.businessName,
                    businessAddress: item.vendor.vendorProfile?.businessAddress,
                  },
                }
              : null,
          })) || [];

      // Calculate vendor-specific order summary
      const vendorOrderTotal = vendorItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      // Determine vendor-specific order status based on item statuses
      const vendorOrderStatus = this.getVendorOrderStatus(vendorItems);

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        totalAmount: parseFloat(String(order.totalAmount)),
        deliveryFee: parseFloat(String(order.deliveryFee || 0)),
        discountAmount: parseFloat(String(order.discountAmount || 0)),
        finalAmount: parseFloat(String(order.finalAmount)),
        orderStatus: order.orderStatus, // Overall order status
        vendorOrderStatus, // Vendor-specific status based on their items
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        deliveryAddress: order.deliveryAddress,
        deliveryCity: order.deliveryCity,
        deliveryState: order.deliveryState,
        deliveryPostalCode: order.deliveryPostalCode,
        deliveryPhone: order.deliveryPhone,
        deliveryNotes: order.deliveryNotes,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt,
        cancellationReason: order.cancellationReason,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        customer: order.customer
          ? {
              id: order.customer.id,
              fullName: order.customer.fullName,
              email: order.customer.email,
              phone: order.customer.phone,
            }
          : null,
        items: vendorItems, // Only items from this vendor
        vendor_order_total: vendorOrderTotal,
        item_count: vendorItems.length,
        status_summary: this.getStatusSummary(vendorItems),
      };
    });

    // Add pagination metadata
    const result = {
      orders: transformedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };

    return result;
  }

  /**
   * Determine vendor-specific order status based on their items' statuses
   */
  private getVendorOrderStatus(items: any[]): string {
    if (!items || items.length === 0) return "unknown";

    const statuses = items.map((item) => item.vendorStatus);

    // If all items have the same status, use that
    const uniqueStatuses = [...new Set(statuses)];
    if (uniqueStatuses.length === 1) {
      return uniqueStatuses[0];
    }

    // Priority-based status determination
    if (statuses.includes("rejected")) return "partially_rejected";
    if (statuses.includes("ready")) return "partially_ready";
    if (statuses.includes("preparing")) return "partially_preparing";
    if (statuses.includes("accepted")) return "partially_accepted";

    return "mixed";
  }

  /**
   * Get summary of status counts for vendor's items
   */
  private getStatusSummary(items: any): any {
    const summary: any = {
      pending: 0,
      accepted: 0,
      preparing: 0,
      ready: 0,
      rejected: 0,
      total: items?.length,
    };

    items?.forEach((item: any) => {
      if (summary.hasOwnProperty(item.vendorStatus)) {
        summary[item.vendorStatus]++;
      }
    });

    return summary;
  }

  async getVendorOrderById(
    res: Response,
    orderId: string,
    vendorId: string
  ): Promise<any> {
    // First, get the order with ALL its items using the same pattern as getVendorOrders

    // console.log(orderId, vendorId);

    const order = await this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.orderItems", "orderItems")
      .leftJoinAndSelect("order.customer", "customer")
      .leftJoinAndSelect("orderItems.vendor", "vendor")
      .leftJoinAndSelect("vendor.vendorProfile", "vendorProfile")
      .where("order.id = :orderId", { orderId })
      .andWhere("orderItems.vendorId = :vendorId", { vendorId }) // This ensures we only get orders that have items from this vendor
      .getOne();

    if (!order) {
      return errorResponse(
        res,
        "Order not found or you do not have access to this order",
        404
      );
    }

    // Filter items for this vendor only and transform the response
    const vendorItems =
      order?.orderItems?.filter((item) => item.vendorId === vendorId) || [];

    // Check if vendor has any items in this order
    if (!vendorItems || vendorItems.length === 0) {
      return errorResponse(
        res,
        "You do not have access to this order or no items found for your vendor",
        403
      );
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
      discountAmount: order.discountAmount,
      finalAmount: order.finalAmount,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      deliveryState: order.deliveryState,
      deliveryPostalCode: order.deliveryPostalCode,
      deliveryPhone: order.deliveryPhone,
      deliveryNotes: order.deliveryNotes,
      riderId: order.riderId,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      cancellationReason: order.cancellationReason,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: {
        id: order.customer.id,
        email: order.customer.email,
        fullName: order.customer.fullName,
        phone: order.customer.phone,
        profileImage: order.customer.profileImage,
      },
      // This is the key change - using ITEMS
      items: vendorItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        vendorStatus: item.vendorStatus,
        size: item.size,
        color: item.color,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        vendorId: item.vendorId,
        vendor_name:
          item.vendor?.vendorProfile?.businessName ||
          item.vendor?.businessName ||
          "Unknown Vendor",
      })),
      vendor_order_total: vendorItems.reduce(
        (sum, item) => sum + parseFloat(String(item.totalPrice)),
        0
      ),
      item_count: vendorItems.length,
      vendor_status: this.getAggregateVendorStatus(vendorItems),
    };
  }

  async updateOrderItemStatus({
    orderId,
    itemId,
    vendorId,
    status,
  }: {
    orderId: string;
    itemId: string;
    vendorId: string;
    status: VendorStatus;
  }): Promise<any> {
    // Verify the item belongs to this vendor and order
    const orderItem = await this.orderItemRepository.findOne({
      where: {
        id: itemId,
        orderId: orderId,
        vendorId: vendorId,
      },
      relations: ["order", "vendor"],
    });

    if (!orderItem) {
      throw new Error(
        "Order item not found or you do not have access to this item"
      );
    }

    // Update the status
    orderItem.vendorStatus = status;
    await this.orderItemRepository.save(orderItem);

    // 3. Emit real-time update via WebSocket
    const orderTrackingSocket = getOrderTrackingSocket();
    orderTrackingSocket.emitOrderUpdate({
      orderId,
      status,
      customerId: orderItem.order.customerId,
      vendorId: vendorId,
      estimatedDeliveryDate: orderItem.order.estimatedDeliveryDate, // if applicable
    });

    // 4. Send notification to customer
    orderTrackingSocket.emitNotification(
      orderItem.order.customerId,
      "customer",
      {
        title: "Order Status Updated",
        message: `Your order #${orderItem.order.orderNumber} is now ${status}`,
        type: "ORDER_STATUS_UPDATE",
        orderId,
        timestamp: new Date(),
      }
    );

    // // Send push notification
    // await sendPushNotification({
    //   to: orderItem.order.customer.pushToken,
    //   title: "Order Status Updated",
    //   body: `Your orderItem #${orderItem.order.orderNumber} is now ${status}`,
    //   data: { orderId: orderItem.id, type: "status_update" },
    // });

    return orderItem;
  }

  private getAggregateVendorStatus(items: any[]): string {
    const statuses = [...new Set(items.map((item) => item.vendorStatus))];
    return statuses.length === 1 ? statuses[0] : "mixed";
  }

  /**
   * Reject specific order item(s) in a multi-vendor order
   */
  async rejectOrderItem(
    orderItemId: string,
    vendorId: string,
    reason: string
  ): Promise<any> {
    return await AppDataSource.transaction(async (manager) => {
      // Find order item
      const orderItem = await manager.findOne(OrderItem, {
        where: { id: orderItemId, vendorId },
        relations: ["order"],
      });

      if (!orderItem) {
        throw new Error("Order item not found or unauthorized");
      }

      if (orderItem.vendorStatus === "rejected") {
        throw new Error("Order item already rejected");
      }

      // Restock the product
      const product = await manager.findOne(Product, {
        where: { id: orderItem.productId },
      });
      if (product) {
        product.stockQuantity += orderItem.quantity;
        await manager.save(product);
      }

      // Create rejection record using query builder
      const insertResult = await manager
        .createQueryBuilder()
        .insert()
        .into(OrderRejection)
        .values({
          order: { id: orderItem.orderId },
          orderItem: { id: orderItemId },
          vendor: { id: vendorId },
          rejectionType: "order",
          reason,
        })
        .returning("*") // This returns the inserted record (PostgreSQL specific)
        .execute();

      const rejection = insertResult.raw[0]; // Get the first inserted record

      // Update order item vendor status
      orderItem.vendorStatus = "rejected";
      await manager.save(orderItem);

      // Check if all items are rejected - if so, cancel the entire order
      const allOrderItems = await manager.find(OrderItem, {
        where: { orderId: orderItem.orderId },
      });

      const allRejected = allOrderItems.every(
        (item) => item.vendorStatus === "rejected"
      );

      if (allRejected) {
        const order = await manager.findOne(Order, {
          where: { id: orderItem.orderId },
        });
        if (order) {
          order.orderStatus = "cancelled";
          order.cancelledAt = new Date();
          order.cancellationReason = "All items rejected by vendors";
          await manager.save(order);
        }
      }

      return {
        success: true,
        message: "Order item rejected successfully",
        rejection: {
          id: rejection.id,
          orderItemId: rejection.orderItemId,
          reason: rejection.reason,
          rejectedAt: rejection.rejectedAt,
        },
        orderItem: {
          id: orderItem.id,
          vendorStatus: orderItem.vendorStatus,
          productName: orderItem.productName,
          quantity: orderItem.quantity,
        },
      };
    });
  }

  /**
   * Reject entire order (all items from this vendor)
   */
  async rejectOrder(
    orderId: string,
    vendorId: string,
    reason: string
  ): Promise<any> {
    return await AppDataSource.transaction(async (manager) => {
      // Find order
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: ["orderItems"],
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Find vendor's items in this order
      const vendorItems =
        order.orderItems?.filter((item) => item.vendorId === vendorId) || [];

      if (vendorItems.length === 0) {
        throw new Error("No items found for this vendor in the order");
      }

      const rejections = [];

      // Reject all vendor's items
      for (const item of vendorItems) {
        if (item.vendorStatus === "rejected") {
          continue; // Skip already rejected items
        }

        // Restock product
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
        });
        if (product) {
          product.stockQuantity += item.quantity;
          await manager.save(product);
        }

        // Create rejection record
        const rejection = manager.create(OrderRejection, {
          order: { id: orderId },
          orderItem: { id: item.id },
          vendor: { id: vendorId },
          rejectionType: "order",
          reason,
        });

        await manager.save(rejection);
        rejections.push(rejection);

        // Update item vendor status
        item.vendorStatus = "rejected";
        await manager.save(item);
      }

      // Check if all items in order are now rejected
      const allOrderItems = order.orderItems || [];
      const allRejected = allOrderItems.every(
        (item) => item.vendorStatus === "rejected"
      );

      if (allRejected) {
        order.orderStatus = "cancelled";
        order.cancelledAt = new Date();
        order.cancellationReason = "All items rejected by vendors";
        await manager.save(order);
      }

      return {
        success: true,
        message: `Rejected ${vendorItems.length} item(s) successfully`,
        rejections: rejections.map((r) => ({
          id: r.id,
          reason: r.reason,
          rejectedAt: r.rejectedAt,
        })),
        orderStatus: allRejected ? "cancelled" : order.orderStatus,
      };
    });
  }

  /**
   * Get rejection history for vendor's orders
   */
  async getVendorRejections(
    vendorId: string,
    limit: number = 50
  ): Promise<any> {
    const rejectionRepo = AppDataSource.getRepository(OrderRejection);

    const rejections = await rejectionRepo.find({
      where: { vendorId },
      relations: ["order", "orderItem"],
      order: { rejectedAt: "DESC" },
      take: limit,
    });

    return rejections.map((rejection) => ({
      id: rejection.id,
      orderId: rejection.orderId,
      orderItemId: rejection.orderItemId,
      reason: rejection.reason,
      rejectedAt: rejection.rejectedAt,
      orderNumber: rejection.order?.orderNumber,
      productName: rejection.orderItem?.productName,
    }));
  }
}

export default new VendorOrderService();
