import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { Purchase } from './purchase.entity';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column('uuid')
    tenantId: string;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        nullable: false,
    })
    amount: string;

    @Column({
        type: 'enum', enum: ['card'],
        nullable: false
    })
    method: string;

    @Column('bool', {
        default: false,
        nullable: false,
    })
    state: boolean;

    @Column('timestamp', {
        nullable: false,
        default: () => 'now()',
    })
    created_at: Date;

    @Column('timestamp', {
        nullable: false,
        default: () => 'now()',
    })
    updated_at: Date;

    //? RELATIONS
    @OneToOne(() => Purchase, purchase => purchase.payment)
    purchase: Purchase;

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;
    //? 
}
