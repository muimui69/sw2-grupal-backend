import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';
import { CreateTenantDto } from '../dtos/tenant/create-tenant.dto';
import { UpdateTenantDto } from '../dtos/tenant/update-tenant.dto';
import { SubscriptionService } from './subscription.service';
import { SubscriptionPlanType } from 'src/common/enums/suscription-plan-type/suscription-plan-type.enum';

@Injectable()
export class TenantService {
    constructor(
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
        @Inject(forwardRef(() => SubscriptionService))
        private readonly subscriptionService: SubscriptionService,
    ) { }

    async findAll(): Promise<Tenant[]> {
        return this.tenantRepository.find();
    }

    async findById(id: string): Promise<Tenant> {
        const tenant = await this.tenantRepository.findOne({
            where: { id }
        });

        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }

        return tenant;
    }

    async findByName(name: string): Promise<Tenant> {
        return this.tenantRepository.findOne({
            where: { name }
        });
    }

    async create(createTenantDto: CreateTenantDto, planType: SubscriptionPlanType): Promise<Tenant> {
        // Verificar que el nombre de tenant no esté en uso
        const existing = await this.findByName(createTenantDto.name);
        if (existing) {
            throw new Error('Tenant name already in use');
        }

        // Crear el tenant
        const tenant = await this.tenantRepository.save({
            ...createTenantDto,
            active: true
        });

        // Crear suscripción para el tenant
        await this.subscriptionService.createForTenant(tenant.id, planType);

        return tenant;
    }

    async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
        const tenant = await this.findById(id);

        await this.tenantRepository.update(id, updateTenantDto);

        return this.findById(id);
    }

    async deactivate(id: string): Promise<void> {
        const tenant = await this.findById(id);

        await this.tenantRepository.update(id, { active: false });
        // También se podría desactivar la suscripción
    }

    async activate(id: string): Promise<void> {
        const tenant = await this.findById(id);

        await this.tenantRepository.update(id, { active: true });
    }
}