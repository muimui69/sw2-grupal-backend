import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantService } from './tenant.service';
import { SubscriptionPlanType } from 'src/common/enums/suscription-plan-type/suscription-plan-type.enum';
import { UpdateSubscriptionDto } from '../dtos/subscription/update-subscription.dto';
import { getPlanFeatures } from '../config/subscription-plan.config';
import { Subscription } from '../entities/subscription.entity';

@Injectable()
export class SubscriptionService {
    constructor(
        @InjectRepository(Subscription)
        private readonly subscriptionRepository: Repository<Subscription>,
        @Inject(forwardRef(() => TenantService))
        private readonly tenantService: TenantService,
    ) { }

    async findByTenantId(tenantId: string): Promise<Subscription> {
        const subscription = await this.subscriptionRepository.findOne({
            where: { tenant: { id: tenantId } },
            relations: ['tenant']
        });

        if (!subscription) {
            throw new NotFoundException(`Subscription not found for tenant ${tenantId}`);
        }

        return subscription;
    }

    async createForTenant(
        tenantId: string,
        planType: SubscriptionPlanType = SubscriptionPlanType.BASIC
    ): Promise<Subscription> {
        // Verificar que el tenant exista
        const tenant = await this.tenantService.findById(tenantId);

        // Verificar que no exista ya una suscripción
        const existingSubscription = await this.subscriptionRepository.findOne({
            where: { tenant: { id: tenantId } }
        });

        if (existingSubscription) {
            throw new BadRequestException(`Subscription already exists for tenant ${tenantId}`);
        }

        // Crear nueva suscripción con validez de 1 mes
        const startDate = new Date();
        const endDate = this.addMonths(startDate, 1);

        return this.subscriptionRepository.save({
            plan_type: planType,
            start_date: startDate,
            end_date: endDate,
            active: true,
            tenant: { id: tenantId }
        });
    }

    async update(tenantId: string, updateDto: UpdateSubscriptionDto): Promise<Subscription> {
        const subscription = await this.findByTenantId(tenantId);

        await this.subscriptionRepository.update(subscription.id, updateDto);

        return this.findByTenantId(tenantId);
    }

    async renewSubscription(tenantId: string, months: number = 1): Promise<Subscription> {
        const subscription = await this.findByTenantId(tenantId);

        const newEndDate = this.addMonths(
            subscription.active ? subscription.end_date : new Date(),
            months
        );

        await this.subscriptionRepository.update(subscription.id, {
            end_date: newEndDate,
            active: true
        });

        return this.findByTenantId(tenantId);
    }

    async changePlan(tenantId: string, newPlanType: SubscriptionPlanType): Promise<Subscription> {
        const subscription = await this.findByTenantId(tenantId);

        await this.subscriptionRepository.update(subscription.id, {
            plan_type: newPlanType
        });

        return this.findByTenantId(tenantId);
    }

    async cancelSubscription(tenantId: string): Promise<void> {
        const subscription = await this.findByTenantId(tenantId);

        await this.subscriptionRepository.update(subscription.id, {
            active: false
        });
    }

    async checkFeatureAvailability(tenantId: string, feature: string): Promise<boolean> {
        const subscription = await this.findByTenantId(tenantId);

        if (!subscription.active) {
            return false;
        }

        const planFeatures = getPlanFeatures(subscription.plan_type).features;
        return !!planFeatures[feature];
    }

    private addMonths(date: Date, months: number): Date {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }
}