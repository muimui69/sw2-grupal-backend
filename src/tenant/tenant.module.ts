import { Module } from '@nestjs/common';
import { TenantService } from './services/tenant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Tenant } from './entities/tenant.entity';
import { TenantMiddleware } from './middlewares/tenant.middleware';
import { TenantInterceptor } from './interceptors/tenant.interceptor';
import { MemberTenant } from './entities/member-tenant.entity';
import { PaymentMembreship } from './entities/payment-membreship';
import { SubscriptionService } from './services/subscription.service';
import { AuthModule } from 'src/auth/auth.module';
import { SubscriptionController } from './controllers/Suscription.controller';
import { UserModule } from 'src/user/user.module';
import { Configuration } from './entities/configuration.entity';
import { Role } from 'src/auth/entities/role.entity';


@Module({
    controllers: [
        SubscriptionController,
        // TenantController
    ],
    providers: [
        TenantService,
        SubscriptionService,
        TenantMiddleware,
        TenantInterceptor
    ],
    imports: [
        AuthModule,
        UserModule,
        TypeOrmModule.forFeature([
            Tenant,
            Subscription,
            MemberTenant,
            PaymentMembreship,
            Configuration,
            Role
        ]),
    ],
    exports: [
        TenantService,
        SubscriptionService
    ]
})
export class TenantModule { }
