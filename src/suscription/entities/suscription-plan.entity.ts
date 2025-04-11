import { SubscriptionPlanType } from 'src/common/enums/suscription-plan-type/suscription-plan-type.enum';
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SubscriptionPlan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: SubscriptionPlanType,
        default: SubscriptionPlanType.BASIC
    })
    plan_type: SubscriptionPlanType;

    @Column('text')
    name: string;

    @Column('text')
    description: string;

    @Column('decimal', {
        precision: 10,
        scale: 2
    })
    price: number;

    @Column('int')
    duration_months: number;

    @Column('int')
    max_events: number;

    @Column('int')
    max_tickets_per_event: number;

    @Column('bool', {
        default: false
    })
    include_identity_verification: boolean;

    @Column('bool', {
        default: false
    })
    include_analytics: boolean;

    @Column('bool', {
        default: true
    })
    state: boolean;

    @Column('timestamp', {
        default: () => 'now()'
    })
    created_at: Date;

    @Column('timestamp', {
        default: () => 'now()'
    })
    updated_at: Date;

    //? RELATIONS
    // @OneToMany(() => FacultySubscription, fs => fs.plan)
    // facultySubscriptions: FacultySubscription[];
    //?
}