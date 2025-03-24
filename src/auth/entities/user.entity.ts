import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";
import { Purchase } from "src/event/entities/purchase.entity";
import { IdentityVerification } from "src/identity/entities/identity-verification.entity";
import { Permission } from './permission.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    email: string;

    @Column('text')
    password: string;

    @Column()
    fullname: string;

    @Column({ type: 'boolean', default: true })
    state: boolean;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Role, role => role.users)
    role: Role;

    @OneToMany(() => Purchase, purchase => purchase.user)
    purchases: Purchase[];

    @OneToMany(() => IdentityVerification, iv => iv.user)
    identityVerifications: IdentityVerification[];

    @ManyToMany(() => Permission, permission => permission.users)
    @JoinTable({ name: 'user_role_permission' })
    permissions: Permission[];


}