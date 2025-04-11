import { Module } from '@nestjs/common';
import { TenantService } from './services/tenant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Tenant } from './entities/tenant.entity';
import { SubscriptionService } from './services/subscription.service';
import { TenantMiddleware } from './middlewares/tenant.middleware';
import { TenantInterceptor } from './interceptors/tenant.interceptor';


@Module({
    providers: [
        TenantService,
        SubscriptionService,
        TenantMiddleware,
        TenantInterceptor
    ],
    imports: [
        TypeOrmModule.forFeature([
            Tenant,
            Subscription
        ]),
    ],
    exports: [
        TenantService,
        SubscriptionService
    ]
})
export class TenantModule { }
