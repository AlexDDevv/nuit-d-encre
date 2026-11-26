import { Field, Int, ObjectType } from "type-graphql";

/** Défi de lecture d'une année et sa progression, comptée à la lecture. */
@ObjectType()
export class ReadingGoalProgress {
    @Field(() => Int)
    year!: number;

    @Field(() => Int)
    target!: number;

    /** Livres « lus » dont la date de fin tombe dans l'année. */
    @Field(() => Int)
    booksRead!: number;

    /** XP accordée quand l'objectif est atteint (une fois par année). */
    @Field(() => Int)
    rewardXp!: number;
}
