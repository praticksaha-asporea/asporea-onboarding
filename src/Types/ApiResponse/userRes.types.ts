import { IEmployeeBranchShift } from "@/lib/models/EmployeeBranchShift.model"
import { ISocialLogins } from "@/lib/models/SocialLogins.model"
import { UserData } from "@/Redux/Auth/user.slice"

export interface userDetailsRes {
    success: boolean,
    message: string,
    data: {
        user: UserData,
        socialLogins: ISocialLogins[],
        branchShifts: IEmployeeBranchShift[],
        externalSource: null
    },
    error: null
}