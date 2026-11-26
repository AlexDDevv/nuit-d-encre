import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type ToastType = "success" | "error" | "warning" | "info";

type ShowToastOptions = {
    type?: ToastType;
    title: string;
    description?: string;
    actionLabel?: string;
    redirectTo?: string;
};

export function useToast() {
    const navigate = useNavigate();

    const showToast = ({
        type = "success",
        title,
        description,
        actionLabel,
        redirectTo,
    }: ShowToastOptions) => {
        const action =
            actionLabel && redirectTo
                ? {
                      label: actionLabel,
                      onClick: () => navigate(redirectTo),
                  }
                : undefined;

        const toastOptions = {
            description,
            action,
            duration: 5000,
        };

        switch (type) {
            case "success":
                toast.success(title, toastOptions);
                break;
            case "error":
                toast.error(title, toastOptions);
                break;
            case "warning":
                toast.warning(title, toastOptions);
                break;
            case "info":
            default:
                toast.info(title, toastOptions);
                break;
        }
    };

    return { showToast };
}
