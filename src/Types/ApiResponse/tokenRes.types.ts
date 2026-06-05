

export interface tokenResponse {

    success: boolean,
    message: string,
    data: {
        token: string,
        slot: {
            from: string,
            to: string
        },
        role: string
    },
    error: string | null
}
