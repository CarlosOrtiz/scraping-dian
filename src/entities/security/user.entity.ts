import { Column, Entity, PrimaryGeneratedColumn, Unique, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { States } from "../enums/states.enum";

@Entity("user", { schema: 'security' })
@Unique(["email"])
export class User {

  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column("character varying", { length: 200 })
  email: string;

  @Column("character varying", { length: 250 })
  password: string;

  @Column("enum", { enum: States, default: States.Active })
  state: States;

  @Column("character varying", { nullable: true, length: 100 })
  code: string;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
  updatedAt: Date;

}