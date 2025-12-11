"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderTrackingSocket = void 0;
exports.initializeOrderTracking = initializeOrderTracking;
exports.getOrderTrackingSocket = getOrderTrackingSocket;
const socket_io_1 = require("socket.io");
class OrderTrackingSocket {
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
            path: "/socket.io",
        });
        this.initializeHandlers();
    }
    initializeHandlers() {
        this.io.on("connection", (socket) => {
            console.log(`✅ Client connected: ${socket.id}`);
            socket.on("join_order", (orderId) => {
                socket.join(`order:${orderId}`);
                console.log(`👤 Socket ${socket.id} joined order room: ${orderId}`);
            });
            socket.on("leave_order", (orderId) => {
                socket.leave(`order:${orderId}`);
                console.log(`👋 Socket ${socket.id} left order room: ${orderId}`);
            });
            socket.on("rider_join", (riderId) => {
                socket.join(`rider:${riderId}`);
                console.log(`🏍️ Rider ${riderId} joined`);
            });
            socket.on("customer_join", (customerId) => {
                socket.join(`customer:${customerId}`);
                console.log(`👤 Customer ${customerId} joined`);
            });
            socket.on("vendor_join", (vendorId) => {
                socket.join(`vendor:${vendorId}`);
                console.log(`🏪 Vendor ${vendorId} joined`);
            });
            socket.on("update_rider_location", (data) => {
                this.emitRiderLocation(data);
            });
            socket.on("disconnect", () => {
                console.log(`❌ Client disconnected: ${socket.id}`);
            });
        });
    }
    emitOrderUpdate(data) {
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
    emitRiderLocation(data) {
        const { orderId, riderId } = data;
        this.io.to(`order:${orderId}`).emit("rider_location_update", data);
        this.io.to(`rider:${riderId}`).emit("location_confirmed", {
            orderId,
            timestamp: data.timestamp,
        });
        console.log(`📍 Rider location update for order ${orderId}`);
    }
    emitNotification(userId, userType, notification) {
        this.io.to(`${userType}:${userId}`).emit("notification", notification);
        console.log(`🔔 Notification sent to ${userType} ${userId}`);
    }
    getIO() {
        return this.io;
    }
}
exports.OrderTrackingSocket = OrderTrackingSocket;
let orderTrackingSocket = null;
function initializeOrderTracking(server) {
    if (!orderTrackingSocket) {
        orderTrackingSocket = new OrderTrackingSocket(server);
        console.log("🚀 Order tracking WebSocket initialized");
    }
    return orderTrackingSocket;
}
function getOrderTrackingSocket() {
    if (!orderTrackingSocket) {
        throw new Error("Order tracking socket not initialized");
    }
    return orderTrackingSocket;
}
//# sourceMappingURL=orderTracking.socket.js.map