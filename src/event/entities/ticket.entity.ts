import { Section } from "src/event/entities/section.entity";
import { TicketPurchase } from 'src/payment/entities/ticket-purchase.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column('uuid')
    tenantId: string;

    @Column('timestamp', {
        nullable: false,
    })
    date: Date;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        nullable: false,
    })
    price: number;

    @Column('bool', {
        default: true,
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

    //?RELATIONS
    @ManyToOne(() => Section, section => section.tickets)
    section: Section;

    // @OneToMany(() => TicketPurchase, tp => tp.ticket)
    // ticketPurchases: TicketPurchase[];
    @OneToMany(() => TicketPurchase, ticketPurchase => ticketPurchase.ticket)
    ticketPurchases: TicketPurchase[];

    @ManyToOne(() => Tenant, tenant => tenant.ticket)
    @JoinColumn()
    tenant: Tenant;
    //?
}