import { User } from "src/auth/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TicketPurchase } from "./ticket-purchase.entity";

@Entity()
export class Purchase {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    total: number;

    @Column()
    date: Date;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => User, user => user.purchases)
    user: User;

    @OneToMany(() => TicketPurchase, tp => tp.purchase)
    ticketPurchases: TicketPurchase[];
}

