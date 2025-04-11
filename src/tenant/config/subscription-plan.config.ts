import { SubscriptionPlanType } from 'src/common/enums/suscription-plan-type/suscription-plan-type.enum';

export const SUBSCRIPTION_PLAN_CONFIG = {
    [SubscriptionPlanType.BASIC]: {
        name: 'Plan Básico',
        monthly_price: 29.99,
        features: {
            max_events: 5,
            max_tickets_per_event: 100,
            identity_verification: false,
            analytics: false,
            blockchain_certification: false
        }
    },
    [SubscriptionPlanType.STANDARD]: {
        name: 'Plan Estándar',
        monthly_price: 79.99,
        features: {
            max_events: 20,
            max_tickets_per_event: 500,
            identity_verification: true,
            analytics: false,
            blockchain_certification: true
        }
    },
    [SubscriptionPlanType.PREMIUM]: {
        name: 'Plan Premium',
        monthly_price: 149.99,
        features: {
            max_events: -1, // Ilimitado
            max_tickets_per_event: -1, // Ilimitado
            identity_verification: true,
            analytics: true,
            blockchain_certification: true
        }
    }
};

export function getPlanFeatures(planType: SubscriptionPlanType) {
    return SUBSCRIPTION_PLAN_CONFIG[planType] || SUBSCRIPTION_PLAN_CONFIG[SubscriptionPlanType.BASIC];
}