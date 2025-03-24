import { User } from "src/auth/entities/user.entity";
import { Event } from "src/event/entities/event.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class IdentityVerification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    document_url: string;

    @Column()
    selfie_url: string;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @Column({ nullable: true })
    verified_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => User, user => user.identityVerifications)
    user: User;

    @ManyToOne(() => Event, event => event.identityVerifications)
    event: Event;
}