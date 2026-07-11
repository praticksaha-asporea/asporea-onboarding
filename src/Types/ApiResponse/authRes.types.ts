import { NotificationPreference } from "../Frontend_Payload/auth.types"

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

export interface profileUpdateResponse {
    success: boolean,
    message: string,
    data: {
        notificationPreference: NotificationPreference,
        _id: string,
        firstName: string,
        lastName: string,
        email: string,
        phoneNumber: number,
        whatsappNumber: number,
        address: string,
        role: string,
        passportStatus: string,
        passportNo: string,
        status: string,
        createdAt: string,
        updatedAt: string,
        __v: number,
        enquired: string,
        experienceInMonths: number,
        bio: string,
        profilePic: {
            _id: string,
            path: string
        }
    },
    error: null
}