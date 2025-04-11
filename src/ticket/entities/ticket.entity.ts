import { Section } from "src/event/entities/section.entity";
import { TicketPurchase } from "src/event/entities/ticket-purchase.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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

    @OneToMany(() => TicketPurchase, tp => tp.ticket)
    ticketPurchases: TicketPurchase[];
    //?
}