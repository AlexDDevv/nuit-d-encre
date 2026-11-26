import { Field, ID, Int, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from "typeorm";
import { User } from "../user/user";

/**
 * Défi de lecture annuel : nombre de livres qu'un lecteur se fixe pour une
 * année (heure de Paris). La progression se compte à la lecture (livres
 * « lus » dont `finishedAt` tombe dans l'année), elle n'est pas stockée.
 * Supprimé avec le compte (cascade).
 */
@ObjectType()
@Entity({ name: "reading_goal" })
@Unique("UQ_reading_goal_user_year", ["user", "year"])
export class ReadingGoal extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, (user) => user.readingGoals, {
        onDelete: "CASCADE",
        nullable: false,
    })
    user!: User;

    @Field(() => Int)
    @Column({ type: "int" })
    year!: number;

    @Field(() => Int)
    @Column({ type: "int" })
    target!: number;

    @Field()
    @CreateDateColumn({ type: "timestamp with time zone" })
    createdAt!: Date;

    @Field()
    @UpdateDateColumn({ type: "timestamp with time zone" })
    updatedAt!: Date;
}
