import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../entities/suscription-plan.entity';
import { SubscriptionPlanType } from 'src/common/enums/suscription-plan-type/suscription-plan-type.enum';
import { SUBSCRIPTION_PLAN_CONFIG } from '../config/suscription-plan.config';

@Injectable()
export class SubscriptionService {
    constructor(
        @InjectRepository(SubscriptionPlan)
        private readonly subscriptionPlanRepository: Repository<SubscriptionPlan>,
    ) { }

    async initializeDefaultPlans() {
        for (const planType of Object.values(SubscriptionPlanType)) {
            const existingPlan = await this.subscriptionPlanRepository.findOne({
                where: { plan_type: planType }
            });

            if (!existingPlan) {
                const planConfig = SUBSCRIPTION_PLAN_CONFIG[planType];
                await this.subscriptionPlanRepository.save({
                    plan_type: planType,
                    ...planConfig
                });
            }
        }
    }

    async getPlanByType(planType: SubscriptionPlanType): Promise<SubscriptionPlan> {
        return this.subscriptionPlanRepository.findOne({
            where: { plan_type: planType }
        });
    }
}