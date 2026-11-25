import { Field, ID, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Roles, UserRole } from "../../../types/types";
import { Book } from "../book/book";
import { UserActions } from "./user-actions";
import { Author } from "../author/author";
import { UserBook } from "./user-book";
import { BookReview } from "../book/bookReview";
import { BookRecommendation } from "../book/bookRecommendation";
import { BookReviewVote } from "../book/bookReviewVote";
import { Title } from "../gamification/title";
import { UserFollow } from "./user-follow";

/**
 * Represents a user entity in the database.
 * @param name is the entity's name in database.
 * This class defines the structure of the user entity in database:
 * - `id`: unique identifier for the user.
 * - `email`: user's email address (unique).
 * - `hashedPassword`: the user's password stored in a hashed format (not exposed via GraphQL).
 * - `userName`: the user's name.
 * - `role`: the user's role (defaults to `Roles.User`).
 * - `books`: list of books created by the user (relation to the `Book` entity).
 * - `level`: level reached by the user.
 * - `xp`: user experience earned by actions.
 * - `actions`: actions that allow the user to gain experience.
 * - `isLibraryPublic`: whether the library is shared (private by default).
 *
 * Relations are NOT exposed in GraphQL by default: they would leak private
 * data (votes, XP log…) as soon as a resolver loads them. Expose what is
 * public through an explicit FieldResolver that applies visibility rules.
 * - `createdAt`: timestamp of when the user was created.
 * - `updatedAt`: timestamp of when the user was last updated.
 *
 * The class also leverages the following decorators:
 * - `@Column()`: Tells TypeORM to store the property in the database.
 * - `@Field()`: Exposes the property in the GraphQL schema (via type-graphql).
 *
 * For `createdAt` and `updatedAt`, the timestamps are automatically set by the database.
 */
@ObjectType()
@Entity({ name: "user" })
export class User extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ length: 254, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    hashedPassword?: string | null;

    // Identifiant Google (`sub`) pour les comptes liés à Google. Non exposé en GraphQL.
    @Column({ type: "varchar", length: 255, nullable: true, unique: true })
    googleId?: string | null;

    @Field()
    @Column({ length: 100 })
    userName!: string;

    @Field()
    @Column({
        type: "enum",
        enum: Roles,
        default: Roles.User,
    })
    role!: UserRole;

    @OneToMany(() => Book, (book) => book.user)
    books!: Book[];

    @OneToMany(() => Author, (author) => author.user)
    authors!: Author[];

    @Field()
    @Column()
    level!: number;

    @Field()
    @Column()
    xp!: number;

    @Field(() => String, { nullable: true })
    @Column({ type: "text", nullable: true })
    avatar?: string | null;

    @Field(() => String, { nullable: true })
    @Column({ type: "text", nullable: true })
    banner?: string | null;

    @Field(() => String, { nullable: true })
    @Column({ type: "varchar", length: 300, nullable: true })
    bio?: string | null;

    // Partage de la bibliothèque sur le profil et dans les fils d'activité.
    // Privé par défaut ; règles dans utils/visibility.ts.
    @Field(() => Boolean)
    @Column({ type: "boolean", default: false })
    isLibraryPublic!: boolean;

    // Computed via FieldResolver in ProfileResolver - not stored in DB
    @Field(() => Title, { nullable: true })
    title?: Title | null;

    @OneToMany(() => UserActions, (action) => action.user)
    actions!: UserActions[];

    @OneToMany(() => UserFollow, (f) => f.follower)
    following!: UserFollow[];

    @OneToMany(() => UserFollow, (f) => f.following)
    followers!: UserFollow[];

    @OneToMany(() => UserBook, (ub) => ub.user)
    userBooks!: UserBook[];

    @OneToMany(() => BookReview, (review) => review.user)
    bookReviews!: BookReview[];

    @OneToMany(() => BookRecommendation, (recommendation) => recommendation.user)
    bookRecommendations!: BookRecommendation[];

    @OneToMany(() => BookReviewVote, (vote) => vote.user)
    bookReviewVotes!: BookReviewVote[];

    @Field()
    @Column({ default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Field()
    @Column({
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    })
    updatedAt!: Date;
}

@ObjectType()
export class LogInResponse {
    @Field()
    message!: string;

    @Field(() => Boolean)
    cookieSet!: boolean;
}
