import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Faculty } from "./faculty.entity";
import { Section } from "./section.entity";
import { IdentityVerification } from "src/identity/entities/identity-verification.entity";

@Entity()
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    image_url: string;

    @Column()
    start_date: Date;

    @Column()
    end_date: Date;

    @Column({ type: 'boolean', default: true })
    state: boolean;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Faculty, faculty => faculty.events)
    faculty: Faculty;

    @OneToMany(() => Section, section => section.event)
    sections: Section[];

    @OneToMany(() => IdentityVerification, iv => iv.event)
    identityVerifications: IdentityVerification[];
}
