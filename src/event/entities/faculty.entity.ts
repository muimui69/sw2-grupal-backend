import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "./event.entity";

@Entity()
export class Faculty {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    location: string;

    @Column({ type: 'boolean', default: true })
    state: boolean;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => Event, event => event.faculty)
    events: Event[];
}
