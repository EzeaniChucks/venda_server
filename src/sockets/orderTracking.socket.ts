import { Server as SocketServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";

export interface OrderUpdateData {
  orderId: string;
  status: string;
  customerId: string;
  vendorId?: string;
  riderId?: string;
  estimatedDeliveryDate?: string | Date;
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
}

export interface RiderLocationData {
  riderId: string;
  orderId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

export class OrderTrackingSocket {
  private io: SocketServer;

  constructor(server: HTTPServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      path: "/socket.io",
    });

    this.initializeHandlers();
  }

  private initializeHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`✅ Client connected: ${socket.id}`);

      socket.on("join_order", (orderId: string) => {
        socket.join(`order:${orderId}`);
        console.log(`👤 Socket ${socket.id} joined order room: ${orderId}`);
      });

      socket.on("leave_order", (orderId: string) => {
        socket.leave(`order:${orderId}`);
        console.log(`👋 Socket ${socket.id} left order room: ${orderId}`);
      });

      socket.on("rider_join", (riderId: string) => {
        socket.join(`rider:${riderId}`);
        console.log(`🏍️ Rider ${riderId} joined`);
      });

      socket.on("customer_join", (customerId: string) => {
        socket.join(`customer:${customerId}`);
        console.log(`👤 Customer ${customerId} joined`);
      });

      socket.on("vendor_join", (vendorId: string) => {
        socket.join(`vendor:${vendorId}`);
        console.log(`🏪 Vendor ${vendorId} joined`);
      });

      socket.on("update_rider_location", (data: RiderLocationData) => {
        this.emitRiderLocation(data);
      });

      socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });
  }

  public emitOrderUpdate(data: OrderUpdateData) {
    const { orderId, customerId, vendorId, riderId } = data;

    this.io.to(`order:${orderId}`).emit("order_update", data);

    if (customerId) {
      this.io.to(`customer:${customerId}`).emit("order_update", data);
    }

    if (vendorId) {
      this.io.to(`vendor:${vendorId}`).emit("order_update", data);
    }

    if (riderId) {
      this.io.to(`rider:${riderId}`).emit("order_update", data);
    }

    console.log(`📦 Order update emitted for order ${orderId}: ${data.status}`);
  }

  public emitRiderLocation(data: RiderLocationData) {
    const { orderId, riderId } = data;

    this.io.to(`order:${orderId}`).emit("rider_location_update", data);

    this.io.to(`rider:${riderId}`).emit("location_confirmed", {
      orderId,
      timestamp: data.timestamp,
    });

    console.log(`📍 Rider location update for order ${orderId}`);
  }

  public emitNotification(
    userId: string,
    userType: "customer" | "vendor" | "rider",
    notification: any
  ) {
    this.io.to(`${userType}:${userId}`).emit("notification", notification);
    console.log(`🔔 Notification sent to ${userType} ${userId}`);
  }

  public getIO(): SocketServer {
    return this.io;
  }
}

let orderTrackingSocket: OrderTrackingSocket | null = null;

export function initializeOrderTracking(
  server: HTTPServer
): OrderTrackingSocket {
  if (!orderTrackingSocket) {
    orderTrackingSocket = new OrderTrackingSocket(server);
    console.log("🚀 Order tracking WebSocket initialized");
  }
  return orderTrackingSocket;
}

export function getOrderTrackingSocket(): OrderTrackingSocket {
  if (!orderTrackingSocket) {
    throw new Error("Order tracking socket not initialized");
  }
  return orderTrackingSocket;
}
