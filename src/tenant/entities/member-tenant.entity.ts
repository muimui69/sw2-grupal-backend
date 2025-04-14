import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "./tenant.entity";
import { User } from "src/auth/entities/user.entity";

@Entity()
export class MemberTenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        nullable: false
    })
    role: string;

    @Column('text', {
        nullable: true
    })
    tenantAddress: string;

    @Column('text', {
        nullable: true
    })
    eventAddress: string;

    //?RELATIONS
    @ManyToOne(() => Tenant)
    tenant: Tenant;

    @ManyToOne(() => User)
    user: User;
    //?
}