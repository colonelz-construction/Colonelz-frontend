export type SignInCredential = {
    email: string
    password: string
}

export interface SignInResponse {
    errorMessage:string
    code:number
    data: {
        userID: string;
        token: string;
        role: string;
    };
}

export type SignUpResponse = SignInResponse

export type SignUpCredential = {
    id:string | null
    user_name: string
    email: string
    role: string
    org_id: string | null
}

export type ForgotPassword = {
    email: string
}
export type OtpVerify = {
    email: string | null
    otp: string
}

export type ResetPassword = {
    password: string
    email: string 
    token: string
}
