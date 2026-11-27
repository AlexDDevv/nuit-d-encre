import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { LuSend } from "react-icons/lu";
import Button from "@/components/UI/Button/Button";
import { RESEND_VERIFICATION_EMAIL } from "@/graphql/user/auth";
import { useToast } from "@/hooks/toast/useToast";
import { hasGraphQLErrorCode, GRAPHQL_ERROR_CODES } from "@/lib/graphqlErrors";
import { ResendVerificationButtonProps } from "@/types/types";

// Même délai que le back (EMAIL_RESEND_COOLDOWN_MS) : un clic plus tôt
// n'enverrait rien.
const COOLDOWN_SECONDS = 60;

/** Renvoie le lien de vérification, puis se désactive le temps du délai. */
export default function ResendVerificationButton({
    email,
}: ResendVerificationButtonProps) {
    const [resend, { loading }] = useMutation(RESEND_VERIFICATION_EMAIL);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const { showToast } = useToast();

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [secondsLeft]);

    const onClick = async () => {
        try {
            await resend({ variables: { data: { email } } });
            setSecondsLeft(COOLDOWN_SECONDS);
            showToast({
                type: "success",
                title: "Lien envoyé",
                description: `Un nouveau lien de confirmation part vers ${email}.`,
            });
        } catch (err) {
            showToast({
                type: "error",
                title: hasGraphQLErrorCode(
                    err,
                    GRAPHQL_ERROR_CODES.tooManyRequests,
                )
                    ? "Trop de demandes"
                    : "Envoi impossible",
                description: "Patientez quelques minutes avant de réessayer.",
            });
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClick}
            loading={loading}
            disabled={loading || secondsLeft > 0}
            ariaLabel="Renvoyer le lien de confirmation"
            leftIcon={<LuSend size={14} />}
        >
            {secondsLeft > 0
                ? `Renvoyer le lien (${secondsLeft} s)`
                : "Renvoyer le lien"}
        </Button>
    );
}
