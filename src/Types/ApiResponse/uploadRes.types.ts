export interface uploadResponse {
    success: boolean,
    message: string,
    data: {
        uploadId: string,
        path: string
    },
    error: string | null
}