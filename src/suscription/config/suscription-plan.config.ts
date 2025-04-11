import { SubscriptionPlanType } from 'src/common/enums/suscription-plan-type/suscription-plan-type.enum';

export const SUBSCRIPTION_PLAN_CONFIG = {
    [SubscriptionPlanType.BASIC]: {
        name: "Plan Básico",
        description: "Para eventos pequeños y de baja complejidad",
        price: 99.99,
        duration_months: 6,
        max_events: 5,
        max_tickets_per_event: 100,
        include_identity_verification: false,
        include_analytics: false
    },
    [SubscriptionPlanType.STANDARD]: {
        name: "Plan Estándar",
        description: "Para eventos medianos con verificación básica",
        price: 199.99,
        duration_months: 6,
        max_events: 15,
        max_tickets_per_event: 500,
        include_identity_verification: true,
        include_analytics: false
    },
    [SubscriptionPlanType.PREMIUM]: {
        name: "Plan Premium",
        description: "Eventos ilimitados con todas las características",
        price: 399.99,
        duration_months: 6,
        max_events: -1, // -1 significa ilimitado
        max_tickets_per_event: -1, // -1 significa ilimitado
        include_identity_verification: true,
        include_analytics: true
    }
};