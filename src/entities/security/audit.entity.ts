import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity("audit", { schema: 'security' })
export class Audit {

  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column("character varying", { length: 200 })
  name: string;

  @Column("character varying", { length: 1000 })
  detail: string;

  @Column("character varying", { length: 50, nullable: true })
  user: string;

  @Column("character varying", { length: 100, name: 'user_name', nullable: true })
  userName: string;

  @Column("character varying", { length: 100 })
  process: string;

  @Column("character varying", { length: 1000, nullable: true })
  view: string;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

}