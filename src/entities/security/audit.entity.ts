import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity("audit", { schema: 'security' })
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