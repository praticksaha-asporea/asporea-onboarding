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


export interface leadDocumentUpdateResponse {
    success: boolean,
    message: string,
    data: {
        contact: {
            phone: number,
            whatsapp: number,
            email: string
        },
        preferences: {
            branchId: string,
            consultantId: string,
            visitType: 'online' | 'offline'
        },
        source: {
            type: string
        },
        experience: {
            submittedOn: string,
            type: string,
            status: 'verified' | 'selected' | 'request_technical'
        },
        documents: {
            position: string,
            status: string,
            submittedOn: string,
        },
        createdBy: {
            id: string,
            type: string
        },
        _id: string,
        fullName: string,
        address: string,
        status: string,
        inqNo: string,
        inqFy: string,
        createdAt: string,
        updatedAt: string,
        __v: number
    },
    error: string | null
}