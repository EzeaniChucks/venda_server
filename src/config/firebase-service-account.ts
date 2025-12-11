// config/firebase.ts
import admin from "firebase-admin";

export type Entity = "VENDOR" | "CUSTOMER" | "RIDER";
type Platform = "ANDROID" | "IOS";

export interface FirebaseConfig {
  projectId: string | undefined;
  clientEmail: string | undefined;
  privateKey: string | undefined;
}

export const FIREBASE_APPS: Record<Entity, Record<Platform, FirebaseConfig>> = {
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
      privateKey: process.env.CUSTOMER_ANDROID_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
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
} as const;
