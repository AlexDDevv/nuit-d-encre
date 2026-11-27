import { gql } from "@apollo/client";

export const REGISTER = gql`
    mutation Register($data: CreateUserInput!) {
        register(data: $data) {
            id
            email
        }
    }
`;

export const LOGIN = gql`
    mutation Login($data: LogUserInput!) {
        login(data: $data) {
            message
            cookieSet
        }
    }
`;

export const GOOGLE_AUTH = gql`
    mutation GoogleAuth($code: String!) {
        googleAuth(code: $code) {
            message
            cookieSet
        }
    }
`;

export const WHOAMI = gql`
    query Whoami {
        whoami {
            id
            email
            userName
            role
            level
            xp
            avatar
            banner
            bio
            isLibraryPublic
            createdAt
            title {
                id
                label
                iconKey
            }
        }
    }
`;

export const LOGOUT = gql`
    mutation Mutation {
        logout
    }
`;

export const RESEND_VERIFICATION_EMAIL = gql`
    mutation ResendVerificationEmail($data: EmailRequestInput!) {
        resendVerificationEmail(data: $data)
    }
`;

export const VERIFY_EMAIL = gql`
    mutation VerifyEmail($data: EmailTokenInput!) {
        verifyEmail(data: $data)
    }
`;

export const REQUEST_PASSWORD_RESET = gql`
    mutation RequestPasswordReset($data: EmailRequestInput!) {
        requestPasswordReset(data: $data)
    }
`;

export const RESET_PASSWORD = gql`
    mutation ResetPassword($data: ResetPasswordInput!) {
        resetPassword(data: $data)
    }
`;
