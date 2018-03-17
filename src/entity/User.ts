import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn() public id: number;

  @Column() public name: string;

  @Column({ name: "display_name" })
  public displayName: string;
}
