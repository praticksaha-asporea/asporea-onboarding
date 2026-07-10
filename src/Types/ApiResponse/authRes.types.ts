export interface loginResponse {
    success: boolean,
    message: string,
    data: {
        user: {
            id: string,
            email: string,
            phoneNumber: number,
            whatsappNumber: number,
            firstName: string,
            lastName: string,
            address: string,
            role: string,
            experienceInMonths: null | number,
        },
        tokens: {
            accessToken: string,
            refreshToken: string
        }
    },
    error: null
}

export interface sendOtpResponse {
    success: boolean,
    message: string,
    data: {
        channel: string,
        sentTo: string,
        expiresAt: string,
        isRegistered: boolean
    },
    error: null
}


export interface verifyOtpResponse {
    success: boolean,
    message: string,
    data: {
        isRegistered: true,
        user: {
            id: string,
            email: string,
            phoneNumber: number,
            whatsappNumber: number,
            role: string,
            hasPassword: true
        },
        tokens: {
            accessToken: string,
            refreshToken: string
        },
        channel: string,
        verifiedIdentity: string
    },
    error: null
}


export interface ChangePasswordResponse {
    success: boolean,
    message: string,
    data: {
        id: string,
        firstName: string,
        lastname: string,
        email: string,
        updatedAt: string
    },
    error: null
}