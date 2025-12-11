"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIREBASE_APPS = void 0;
exports.FIREBASE_APPS = {
    VENDOR: {
        ANDROID: {
            projectId: process.env.VENDOR_ANDROID_PROJECT_ID,
            clientEmail: process.env.VENDOR_ANDROID_CLIENT_EMAIL,
            privateKey: process.env.VENDOR_ANDROID_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        IOS: {
            projectId: process.env.VENDOR_IOS_PROJECT_ID,
            clientEmail: process.env.VENDOR_IOS_CLIENT_EMAIL,
            privateKey: process.env.VENDOR_IOS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
    },
    CUSTOMER: {
        ANDROID: {
            projectId: process.env.CUSTOMER_ANDROID_PROJECT_ID,
            clientEmail: process.env.CUSTOMER_ANDROID_CLIENT_EMAIL,
            privateKey: process.env.CUSTOMER_ANDROID_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        IOS: {
            projectId: process.env.CUSTOMER_IOS_PROJECT_ID,
            clientEmail: process.env.CUSTOMER_IOS_CLIENT_EMAIL,
            privateKey: process.env.CUSTOMER_IOS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
    },
    RIDER: {
        ANDROID: {
            projectId: process.env.RIDER_ANDROID_PROJECT_ID,
            clientEmail: process.env.RIDER_ANDROID_CLIENT_EMAIL,
            privateKey: process.env.RIDER_ANDROID_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        IOS: {
            projectId: process.env.RIDER_IOS_PROJECT_ID,
            clientEmail: process.env.RIDER_IOS_CLIENT_EMAIL,
            privateKey: process.env.RIDER_IOS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
    },
};
//# sourceMappingURL=firebase-service-account.js.map