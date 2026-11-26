import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import Cookies from "cookies";
import dotenv from "dotenv";
import { buildSchema } from "type-graphql";
import { dataSource } from "./database/config/datasource";
import { AuthResolver } from "./graphql/resolvers/user/auth-resolver";
import { customAuthChecker } from "./middlewares/auth-checker";
import { formatError } from "./middlewares/format-error";
import { QUERY_LIMITS, queryLimitsRule } from "./middlewares/query-limits";
import { createAdmin } from "./scripts/create-admin";
import { seedTitles } from "./scripts/seed-titles";
import { CategoryResolver } from "./graphql/resolvers/category/category-resolver";
import { BooksResolver } from "./graphql/resolvers/book/book-resolver";
import { AuthorsResolver } from "./graphql/resolvers/author/author-resolver";
import { UserActionsResolver } from "./graphql/resolvers/user/user-actions-resolver";
import { UserBooksResolver } from "./graphql/resolvers/user/user-books-resolver";
import { BookReviewsResolver } from "./graphql/resolvers/book/book-review-resolver";
import { BookReviewVotesResolver } from "./graphql/resolvers/book/book-review-vote-resolver";
import { BookReviewCommentsResolver } from "./graphql/resolvers/book/book-review-comment-resolver";
import { BookRecommendationsResolver } from "./graphql/resolvers/book/book-recommendation-resolver";
import { ProfileResolver } from "./graphql/resolvers/user/profile-resolver";
import { FollowResolver } from "./graphql/resolvers/user/follow-resolver";
import { FeedResolver } from "./graphql/resolvers/user/feed-resolver";
import { ReadingGoalResolver } from "./graphql/resolvers/gamification/reading-goal-resolver";
import { LeaderboardResolver } from "./graphql/resolvers/gamification/leaderboard-resolver";
import { TitleResolver } from "./graphql/resolvers/gamification/title-resolver";
import { BookSearchResolver } from "./graphql/resolvers/book/book-search-resolver";
import { AdminResolver } from "./graphql/resolvers/admin/admin-resolver";
import { SiteBannersResolver } from "./graphql/resolvers/banner/site-banner-resolver";
import { StatsResolver } from "./graphql/resolvers/stats/stats-resolver";
import { PrivacyResolver } from "./graphql/resolvers/user/privacy-resolver";
import { createLoaders } from "./graphql/dataloaders";
import { createUserResolver } from "./utils/current-user";
import { Context } from "./types/types";
import { getClientIp } from "./utils/client-ip";

dotenv.config(); // Load environment variables from .env file

// Variables indispensables : échouer au démarrage plutôt qu'au premier
// login (JWT_SECRET n'était vérifié qu'à la signature du jeton).
for (const name of ["COOKIE_SECRET", "JWT_SECRET", "APP_PORT"]) {
    if (!process.env[name]) {
        throw new Error(`${name} is not defined in environment variables.`);
    }
}

(async () => {
    try {
        // Initialize the data source (e.g., connect to a database)
        await dataSource.initialize();

        // Safety net: the unaccent extension is created by the initial
        // migration, but keep this in case the database predates migrations.
        // Required by all search queries (book, author, user library).
        await dataSource.query("CREATE EXTENSION IF NOT EXISTS unaccent");

        // Create Admin user if doesn't exist
        await createAdmin();

        // Seed titles
        await seedTitles();

        // Constructing the GraphQL schema with TypeGraphQL
        // Replace the resolvers array with your actual resolvers
        const schema = await buildSchema({
            resolvers: [
                AuthResolver,
                CategoryResolver,
                BooksResolver,
                AuthorsResolver,
                UserActionsResolver,
                UserBooksResolver,
                BookReviewsResolver,
                BookReviewVotesResolver,
                BookReviewCommentsResolver,
                BookRecommendationsResolver,
                ProfileResolver,
                FollowResolver,
                FeedResolver,
                TitleResolver,
                LeaderboardResolver,
                ReadingGoalResolver,
                BookSearchResolver,
                AdminResolver,
                SiteBannersResolver,
                StatsResolver,
                PrivacyResolver,
            ],
            validate: true, // Activate validation for input fields
            authChecker: customAuthChecker,
            // Écrit schema.graphql sur disque : utile en dev, désactivé en prod
            // (conteneur non-root en lecture seule sur /app).
            emitSchemaFile: process.env.NODE_ENV !== "production",
        });

        const server = new ApolloServer<Context>({
            schema,
            formatError,
            // Profondeur et largeur bornées : refus avant tout resolver.
            validationRules: [queryLimitsRule(QUERY_LIMITS)],
        });

        // Start the server
        const { url } = await startStandaloneServer(server, {
            listen: { port: Number(process.env.APP_PORT) || 4000 },
            context: async ({ req, res }) => {
                // En prod, le TLS est terminé par le reverse proxy et le back
                // reçoit du HTTP interne. Sans cette option, la lib `cookies`
                // croit être sur une connexion non chiffrée et lève une
                // exception plutôt que de poser un cookie `secure` (échec 500
                // silencieux du login). On lui indique explicitement l'état
                // sécurisé, aligné sur la condition de `setAuthCookie`.
                const cookies = new Cookies(req, res, {
                    keys: [process.env.COOKIE_SECRET as string],
                    secure: process.env.NODE_ENV === "production",
                });

                const ip = getClientIp(req);

                // Résolution paresseuse + mémoïsée de l'utilisateur, partagée
                // par l'authChecker, les resolvers et les DataLoaders.
                const getUser = createUserResolver(cookies);

                return {
                    cookies,
                    ip,
                    getUser,
                    loaders: createLoaders(getUser),
                };
            },
        });

        console.log(
            `🚀  Server ready at: ${url} \n 🚀 Backend : http://localhost:5173/api \n 🚀 Frontend : http://localhost:5173`,
        );
    } catch (error) {
        console.error("🚨 Error during initialization:", error);
        process.exit(1);
    }
})();
