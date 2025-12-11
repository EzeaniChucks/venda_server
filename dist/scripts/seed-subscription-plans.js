"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../config/data-source");
const SubscriptionPlan_1 = require("../entities/SubscriptionPlan");
const plans = [
    {
        tier: SubscriptionPlan_1.PlanTier.FREE,
        name: 'Free',
        price: 0,
        currency: 'NGN',
        productLimit: 10,
        promoFeatureEnabled: false,
        homepageVisibilityEnabled: false,
        description: 'Perfect for getting started - up to 10 products',
        isActive: true,
    },
    {
        tier: SubscriptionPlan_1.PlanTier.STARTER,
        name: 'Starter',
        price: 2500,
        currency: 'NGN',
        productLimit: 20,
        promoFeatureEnabled: false,
        homepageVisibilityEnabled: false,
        description: 'Grow your business - up to 20 products',
        isActive: true,
    },
    {
        tier: SubscriptionPlan_1.PlanTier.PRO,
        name: 'Pro',
        price: 5000,
        currency: 'NGN',
        productLimit: 50,
        promoFeatureEnabled: true,
        homepageVisibilityEnabled: false,
        description: 'Advanced features - up to 50 products + promotional tools',
        isActive: true,
    },
    {
        tier: SubscriptionPlan_1.PlanTier.ELITE,
        name: 'Elite',
        price: 10000,
        currency: 'NGN',
        productLimit: -1,
        promoFeatureEnabled: true,
        homepageVisibilityEnabled: true,
        description: 'Premium tier - unlimited products + homepage visibility',
        isActive: true,
    },
];
async function seedPlans() {
    try {
        console.log('🔄 Connecting to database...');
        await data_source_1.AppDataSource.initialize();
        console.log('🌱 Seeding subscription plans...');
        const planRepository = data_source_1.AppDataSource.getRepository(SubscriptionPlan_1.SubscriptionPlan);
        for (const planData of plans) {
            const existing = await planRepository.findOne({ where: { tier: planData.tier } });
            if (existing) {
                console.log(`   ✅ Plan "${planData.name}" already exists, updating...`);
                await planRepository.update({ id: existing.id }, planData);
            }
            else {
                console.log(`   ➕ Creating plan "${planData.name}"...`);
                await planRepository.save(planData);
            }
        }
        console.log('✅ Subscription plans seeded successfully!');
        await data_source_1.AppDataSource.destroy();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding plans:', error);
        process.exit(1);
    }
}
seedPlans();
//# sourceMappingURL=seed-subscription-plans.js.map