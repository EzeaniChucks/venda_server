"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationTypeEnum = exports.NotificationTemplateType = void 0;
exports.NotificationTemplateType = {
    PRODUCT_APPROVAL: 'account',
    INVENTORY_ALERT: 'account',
    VENDOR_VERIFICATION: 'account',
    SUBSCRIPTION: 'account',
    FASHION_TRENDS: 'promotion',
    FLASH_SALE: 'promotion',
};
var NotificationTypeEnum;
(function (NotificationTypeEnum) {
    NotificationTypeEnum["ORDER_UPDATE"] = "order_update";
    NotificationTypeEnum["PAYMENT"] = "payment";
    NotificationTypeEnum["PROMOTION"] = "promotion";
    NotificationTypeEnum["ACCOUNT"] = "account";
    NotificationTypeEnum["GENERAL"] = "general";
    NotificationTypeEnum["PRODUCT_APPROVAL"] = "product_approval";
    NotificationTypeEnum["INVENTORY_ALERT"] = "inventory_alert";
    NotificationTypeEnum["VENDOR_VERIFICATION"] = "vendor_verification";
    NotificationTypeEnum["SUBSCRIPTION"] = "subscription";
    NotificationTypeEnum["FASHION_TRENDS"] = "fashion_trends";
    NotificationTypeEnum["FLASH_SALE"] = "flash_sale";
    NotificationTypeEnum["CUSTOMER_SUPPORT"] = "customer_support";
    NotificationTypeEnum["REVIEW_REMINDER"] = "review_reminder";
    NotificationTypeEnum["DELIVERY_UPDATE"] = "delivery_update";
    NotificationTypeEnum["SYSTEM_ALERT"] = "system_alert";
})(NotificationTypeEnum || (exports.NotificationTypeEnum = NotificationTypeEnum = {}));
//# sourceMappingURL=notification.js.map