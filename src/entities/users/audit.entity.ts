import { Column, Entity, JoinColumn, PrimaryGeneratedColumn, ManyToOne, OneToOne, CreateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("audit", { schema: 'users' })
export class Audit {

  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column("character varying", { length: 50 })
  code: string;

  @Column("character varying", { length: 50 })
  name: string;

  @Column("character varying", { nullable: true, length: 50 })
  user: string;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

}