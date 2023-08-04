export interface TokenResponseToken {
    token: string
}

export interface TokenResponseFido {
    options: TokenResponseFidoOptions
    id: number
}

interface TokenResponseFidoOptions {
    challenge: string
    timeout: number
    rpId: string
    allowCredentials: TokenResponseFidoOptionsCredentials[]
    userVerification: "discouraged" | "preferred" | "required"
    extensions: Record<string, boolean>
    status: string
    errorMessage: string
}

export interface TokenResponseFidoOptionsCredentials {
    type: "public-key"
    id: string
}

export type LoginType = "password" | "fido";

export interface User {
    id: string
    username: string
    email: string
    emailVerified: boolean
    superuser: boolean
    languagePermissions: UserLanguagePermissions[] 
}

interface UserLanguagePermissions {
    
}

export type PasswordResetType = "email";

export type PasswordResetChallenge = PasswordResetChallengeEmail;

interface PasswordResetChallengeEmail {
    email: string
}