import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/auth/entities/user.entity";
import { Subscription } from './subscription.entity';

@Entity()
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
        nullable: false
    })
    name: string;

    @Column('text', {
        unique: true,
        nullable: false
    })
    display_name: string;

    @Column('text', {
        nullable: true
    })
    logo_url: string;

    @Column('bool', {
        default: true
    })
    active: boolean;

    @Column('timestamp', {
        default: () => 'now()'
    })
    created_at: Date;

    @Column('timestamp', {
        default: () => 'now()'
    })
    updated_at: Date;

    //? RELATIONS
    @OneToMany(() => User, user => user.tenant)
    users: User[];

    @OneToOne(() => Subscription, subscription => subscription.tenant)
    subscription: Subscription;
    //?
}