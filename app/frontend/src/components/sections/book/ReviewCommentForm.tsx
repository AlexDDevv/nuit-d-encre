import { useRef } from "react";
import { useForm } from "react-hook-form";
import { LuFeather } from "react-icons/lu";
import Button from "@/components/UI/Button/Button";
import TextareaField from "@/components/sections/shared/fields/TextareaField";
import SpoilerButton from "@/components/sections/shared/spoiler/SpoilerButton";
import { useToast } from "@/hooks/toast/useToast";
import { useBookReviewCommentMutations } from "@/hooks/book/reviewComment/useBookReviewCommentMutations";
import { parseGraphQLError } from "@/utils/graphql-error";
import { ReviewCommentFormProps } from "@/types/types";

type ReviewCommentFormData = {
    content: string;
};

const MAX_LENGTH = 500;

export default function ReviewCommentForm({
    reviewId,
    onSuccess,
}: ReviewCommentFormProps) {
    const { showToast } = useToast();
    const { createComment, isCreatingComment } =
        useBookReviewCommentMutations();
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<ReviewCommentFormData>({ defaultValues: { content: "" } });
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const contentLength = watch("content").length;

    const onSubmit = async (formData: ReviewCommentFormData) => {
        try {
            await createComment(reviewId, formData.content.trim());
            reset();
            onSuccess?.();
        } catch (error) {
            const { title, description } = parseGraphQLError(
                error,
                "createBookReviewComment",
            );
            showToast({ type: "error", title, description });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <TextareaField
                name="content"
                label="Votre commentaire"
                register={register}
                errors={errors}
                rules={{
                    required: "Le commentaire ne peut pas être vide",
                    maxLength: {
                        value: MAX_LENGTH,
                        message: `Le commentaire ne peut pas dépasser ${MAX_LENGTH} caractères`,
                    },
                }}
                placeholder="Ajouter un commentaire…"
                rows={3}
                max={MAX_LENGTH}
                length={contentLength}
                textareaRef={textareaRef}
            />
            <div className="flex items-center justify-between gap-3">
                <SpoilerButton textareaRef={textareaRef} />
                <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={isCreatingComment}
                    disabled={isCreatingComment}
                    ariaLabel="Publier le commentaire"
                    leftIcon={<LuFeather />}
                >
                    Publier
                </Button>
            </div>
        </form>
    );
}
