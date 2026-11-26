import { Field, InputType, Int } from "type-graphql";
import { IsInt, Max, Min } from "class-validator";
import { READING_GOAL_MAX_TARGET } from "../../../../services/gamification/reading-goal-service";

/** Objectif du défi de lecture de l'année en cours (heure de Paris). */
@InputType()
export class SetReadingGoalInput {
    @Field(() => Int)
    @IsInt()
    @Min(1)
    @Max(READING_GOAL_MAX_TARGET)
    target!: number;
}
