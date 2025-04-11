import { User } from "src/auth/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TicketPurchase } from "./ticket-purchase.entity";

@Entity()
export class Purchase {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', {
        precision: 10,
        scale: 2
    })
    total: number;

    @Column('timestamp', {
        nullable: false,
    })
    date: Date;

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

    //?RELATIONS
    @ManyToOne(() => User, user => user.purchases)
    user: User;

    @OneToMany(() => TicketPurchase, tp => tp.purchase)
    ticketPurchases: TicketPurchase[];
    //?
}

