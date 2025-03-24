import { Ticket } from "src/ticket/entities/ticket.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "./event.entity";

@Entity()
export class Section {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ type: 'boolean', default: true })
    state: boolean;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Event, event => event.sections)
    event: Event;

    @OneToMany(() => Ticket, ticket => ticket.section)
    tickets: Ticket[];
}
