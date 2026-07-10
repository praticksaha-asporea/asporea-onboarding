export interface CounterData {
    id: string;
    number: number;
    currentToken: string | null;
    upcomingTokens: string[];
    isActive: boolean;
}

export interface Counter {
    counterNo: number,
    employeeId: string,
    employee: string,
    role: string,
    currentToken?: string | null,
    leadId?: string | null,
    upcomingTokens?: string[]
}

export interface branchDB {
    _id: string,
    title: string,
    location: string,
    timeZone: string,
    distanceKm: number
}