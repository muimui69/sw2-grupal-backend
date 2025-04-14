import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "src/tenant/entities/tenant.entity";
import { SubscriptionPlanType } from 'src/common/enums/suscription-plan-type/suscription-plan-type.enum';

@Entity()
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: SubscriptionPlanType,
        default: SubscriptionPlanType.BASIC
    })
    plan_type: SubscriptionPlanType;

    @Column('timestamp')
    start_date: Date;

    @Column('timestamp')
    end_date: Date;

    @Column('bool', {
        default: true
    })
    active: boolean;

    @Column('timestamp', {
        default: () => 'now()'
    })
    created_at: Date;

    @Column('timestamp', {
        default: () => 'now()'
    })
    updated_at: Date;

    @OneToOne(() => Tenant, tenant => tenant.subscription)
    @JoinColumn()
    tenant: Tenant;
}