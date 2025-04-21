import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { v4 as uuid } from 'uuid';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Subscription } from '../entities/subscription.entity';
import { Tenant } from '../entities/tenant.entity';
import { User } from 'src/auth/entities/user.entity';
import { PaymentMembreship } from '../entities/payment-membreship';
import { Role } from 'src/auth/entities/role.entity';
import { MemberTenant } from '../entities/member-tenant.entity';
import { Permission } from 'src/auth/entities/permission.entity';
import { IOptionSubscription } from '../interfaces/option-subscription.interface';
import { handleError } from 'src/common/helpers/function-helper';
import { SubscriptionCreateDTO } from '../dto/subscription/create-subscription.dto';
import { addDays } from 'date-fns';
import { RoleEnum } from 'src/user/enums/role.enum';
import { genSaltSync, hashSync } from 'bcryptjs';
import { SubscriptionPlanTypeEnum } from 'src/common/enums/suscription-plan-type-enum/suscription-plan-type.enum';
import { Configuration } from '../entities/configuration.entity';

@Injectable()
export class SubscriptionService {
    private readonly stripe: Stripe;

    constructor(
        @InjectRepository(Subscription)
        private readonly subscriptionRepository: Repository<Subscription>,
        @InjectRepository(Configuration)
        private readonly configurationRepository: Repository<Configuration>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,

        private readonly dataSource: DataSource,
        private readonly configService: ConfigService,
    ) {
        this.stripe = new Stripe(this.configService.get<string>("stripe_key"));
    }

    async findAllSubscriptions({
        where,
        skip,
        take,
        order,
        select
    }: IOptionSubscription) {
        try {
            const query = this.subscriptionRepository.createQueryBuilder('subscription');

            if (where) {
                Object.entries(where).forEach(([key, value]) => {
                    query.andWhere(`subscription.${key} = :${key}`, { [key]: value });
                });
            }

            if (skip) query.skip(skip);
            if (take) query.take(take);

            if (order) {
                Object.entries(order).forEach(([key, value]) => {
                    query.orderBy(`subscription.${key}`, value.toString().toUpperCase() as 'ASC' | 'DESC');
                });
            }

            if (select) {
                const selections = Object.entries(select)
                    .filter(([, value]) => value === true)
                    .map(([key,]) => `subscription.${key}`);

                query.select(selections);
            }
            const allSubscriptions = await query.getMany();
            return allSubscriptions;
        } catch (err) {
            throw handleError(err, 'findAllSubscriptions');
        }
    }

    async countSubscriptions({
        where,
    }: IOptionSubscription) {
        try {
            const query = this.subscriptionRepository.createQueryBuilder('subscription');

            if (where) {
                Object.entries(where).forEach(([key, value]) => {
                    query.andWhere(`subscription.${key} = :${key}`, { [key]: value });
                });
            }
            const count = await query.getCount();
            return count;
        } catch (err) {
            throw handleError(err, 'countSubscriptions');
        }
    }

    async findSubscriptionById(id: string, { select }: IOptionSubscription) {
        try {
            const query = this.subscriptionRepository.createQueryBuilder('subscription')
                .where('subscription.id = :id', { id });

            if (select) {
                const selections = Object.entries(select)
                    .filter(([, value]) => value === true)
                    .map(([key,]) => `subscription.${key}`);

                if (selections.length > 0) {
                    query.select(selections);
                }
            }

            const subscription = await query.getOne();

            if (!subscription)
                throw new NotFoundException(`Suscripción con ID ${id} no encontrada`);

            return subscription;
        } catch (err) {
            throw handleError(err, 'findSubscriptionById');
        }
    }


    async findConfigurationByPlanType(plan: SubscriptionPlanTypeEnum, { select }: IOptionSubscription) {
        try {
            const query = this.configurationRepository.createQueryBuilder('configuration')
                .where('configuration.plan = :plan', { plan });

            if (select) {
                const selections = Object.entries(select)
                    .filter(([, value]) => value === true)
                    .map(([key,]) => `configuration.${key}`);

                if (selections.length > 0) {
                    query.select(selections);
                }
            }

            const configuration = await query.getOne();

            if (!configuration)
                throw new NotFoundException(`Configuracion con PLAN ${plan} no encontrada`);

            return configuration;
        } catch (err) {
            throw handleError(err, 'findConfigurationByPlanType');
        }
    }

    async paymentSubscription(subscriptionCreateDTO: SubscriptionCreateDTO) {
        try {
            const { subscriptionId, userId, name, displayName } = subscriptionCreateDTO;

            const findSubscription = await this.findSubscriptionById(subscriptionId, {});

            const findHosting = await this.tenantRepository.findOne({
                where: [
                    { name },
                    { display_name: displayName }
                ]
            });

            if (findHosting)
                throw new BadRequestException(`El hosting ${findHosting.name} ya está en uso`);

            const userExists = await this.userRepository.findOne({
                where: [
                    { id: userId },
                ]
            });

            if (!userExists) {
                throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
            }

            const paymentStripe = await this.payment([
                {
                    price_data: {
                        product_data: {
                            name: findSubscription.plan_type,
                            description: `${findSubscription.duration}dias de suscripción`,
                        },
                        currency: 'usd',
                        unit_amount: findSubscription.price * 100
                    },
                    quantity: 1
                }
            ], subscriptionCreateDTO);

            return {
                paymentStripe
            };
        } catch (error) {
            throw handleError(error, 'paymentSubscription');
        }
    }

    private async payment(line_items: Stripe.Checkout.SessionCreateParams.LineItem[], metadata: SubscriptionCreateDTO) {
        const { userId, ...rest } = metadata;
        const pago = await this.stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: this.configService.get<string>("stripe_sucess_url"),
            cancel_url: this.configService.get<string>("stripe_cancel_url"),
            metadata: {
                ...rest,
                userId
            }
        });
        return pago;
    }

    async webhookPayment(body: Stripe.Metadata) {
        try {
            const dataBody = {
                name: body.name,
                subscriptionId: body.subscriptionId,
                userId: body.userId,
                displayName: body.displayName,
            };
            const saltOrRounds = genSaltSync(10);
            const subscriptionFind = await this.findSubscriptionById(dataBody.subscriptionId, {});


            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                const timeNow = new Date();
                const startTime = timeNow;
                const endTime = addDays(timeNow, subscriptionFind.duration);

                const userFind = await queryRunner.manager.findOne(User, {
                    where: { id: dataBody.userId }
                });

                if (!userFind)
                    throw new NotFoundException("Usuario no encontrado");

                const existingTenant = await this.tenantRepository.findOne({
                    where: { name: dataBody.name }
                });

                if (existingTenant)
                    throw new BadRequestException("Ya existe un tenant con ese nombre");

                const tenantCreate = new Tenant();
                tenantCreate.name = dataBody.name;
                tenantCreate.display_name = dataBody.displayName;
                await queryRunner.manager.save(tenantCreate);

                const planType = subscriptionFind.plan_type;
                const configurationFind = await this.findConfigurationByPlanType(planType, {});

                if (!configurationFind)
                    throw new NotFoundException("Configuracion no encontrada");

                const payment = new PaymentMembreship();
                payment.tenantId = tenantCreate.id;
                payment.subscriptionId = dataBody.subscriptionId;
                payment.configurationId = configurationFind.id;
                payment.record_start_date = endTime;
                payment.record_end_date = startTime;
                await queryRunner.manager.save(payment);


                // Buscar role de administrador
                const roleAdmin = await this.roleRepository.findOne({
                    where: { name: RoleEnum.ADMIN }
                });

                if (!roleAdmin) {
                    throw new NotFoundException("Rol de administrador no encontrado");
                }


                // const roleEntity = new Role();
                // roleEntity.name = RoleEnum.ADMIN
                // roleEntity.description = "Rol de administrador del tenant";
                // roleEntity.is_active = true;
                // await queryRunner.manager.save(roleEntity);

                const password = uuid().replace(/-/g, "").substring(0, 8);

                const memberTenant = new MemberTenant();
                memberTenant.password_tenant = hashSync(password, saltOrRounds);
                memberTenant.tenantId = tenantCreate.id;
                memberTenant.tenant = tenantCreate;
                memberTenant.user = userFind;
                memberTenant.role = roleAdmin;
                await queryRunner.manager.save(memberTenant);

                const findPermissions = await queryRunner.manager.find(Permission);

                if (findPermissions.length === 0)
                    throw new BadRequestException("Los permisos no están correctamente inicializados");

                // roleEntity.permissions = findPermissions;
                // await queryRunner.manager.save(roleEntity);

                await queryRunner.commitTransaction();

                // await this.mailsService.sendCredencialesCliente(
                //     userFind.name,
                //     userFind.email,
                //     subscriptionFind.name,
                //     tenantCreate.hosting,
                //     password
                // );

                return {
                    tenant: tenantCreate,
                    members: memberTenant,
                    payment
                };
            } catch (err) {
                await queryRunner.rollbackTransaction();
                throw err;
            } finally {
                await queryRunner.release();
            }
        } catch (err) {
            throw handleError(err, 'webhookPayment');
        }
    }
}