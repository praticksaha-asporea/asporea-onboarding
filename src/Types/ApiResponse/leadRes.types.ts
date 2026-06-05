export interface inquiryResponse {

    success: boolean,
    message: string,
    data: {
        fullName: string,
        contact: {
            phone: string,
            whatsapp: string,
            email: string,
        },
        address: string,
        preferences: {
            branchId: string,
            consultantId: string,
            visitType: string
        },
        source: {
            type: string
        },
        status: string,
        inqNo: string,
        inqFy: string,
        documents: {
            status: string
        },
        createdBy: {
            id: string,
            type: string
        },
        _id: string,
        createdAt: string,
        updatedAt: string,
        __v: number
    },
    error: string | null
}
