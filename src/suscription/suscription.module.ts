import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionService } from './services/suscription.service';
import { FacultySubscription } from './entities/faculty-suscription.entity';
import { SubscriptionPlan } from './entities/suscription-plan.entity';

@Module({
    providers: [SubscriptionService],
    imports: [
        TypeOrmModule.forFeature([
            FacultySubscription,
            SubscriptionPlan
        ])
    ]
})
export class SuscriptionModule { }
