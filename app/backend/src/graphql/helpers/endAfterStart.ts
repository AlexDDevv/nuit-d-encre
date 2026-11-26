import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";
import { CreateUserBookInput } from "../inputs/create/user/create-user-book-input";

/**
 * Class-level helper: ensure finishedAt >= startedAt (when both are provided)
 */
@ValidatorConstraint({ name: "endAfterStart", async: false })
export class EndAfterStart implements ValidatorConstraintInterface {
    validate(
        finishedAt: string | null | undefined,
        args: ValidationArguments,
    ): boolean {
        const obj = args.object as CreateUserBookInput;
        if (!finishedAt || !obj.startedAt) return true; // ok if one is missing
        // Dates AAAA-MM-JJ : l'ordre lexicographique est l'ordre chronologique.
        return finishedAt >= obj.startedAt;
    }
    defaultMessage(): string {
        return "finishedAt must be greater than or equal to startedAt.";
    }
}
