import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./permission.entity";
import { User } from "./user.entity";


@Entity()
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
        nullable: false,
    })
    name: string;

    @Column('text', {
        nullable: true,
    })
    description: string;

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

    // ? TRIGGERS
    @BeforeInsert()
    toUpperCase() {
        if (this.name) {
            this.name = this.name.toUpperCase().trim();
        }
    }

    @BeforeInsert()
    validateName() {
        if (this.name.split(' ').length > 1) {
            throw new Error('Name must be a single word');
        }
    }
    //?

    @OneToMany(() => User, user => user.role, {
        cascade: true,
        eager: true,
    })
    users: User[];

    @ManyToMany(() => Permission, permission => permission.roles)
    @JoinTable({ name: 'role_permission' })
    permissions: Permission[];

}
