import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "posts" })
export class Post {
  @PrimaryGeneratedColumn() public id: number;

  @Column() public title: string;

  @Column() public content: string;

  @Column({ name: "content_rendered" })
  public contentRendered: string;

  @Column({ name: "published_at" })
  public publishedAt: Date;
}
