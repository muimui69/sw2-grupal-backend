import { Ticket } from "src/event/entities/ticket.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "./event.entity";
import { Tenant } from 'src/tenant/entities/tenant.entity';

@Entity()
export class Section {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column('uuid')
    tenantId: string;

    @Column('text', {
        nullable: false,
    })
    name: string;

    @Column('text', {
        nullable: false,
    })
    description: string;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        nullable: false,
    })
    price: number;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        nullable: false,
    })
    total_quantity: number;

    @Column('bool', {
        default: true,
        nullable: false,
    })
    state: boolean;

    @Column('timestamp', {
        nullable: false,
        default: () => 'now()'
    })
    created_at: Date;

    @Column('timestamp', {
        nullable: false,
        default: () => 'now()'
    })
    updated_at: Date;

    //? RELATIONS
    @ManyToOne(() => Event, event => event.sections)
    event: Event;

    @OneToMany(() => Ticket, ticket => ticket.section)
    tickets: Ticket[];

    @ManyToOne(() => Tenant)
    @JoinColumn({ name: 'tenantId' })
    tenant: Tenant;
    //?
}
