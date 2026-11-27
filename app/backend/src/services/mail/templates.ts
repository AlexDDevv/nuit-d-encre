import { MailMessage } from "./mail-service";

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

/** Mise en page commune : sobre, lisible sans images ni styles distants. */
function layout(
    title: string,
    paragraphs: string[],
    cta: { label: string; href: string },
    footer: string,
): string {
    const body = paragraphs
        .map((p) => `<p style="margin:0 0 16px;line-height:1.6">${p}</p>`)
        .join("");
    return `<!doctype html>
<html lang="fr">
<body style="margin:0;padding:24px;background:#14121a;font-family:Georgia,serif;color:#e8e2d4">
<div style="max-width:520px;margin:0 auto;background:#1d1a24;border:1px solid #3a3444;border-radius:12px;padding:32px">
<h1 style="margin:0 0 8px;font-size:24px;color:#e9d7a8">Nuit d'Encre</h1>
<h2 style="margin:0 0 24px;font-size:18px;font-weight:normal;color:#e8e2d4">${title}</h2>
${body}
<p style="margin:24px 0"><a href="${cta.href}" style="display:inline-block;background:#e9d7a8;color:#14121a;text-decoration:none;padding:12px 20px;border-radius:8px;font-family:Arial,sans-serif;font-weight:bold">${cta.label}</a></p>
<p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:#a49d90">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br><span style="word-break:break-all">${cta.href}</span></p>
<p style="margin:0;font-size:13px;line-height:1.5;color:#a49d90">${footer}</p>
</div>
</body>
</html>`;
}

export function verifyEmailMessage(
    to: string,
    userName: string,
    link: string,
    hours: number,
): MailMessage {
    const name = escapeHtml(userName);
    return {
        to,
        subject: "Confirmez votre adresse email",
        html: layout(
            "Confirmez votre adresse email",
            [
                `Bonjour ${name},`,
                `Bienvenue dans la bibliothèque. Pour activer votre compte, confirmez votre adresse email. Le lien est valable ${hours} heures.`,
            ],
            { label: "Confirmer mon adresse", href: escapeHtml(link) },
            "Vous n'avez pas créé de compte sur Nuit d'Encre ? Ignorez ce message, aucun compte ne sera activé.",
        ),
        text: [
            `Bonjour ${userName},`,
            "",
            `Pour activer votre compte Nuit d'Encre, confirmez votre adresse email (lien valable ${hours} heures) :`,
            link,
            "",
            "Vous n'avez pas créé de compte ? Ignorez ce message.",
        ].join("\n"),
    };
}

export function resetPasswordMessage(
    to: string,
    userName: string,
    link: string,
    minutes: number,
): MailMessage {
    const name = escapeHtml(userName);
    return {
        to,
        subject: "Réinitialisez votre mot de passe",
        html: layout(
            "Réinitialisez votre mot de passe",
            [
                `Bonjour ${name},`,
                `Une réinitialisation du mot de passe de votre compte a été demandée. Le lien est valable ${minutes} minutes et ne sert qu'une fois.`,
            ],
            {
                label: "Choisir un nouveau mot de passe",
                href: escapeHtml(link),
            },
            "Vous n'êtes pas à l'origine de cette demande ? Ignorez ce message, votre mot de passe reste inchangé.",
        ),
        text: [
            `Bonjour ${userName},`,
            "",
            `Pour choisir un nouveau mot de passe Nuit d'Encre (lien valable ${minutes} minutes, à usage unique) :`,
            link,
            "",
            "Vous n'êtes pas à l'origine de cette demande ? Ignorez ce message.",
        ].join("\n"),
    };
}
