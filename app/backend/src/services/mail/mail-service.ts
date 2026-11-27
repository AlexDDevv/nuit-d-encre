import { AppError } from "../../middlewares/error-handler";

export interface MailMessage {
    to: string;
    subject: string;
    html: string;
    text: string;
}

export interface MailSender {
    send(message: MailMessage): Promise<void>;
}

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const SEND_TIMEOUT_MS = 10_000;

/** Envoi transactionnel par l'API Brevo (clé API côté serveur uniquement). */
export class BrevoMailSender implements MailSender {
    constructor(
        private readonly apiKey: string,
        private readonly from: { email: string; name: string },
    ) {}

    async send(message: MailMessage): Promise<void> {
        const response = await fetch(BREVO_ENDPOINT, {
            method: "POST",
            headers: {
                "api-key": this.apiKey,
                "content-type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify({
                sender: this.from,
                to: [{ email: message.to }],
                subject: message.subject,
                htmlContent: message.html,
                textContent: message.text,
            }),
            signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
        });

        if (!response.ok) {
            throw new AppError(
                "Email sending failed",
                502,
                "MailError",
                `Brevo ${response.status}: ${await response.text()}`,
            );
        }
    }
}

/** Développement sans clé Brevo : le mail (et son lien) s'affiche dans les logs. */
export class ConsoleMailSender implements MailSender {
    async send(message: MailMessage): Promise<void> {
        console.log(
            `📧 [mail non envoyé, BREVO_API_KEY absente] à ${message.to}\n` +
                `   ${message.subject}\n${message.text}`,
        );
    }
}

let sender: MailSender | null = null;

/**
 * Service d'envoi configuré par l'environnement. En production, l'absence de
 * clé est une erreur de configuration : aucun lien ne doit finir dans les logs.
 */
export function getMailSender(): MailSender {
    if (sender) return sender;

    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
        const email = process.env.MAIL_FROM_EMAIL;
        if (!email) {
            throw new AppError("MAIL_FROM_EMAIL is not defined", 500);
        }
        sender = new BrevoMailSender(apiKey, {
            email,
            name: process.env.MAIL_FROM_NAME || "Nuit d'Encre",
        });
    } else if (process.env.NODE_ENV === "production") {
        throw new AppError("BREVO_API_KEY is not defined", 500);
    } else {
        sender = new ConsoleMailSender();
    }
    return sender;
}

/** Remplace le service d'envoi (tests). */
export function setMailSender(next: MailSender | null): void {
    sender = next;
}
