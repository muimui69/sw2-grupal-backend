import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";
import { User } from "./user.entity";


@Entity()
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ type: 'boolean', default: true })
    state: boolean;

    @CreateDateColumn()
    created_at: Date;

    @ManyToMany(() => Role, role => role.permissions)
    roles: Role[];

    @ManyToMany(() => User, user => user.permissions)
    users: User[];

}
