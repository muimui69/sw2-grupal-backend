import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Faculty } from "./faculty.entity";
import { Section } from "./section.entity";
import { IdentityVerification } from "src/identity/entities/identity-verification.entity";

@Entity()
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        nullable: false,
    })
    title: string;

    @Column('text', {
        nullable: true,
    })
    description: string;

    @Column('text', {
        nullable: false,
    })
    image_url: string;

    @Column('timestamp', {
        nullable: false,
    })
    start_date: Date;

    @Column('timestamp', {
        nullable: false,
    })
    end_date: Date;

    @Column('text', {
        nullable: false,
    })
    address: string;

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

    @ManyToOne(() => Faculty, faculty => faculty.events)
    faculty: Faculty;

    @OneToMany(() => Section, section => section.event)
    sections: Section[];

    @OneToMany(() => IdentityVerification, iv => iv.event)
    identityVerifications: IdentityVerification[];
}
