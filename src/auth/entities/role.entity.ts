import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./permission.entity";
import { User } from "./user.entity";


@Entity()
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    state: boolean;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => User, user => user.role)
    users: User[];

    @ManyToMany(() => Permission, permission => permission.roles)
    @JoinTable({ name: 'role_permission' })
    permissions: Permission[];


}
