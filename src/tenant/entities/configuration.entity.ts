import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import { Tenant } from "./tenant.entity";

@Entity()
export class Configuration {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        nullable: false
    })
    plan: string;

    @Column('int', {
        nullable: false
    })
    limit_tickets: number;

    @Column('bool', {
        default: true
    })
    blockchain: boolean;

    @Column('bool', {
        default: true
    })
    facial_recognition: boolean;

    @Column('bool', {
        default: false
    })
    document_recognition: boolean;

    @Column('bool', {
        default: false
    })
    firewall: boolean;

    //?RELATIONS    
    @OneToOne(() => Tenant)
    @JoinColumn()
    tenant: Tenant;
    //?
}