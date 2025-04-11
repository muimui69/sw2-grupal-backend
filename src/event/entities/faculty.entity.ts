import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Event } from "./event.entity";

@Entity()
export class Faculty {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        nullable: false,
    })
    name: string;

    @Column('text', {
        nullable: true,
    })
    location: string;

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

    //? RELATIONS
    @OneToMany(() => Event, event => event.faculty)
    events: Event[];

    // @OneToMany(() => FacultySubscription, fs => fs.faculty)
    // subscriptions: FacultySubscription[];

    //? 
}
