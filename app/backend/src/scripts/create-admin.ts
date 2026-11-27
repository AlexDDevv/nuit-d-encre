import { User } from "../database/entities/user/user";
import { register } from "../services/auth-service";
import { Roles } from "../types/types";

async function createAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const userName = process.env.ADMIN_USERNAME;

    // Verify environment variables
    if (!email) {
        console.error("❌ ADMIN_EMAIL is not defined.");
        return;
    }
    if (!password) {
        console.error("❌ ADMIN_PASSWORD is not defined.");
        return;
    }
    if (!userName) {
        console.error("❌ ADMIN_USERNAME is not defined.");
        return;
    }

    try {
        // Verify if an admin exists in database
        const result = await User.find({
            where: { email },
            select: ["id", "email", "emailVerifiedAt"], // Don't want to get hashedPassword
        });

        const existingAdmin = result[0];

        if (existingAdmin) {
            // Adresse fixée par la configuration : l'admin ne doit jamais
            // être bloqué par la vérification d'email.
            if (!existingAdmin.emailVerifiedAt) {
                await User.update(existingAdmin.id, {
                    emailVerifiedAt: new Date(),
                });
            }
            return;
        }

        // Create an Admin user if doesn't exist in database
        const user = await register(
            email,
            password,
            userName,
            Roles.Admin,
            true,
        );

        console.log(`✅ Admin user created: ${user.email}`);
    } catch (error) {
        console.error("❌ Failed to create admin user:", error);
    }
}

export { createAdmin };
