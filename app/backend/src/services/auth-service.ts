import * as argon2 from "argon2";
import Cookies from "cookies";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { dataSource } from "../database/config/datasource";
import { LogInResponse, User } from "../database/entities/user/user";
import { AppError } from "../middlewares/error-handler";
import { GoogleProfile, Roles, UserRole } from "../types/types";
import { isPasswordCompliant } from "../utils/password-policy";
import { CloudinaryService } from "./cloudinary.service";

export const EMAIL_NOT_VERIFIED_CODE = "EMAIL_NOT_VERIFIED";

export const register = async (
    email: string,
    password: string,
    userName: string,
    role: UserRole,
    // Adresse déjà prouvée (admin créé au démarrage, seed) : pas de lien à
    // confirmer. Une inscription publique passe toujours `false`.
    emailVerified = false,
): Promise<User> => {
    const userRepository = dataSource.getRepository(User);

    // Check if a user already exists with this email
    const existingUser = await userRepository.findOne({ where: { email } });

    if (existingUser) {
        // Throw an error if the email is already in use
        throw new AppError(
            "Email already exists",
            400,
            "EmailAlreadyUsedError",
        );
    }

    // Hash the password before saving it
    const hashedPassword = await argon2.hash(password);

    // Create a new instance of user and save it in the database
    try {
        const user = User.create({
            email,
            hashedPassword,
            userName,
            role,
            level: 1,
            xp: 0,
            emailVerifiedAt: emailVerified ? new Date() : null,
        });

        await user.save();

        return user;
    } catch (error) {
        throw new AppError(
            "Failed to create user",
            500,
            "DatabaseError",
            error instanceof Error ? error.message : undefined,
        );
    }
};

// Durée d'une session « Se souvenir de moi » (connexion Google comprise).
// Sans elle : cookie de session, effacé à la fermeture du navigateur, et jeton
// d'un jour. Un jeton long reste révocable via `tokenVersion`.
export const REMEMBERED_SESSION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// Signe un JWT identifiant l'utilisateur, sa version de session et sa durée
// (`r` : session mémorisée), et le pose en cookie httpOnly signé.
const setAuthCookie = (
    user: User,
    cookies: Cookies,
    remember: boolean,
): void => {
    if (!process.env.JWT_SECRET) {
        throw new AppError(
            "JWT_SECRET is not defined in environment variables.",
            500,
            "InternalServerError",
        );
    }

    const token = jwt.sign(
        { id: user.id, v: user.tokenVersion ?? 0, r: remember },
        process.env.JWT_SECRET,
        { expiresIn: remember ? `${REMEMBERED_SESSION_DAYS}d` : "1d" },
    );

    cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        signed: true,
        // Sans maxAge, cookie de session : le navigateur l'efface à sa fermeture.
        ...(remember && { maxAge: REMEMBERED_SESSION_DAYS * DAY_MS }),
    });
};

// La session en cours est-elle mémorisée ? Sert à réémettre un cookie de même
// durée (changement de mot de passe).
const isRememberedSession = (cookies: Cookies): boolean => {
    const token = cookies.get("token", { signed: true });
    if (!token || !process.env.JWT_SECRET) return false;
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET) as {
            r?: boolean;
        };
        return payload.r === true;
    } catch {
        return false;
    }
};

// Génère un userName unique à partir d'une base, en ajoutant un suffixe
// numérique tant que le nom est déjà pris. Vérification best-effort au
// niveau applicatif (non atomique) : il n'existe aucune contrainte
// d'unicité BDD sur User.userName pour servir de filet de sécurité.
const generateUniqueUserName = async (base: string): Promise<string> => {
    const userRepository = dataSource.getRepository(User);
    const cleaned = base.trim().slice(0, 90) || "lecteur";
    let candidate = cleaned;
    let suffix = 1;

    while (await userRepository.findOne({ where: { userName: candidate } })) {
        candidate = `${cleaned}-${suffix}`;
        suffix += 1;
    }

    return candidate;
};

const cloudinaryService = new CloudinaryService();

// Copie la photo de profil Google sur Cloudinary et renseigne `user.avatar`.
// L'URL Google (lh3.googleusercontent.com) n'est jamais stockée : hotlinker le
// CDN de Google renvoie des HTTP 429 et casse l'image côté navigateur.
//
// `user` doit déjà être persisté : le public_id dérive de son UUID. Le même
// public_id que l'upload manuel (`users/<id>/avatar`) est réutilisé, donc un
// avatar téléversé plus tard écrase cet asset au lieu de l'orpheliner.
//
// Ne lève jamais et ne persiste pas : en cas d'échec `avatar` reste inchangé
// (le profil affiche alors le monogramme d'initiales) et la connexion aboutit.
const syncGoogleAvatar = async (
    user: User,
    pictureUrl?: string | null,
): Promise<void> => {
    if (!pictureUrl) return;

    const url = await cloudinaryService.uploadImage(
        pictureUrl,
        `users/${user.id}/avatar`,
    );

    if (url) user.avatar = url;
};

// Résout l'utilisateur associé à un profil Google vérifié : par googleId,
// sinon liaison par email, sinon création d'un nouveau compte.
export const resolveOrCreateGoogleUser = async (
    profile: GoogleProfile,
): Promise<User> => {
    const userRepository = dataSource.getRepository(User);

    // 1. Compte déjà lié à ce googleId.
    const byGoogleId = await userRepository.findOne({
        where: { googleId: profile.sub },
    });
    if (byGoogleId) return byGoogleId;

    // 2. Compte existant avec le même email : on le lie.
    const byEmail = await userRepository.findOne({
        where: { email: profile.email },
    });
    if (byEmail) {
        // Adresse jamais confirmée : rien ne prouve que le mot de passe a été
        // choisi par le titulaire de l'adresse (compte créé par un tiers avant
        // lui). Google prouve la possession : le mot de passe est effacé et
        // les sessions ouvertes révoquées, le compte revient au titulaire.
        if (!byEmail.emailVerifiedAt) {
            byEmail.hashedPassword = null;
            byEmail.tokenVersion = (byEmail.tokenVersion ?? 0) + 1;
            byEmail.emailVerifiedAt = new Date();
        }
        byEmail.googleId = profile.sub;
        if (!byEmail.avatar) {
            await syncGoogleAvatar(byEmail, profile.picture);
        }
        await byEmail.save();
        return byEmail;
    }

    // 3. Nouveau compte.
    const userName = await generateUniqueUserName(
        profile.name ?? profile.email.split("@")[0],
    );

    const user = User.create({
        email: profile.email,
        googleId: profile.sub,
        userName,
        avatar: null,
        hashedPassword: null,
        role: Roles.User,
        level: 1,
        xp: 0,
        emailVerifiedAt: new Date(),
    });

    await user.save();

    // Le public_id dérive de l'UUID : l'utilisateur doit exister en base avant
    // qu'on puisse nommer son asset Cloudinary.
    await syncGoogleAvatar(user, profile.picture);
    if (user.avatar) await user.save();

    return user;
};

// Échange l'authorization code Google contre les tokens, vérifie l'ID token,
// résout/crée l'utilisateur et pose le cookie de session.
export const googleAuth = async (
    code: string,
    cookies: Cookies,
): Promise<LogInResponse> => {
    const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "postmessage",
    );

    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
        throw new AppError("Invalid Google token", 401, "UnauthorizedError");
    }

    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
        throw new AppError("Invalid Google token", 401, "UnauthorizedError");
    }

    const user = await resolveOrCreateGoogleUser({
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
    });

    setAuthCookie(user, cookies, true);

    return {
        message: "Sign in successful!",
        cookieSet: true,
    };
};

// Function to log in an existing user
export const login = async (
    email: string,
    password: string,
    cookies: Cookies,
    remember = false,
): Promise<LogInResponse> => {
    const userRepository = dataSource.getRepository(User);

    // Find the user by email
    const user = await userRepository.findOne({ where: { email } });

    // Check if the user exists and if the password is correct
    if (!user) {
        throw new AppError("Invalid identifiers", 401, "UnauthorizedError");
    }

    // Les comptes Google purs n'ont pas de mot de passe local : un login
    // par mot de passe doit échouer proprement sans crasher argon2.verify.
    if (!user.hashedPassword) {
        throw new AppError("Invalid identifiers", 401, "UnauthorizedError");
    }

    try {
        // Check if the password is correct
        const isPasswordValid = await argon2.verify(
            user.hashedPassword,
            password,
        );

        if (!isPasswordValid) {
            throw new AppError("Invalid identifiers", 401, "UnauthorizedError");
        }

        // Vérifié après le mot de passe : sans lui, personne n'apprend qu'un
        // compte existe et attend sa vérification.
        if (!user.emailVerifiedAt) {
            throw new AppError("Email not verified", 403).withCode(
                EMAIL_NOT_VERIFIED_CODE,
            );
        }

        setAuthCookie(user, cookies, remember);

        // Return a success message
        return {
            message: "Sign in successful!",
            cookieSet: true,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            "Failed to log in the user.",
            500,
            "InternalServerError",
            error instanceof Error ? error.message : undefined,
        );
    }
};

// Function to retrieve the currently logged-in user
export const whoami = async (cookies: Cookies): Promise<User | null> => {
    const token = cookies.get("token", { signed: true });

    if (!token) {
        throw new AppError("No token provided", 401, "UnauthorizedError");
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            v?: number;
        };

        // Find the user by id
        const userRepository = dataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: payload.id },
        });

        // Compte supprimé, ou session révoquée (version du jeton dépassée,
        // ex. après un changement de mot de passe) : pas d'utilisateur.
        // Un jeton sans version (émis avant leur introduction) vaut 0.
        if (!user || (payload.v ?? 0) !== (user.tokenVersion ?? 0)) {
            return null;
        }

        return user;
    } catch {
        throw new AppError("Invalid token", 401, "UnauthorizedError");
    }
};

export const updateProfile = async (
    userId: string,
    data: { userName?: string; bio?: string; isLibraryPublic?: boolean },
): Promise<User> => {
    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
        throw new AppError("User not found", 404, "NotFoundError");
    }

    if (data.userName && data.userName !== user.userName) {
        const existing = await userRepository.findOne({
            where: { userName: data.userName },
        });
        if (existing) {
            throw new AppError(
                "Ce nom d'utilisateur est déjà pris",
                409,
                "ConflictError",
            );
        }
    }

    Object.assign(user, data);
    await user.save();
    return user;
};

/**
 * Change le mot de passe et révoque toutes les sessions ouvertes (version de
 * session incrémentée), sauf celle en cours, dont le cookie est réémis.
 */
export const changePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string,
    cookies: Cookies,
): Promise<boolean> => {
    // Même politique qu'à l'inscription : sans ce contrôle, le changement
    // de mot de passe permettait de choisir un mot de passe faible.
    if (!isPasswordCompliant(newPassword)) {
        throw new AppError(
            "Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un symbole.",
            400,
            "ValidationError",
        );
    }

    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
        throw new AppError("User not found", 404, "NotFoundError");
    }

    // Check if the user has a hashed password
    if (!user.hashedPassword) {
        throw new AppError(
            "L'utilisateur n'a pas de mot de passe défini",
            400,
            "BadRequestError",
        );
    }

    const isValid = await argon2.verify(user.hashedPassword, currentPassword);

    if (!isValid) {
        throw new AppError(
            "Mot de passe actuel incorrect",
            401,
            "UnauthorizedError",
        );
    }

    user.hashedPassword = await argon2.hash(newPassword);
    const remember = isRememberedSession(cookies);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();
    setAuthCookie(user, cookies, remember);
    return true;
};

const isValidHttpsUrl = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:";
    } catch {
        return false;
    }
};

/** Image de profil stockée sur `User` (URL Cloudinary). */
export type ProfileImage = "avatar" | "banner";

/**
 * Enregistre (URL https) ou retire (`null`) l'avatar ou la bannière.
 * L'upload et la suppression côté Cloudinary sont faits par l'appelant.
 */
export const setProfileImage = async (
    userId: string,
    kind: ProfileImage,
    url: string | null,
): Promise<User> => {
    if (url !== null && !isValidHttpsUrl(url)) {
        throw new AppError("Invalid URL", 400, "ValidationError");
    }

    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) throw new AppError("User not found", 404, "NotFoundError");

    user[kind] = url;
    await user.save();
    return user;
};
