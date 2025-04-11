import { Ticket } from "src/ticket/entities/ticket.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "./event.entity";

@Entity()
export class Section {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        nullable: false,
    })
    name: string;

    @Column('text', {
        nullable: false,
    })
    description: string;

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
    //?
}
