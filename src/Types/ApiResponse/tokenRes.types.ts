

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


export interface tokenCounter {
    counterNo: number;
    employeeId: string;
    employee: string;
    role: string;
}
