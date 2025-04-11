import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FacultySubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('timestamp')
    start_date: Date;

    @Column('timestamp')
    end_date: Date;

    @Column('decimal', {
        precision: 10,
        scale: 2
    })
    amount_paid: number;

    @Column('bool', {
        default: true
    })
    is_active: boolean;

    @Column('timestamp', {
        default: () => 'now()'
    })
    created_at: Date;

    @Column('timestamp', {
        default: () => 'now()'
    })
    updated_at: Date;

    //? RELATIONS
    // @ManyToOne(() => Faculty, faculty => faculty.subscriptions)
    // faculty: Faculty;

    // @ManyToOne(() => SubscriptionPlan, plan => plan.facultySubscriptions)
    // plan: SubscriptionPlan;
    //?
}