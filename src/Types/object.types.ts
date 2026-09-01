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
    subTitle: string,
    supportedExtensions: string[],
    required: boolean,
    multiple: boolean
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

export interface positionById {
    positionId: string
}


export interface userById {
    userId: string
}

export interface tacData {
    _id: string,
    firstName: string,
    lastName: string,
    role: string,
    counterNo: number
}

export interface externalSourceObj {
    _id: string,
    firstName: string,
    lastName: string,
    email: string
}


export interface QuestionType {
    _id: string,
    title: string,
    shortName: string,
    marks: number,
    section: string,
    subSection: string,
    isDeleted: boolean,
    type: boolean,
    levels: string[],
    order: number,
    createdAt: string,
    updatedAt: string,
    __v: number
}

export type ExpType = "fresher" | "domestic" | "abroad" | "free";
export type ExpStatus = "selected" | "verified" | "request_technical";

export interface CandidateRow {
    profilePic(profilePic: (profilePic: any) => string | undefined): string | undefined;
    profilePic(profilePic: any): string | undefined;
    _id: string;
    name: string;
    inqNo: string;
    stage: string;
    status: string;
    experience: string | null;
    visitType: string | null;
    token: string | null;
    createdAt: string | null;
    lastActivity: string;
    branchId?: string | null
    contact: { phone?: string; email?: string; whatsapp?: string };
    assignedTacName?: string;
}

export interface AssessBasicFormValues {
    status?: string;
}

export interface AssessmentFormValues {
    passportNo: string;
    note1: string;
    note2: string;
    note3: string;
    note4: string;
    candidateSign: File | string | null;
    assessorSign: File | string | null;
}

export interface preTACData {
    _id: string,
    firstName: string,
    lastName: string,
    fullName: string,
    email: string,
    phoneNumber: number,
    whatsappNumber: number,
    address: string,
    bio: string,
    experienceInMonths: number,
    profilePic: string,
    tacProfile: {
        designation: string,
        areasOfExp: string[],
        languagesKnown: string[],
        industryExp: string[],
        specialization: string[],
        mode: string,
        rating: number
    },
    branches: [
        {
            _id: string,
            title: string,
            location: string,
            timeZone: string,
            status: boolean
        }
    ],
    currentShift: {
        shift: {
            _id: string
        },
        minuteOfSlots: number,
        effectiveFrom: string
    }
}

export interface lastAssignmentData {

    _id: string,
    leadId: string,
    phase: string,
    assignedTo: {
        _id: string,
        firstName: string,
        lastName: string,
        email: string,
        profilePic: string,
    },
    attended: string,
    createdAt: string,
    schedule: string,
    date: string,
    from: string,
    to: string,
    method: string,
    status: string,
    token: {
        generated: boolean,
        number: string,
    },
    transfer: {
        requested: boolean,
    },
    updatedAt: string,
    pre: string,
    additionalDetails: string,
    specificNotes: string,
    advice: string
}