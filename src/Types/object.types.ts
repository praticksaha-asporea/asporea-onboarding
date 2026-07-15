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
    currentToken: string | null,
    leadId: string | null,
    upcomingTokens: string[]
}

export interface branchDB {
    _id: string,
    title: string,
    location: string,
    timeZone: string,
    distanceKm: number
}

export interface techDBData {
    _id: string,
    leadId: string,
    assignmentId: string,
    totalScore: number,
    achievedScore: number,
    timeTaken: string,
    questions: number,
    answered: number,
    feedback: string,
    status: string,
    createdAt: string,
    updatedAt: string,
    __v: number
}

export interface documentTypeData {
    _id: string,
    title: string,
    section: string
}

export interface positionDBData {
    _id: string,
    title: string,
    details: string,
    requiredDocuments: documentTypeData[],
    mandatoryDocuments: documentTypeData[],
    createdAt: string,
    updatedAt: string,
    __v: number

}

