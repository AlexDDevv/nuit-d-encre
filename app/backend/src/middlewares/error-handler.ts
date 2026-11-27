// Interface for Apperror structure
interface IAppError {
    statusCode: number;
    errorType?: string;
    additionalInfo?: string;
    isOperational?: boolean;
}

// AppError class with proper TypeScript types
export class AppError extends Error implements IAppError {
    statusCode: number;
    errorType?: string;
    additionalInfo?: string;
    isOperational: boolean;
    /** Code GraphQL explicite, à la place de celui déduit du statut. */
    code?: string;

    constructor(
        message: string,
        statusCode: number = 500,
        errorType?: string,
        additionalInfo?: string,
        isOperational: boolean = true,
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);

        this.statusCode = statusCode;
        this.errorType = errorType;
        this.additionalInfo = additionalInfo;
        this.isOperational = isOperational;
        Error.captureStackTrace(this);
    }

    /** Fixe un code GraphQL propre (ex. EMAIL_NOT_VERIFIED) pour le front. */
    withCode(code: string): this {
        this.code = code;
        return this;
    }
}
