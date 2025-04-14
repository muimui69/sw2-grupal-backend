import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";
import { Purchase } from "src/payment/entities/purchase.entity";
import { IdentityVerification } from "src/identity/entities/identity-verification.entity";
import { Permission } from './permission.entity';
import { Tenant } from 'src/tenant/entities/tenant.entity';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
        nullable: false,
    })
    email: string;

    @Column('text', {
        select: false,
        nullable: false,
    })
    password: string;

    @Column('text', {
        nullable: false,
    })
    fullname: string;

    @Column('text', {
        nullable: false,
    })
    lastname: string;

    @Column('int', {
        nullable: true,
    })
    phone: number;

    @Column('int', {
        nullable: true,
    })
    codeCountry: number;

    @Column('text', {
        nullable: true,
    })
    country: string;

    @Column('text', {
        nullable: true,
    })
    city: string;

    @Column({ type: 'enum', enum: ['m', 'f', 'u'], nullable: false })
    /**
     * m - male
     * f - female
     * u - unspecified
     */
    gender: string;

    @Column('text', {
        nullable: true,
    })
    photoUrl: string;

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

    //?RELATIONS
    @ManyToOne(() => Role, role => role.users)
    role: Role;

    @OneToMany(() => Purchase, purchase => purchase.user)
    purchases: Purchase[];

    @OneToMany(() => IdentityVerification, iv => iv.user)
    identityVerifications: IdentityVerification[];

    @ManyToMany(() => Permission, permission => permission.users)
    @JoinTable({ name: 'user_role_permission' })
    permissions: Permission[];

    @ManyToOne(() => Tenant)
    tenant: Tenant;
    //?

}