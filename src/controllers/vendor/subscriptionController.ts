import { Response } from "express";
import { AuthRequest } from "../../types";
import subscriptionService from "../../services/subscription/subscriptionService";
import productLimitService from "../../services/subscription/productLimitService";
import { PlanTier } from "../../entities/SubscriptionPlan";

export const getPlans = async (req: AuthRequest, res: Response) => {
  try {
    const plans = await subscriptionService.getPlans();
    res.json({ success: true, data: plans });
  } catch (error: any) {
    console.error("Get plans error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCurrentSubscription = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const subscription = await subscriptionService.getVendorSubscription(
      vendorId
    );
    const quota = await productLimitService.getRemainingQuota(vendorId);

    res.json({
      success: true,
      data: {
        subscription,
        quota,
      },
    });
  } catch (error: any) {
    console.error("Get subscription error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const subscribe = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { tier } = req.body;
    if (!tier || !Object.values(PlanTier).includes(tier)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subscription tier" });
    }

    if (tier === PlanTier.FREE) {
      const subscription = await subscriptionService.createFreeSubscription(
        vendorId
      );
      return res.json({ success: true, data: subscription });
    }

    const paymentData = await subscriptionService.initializeSubscription(
      vendorId,
      tier
    );
    res.json({ success: true, data: paymentData });
  } catch (error: any) {
    console.error("Subscribe error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifySubscription = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { reference } = req.body;
    if (!reference) {
      return res
        .status(400)
        .json({ success: false, message: "Payment reference is required" });
    }

    const subscription =
      await subscriptionService.verifyAndActivateSubscription(
        reference,
        vendorId
      );
    res.json({ success: true, data: subscription });
  } catch (error: any) {
    console.error("Verify subscription error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upgrade = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { tier } = req.body;
    if (!tier || !Object.values(PlanTier).includes(tier)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subscription tier" });
    }

    const paymentData = await subscriptionService.upgradeSubscription(
      vendorId,
      tier
    );
    res.json({ success: true, data: paymentData });
  } catch (error: any) {
    console.error("Upgrade subscription error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const subscription = await subscriptionService.cancelSubscription(vendorId);
    res.json({
      success: true,
      data: subscription,
      message:
        "Subscription cancelled. You will retain access until the end of your current billing period.",
    });
  } catch (error: any) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkProductLimit = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user?.id;
    if (!vendorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const limitCheck = await productLimitService.checkProductLimit(vendorId);
    res.json({ success: true, data: limitCheck });
  } catch (error: any) {
    console.error("Check product limit error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
