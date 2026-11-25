/**
 * @packageDocumentation
 * @category Resolvers
 * @description
 * Resolvers réservés au panel d'administration : compteurs globaux, activité
 * récente du dashboard, listes complètes (livres, auteurs, critiques) et
 * suppression de compte.
 * Toutes les opérations sont protégées par `@Authorized(Roles.Admin)`.
 */

import {
    Arg,
    Authorized,
    Ctx,
    ID,
    Mutation,
    Query,
    Resolver,
} from "type-graphql";
import { User } from "../../../database/entities/user/user";
import { Book } from "../../../database/entities/book/book";
import { Author } from "../../../database/entities/author/author";
import { Category } from "../../../database/entities/category/category";
import { BookReview } from "../../../database/entities/book/bookReview";
import { UserActions } from "../../../database/entities/user/user-actions";
import { AdminStats } from "../../../database/filteredResults/admin/admin-stats";
import { AdminRecentActivity } from "../../../database/filteredResults/admin/admin-recent-activity";
import { AppError } from "../../../middlewares/error-handler";
import { CloudinaryService } from "../../../services/cloudinary.service";
import { eraseUserAccount } from "../../../services/rgpd/erasure-service";
import { Context, Roles } from "../../../types/types";
import { requireUser } from "../../../utils/current-user";

@Resolver()
export class AdminResolver {
    private cloudinaryService = new CloudinaryService();

    /**
     * Compteurs globaux de la plateforme (barre d'analytics).
     */
    @Authorized(Roles.Admin)
    @Query(() => AdminStats)
    async adminStats(): Promise<AdminStats> {
        const [users, books, authors, reviews, categories] = await Promise.all([
            User.count(),
            Book.count(),
            Author.count(),
            BookReview.count(),
            Category.count(),
        ]);

        return { users, books, authors, reviews, categories };
    }

    /**
     * Activité récente alimentant le dashboard : derniers inscrits, derniers
     * livres, dernières critiques et journal des 10 dernières actions XP.
     */
    @Authorized(Roles.Admin)
    @Query(() => AdminRecentActivity)
    async adminRecentActivity(): Promise<AdminRecentActivity> {
        const [recentUsers, recentBooks, recentReviews, actions] =
            await Promise.all([
                User.find({ order: { createdAt: "DESC" }, take: 5 }),
                Book.find({
                    order: { createdAt: "DESC" },
                    take: 5,
                    relations: { author: true, category: true, user: true },
                }),
                BookReview.find({
                    order: { createdAt: "DESC" },
                    take: 5,
                    relations: { user: true, book: { author: true } },
                }),
                UserActions.find({
                    order: { createdAt: "DESC" },
                    take: 10,
                    relations: { user: true },
                }),
            ]);

        const recentActions = actions.map((action) => ({
            id: action.id,
            type: action.type,
            xp: action.xp,
            metadata: action.metadata ?? null,
            targetId: action.targetId ?? null,
            createdAt: action.createdAt,
            userId: action.user?.id ?? "",
            userName: action.user?.userName ?? "Lecteur supprimé",
        }));

        return { recentUsers, recentBooks, recentReviews, recentActions };
    }

    /**
     * Catalogue complet pour l'onglet Livres (recherche et pagination côté
     * client). Query dédiée : la query publique `books` est plafonnée.
     */
    @Authorized(Roles.Admin)
    @Query(() => [Book])
    async adminBooks(): Promise<Book[]> {
        return Book.find({
            order: { createdAt: "DESC" },
            relations: { author: true, category: true, user: true },
        });
    }

    /**
     * Liste complète des auteurs pour l'onglet Auteurs (même raison que
     * `adminBooks`). `books` est résolu par le FieldResolver d'Author.
     */
    @Authorized(Roles.Admin)
    @Query(() => [Author])
    async adminAuthors(): Promise<Author[]> {
        return Author.find({
            order: { createdAt: "DESC" },
            relations: { user: true },
        });
    }

    /**
     * Liste complète des critiques (tri antéchronologique) pour l'onglet
     * Critiques. La recherche et la pagination sont gérées côté client.
     */
    @Authorized(Roles.Admin)
    @Query(() => [BookReview])
    async adminReviews(): Promise<BookReview[]> {
        return BookReview.find({
            order: { createdAt: "DESC" },
            relations: { user: true, book: { author: true } },
        });
    }

    /**
     * Suppression d'un compte utilisateur.
     *
     * @description
     * Applique le même effacement conforme au RGPD que le self-service
     * (`eraseUserAccount`), dans une transaction : suppression des données
     * strictement personnelles (votes, journal XP), anonymisation des
     * contributions publiques (critiques, recommandations, commentaires) et
     * détachement du catalogue (livres, auteurs, catégories) — le contenu
     * partagé est préservé, l'identité détachée. Les images Cloudinary sont
     * ensuite nettoyées en best-effort.
     */
    @Authorized(Roles.Admin)
    @Mutation(() => Boolean)
    async deleteUser(
        @Arg("id", () => ID) id: string,
        @Ctx() context: Context,
    ): Promise<boolean> {
        const currentUser = await requireUser(context);

        if (currentUser.id === id) {
            throw new AppError(
                "Vous ne pouvez pas supprimer votre propre compte.",
                400,
                "BadRequestError",
            );
        }

        const user = await User.findOne({ where: { id } });

        if (!user) {
            throw new AppError("User not found", 404, "NotFoundError");
        }

        // Efface les données en base (transaction : anonymisation + détachement).
        await eraseUserAccount(id);

        // Best-effort : supprime les images Cloudinary après l'effacement BDD.
        // Un échec ici ne doit pas annuler la suppression déjà committée.
        try {
            await this.cloudinaryService.deleteImage(`users/${id}/avatar`);
            await this.cloudinaryService.deleteImage(`users/${id}/banner`);
        } catch (error) {
            console.error("Cloudinary cleanup failed for erased user:", error);
        }

        return true;
    }
}
