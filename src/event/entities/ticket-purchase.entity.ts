import { Ticket } from "src/ticket/entities/ticket.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Purchase } from "./purchase.entity";

@Entity()
export class TicketPurchase {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    quantity: number;

    @Column()
    price: number;

    @Column()
    subtotal: number;

    @Column()
    system_fee: number;

    @Column({ nullable: true })
    qr_code: string;

    @Column({ nullable: true })
    validated_at: Date;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Ticket, ticket => ticket.ticketPurchases)
    ticket: Ticket;

    @ManyToOne(() => Purchase, purchase => purchase.ticketPurchases)
    purchase: Purchase;
}