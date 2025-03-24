import { Section } from "src/event/entities/section.entity";
import { TicketPurchase } from "src/event/entities/ticket-purchase.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    date: Date;

    @Column()
    price: number;

    @Column()
    total_quantity: number;

    @Column({ type: 'boolean', default: true })
    state: boolean;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Section, section => section.tickets)
    section: Section;

    @OneToMany(() => TicketPurchase, tp => tp.ticket)
    ticketPurchases: TicketPurchase[];
}