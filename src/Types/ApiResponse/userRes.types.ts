import { IUser } from "@/lib/models/User.model"
import { UserData } from "@/Redux/Auth/user.slice"

export interface userDetailsRes {
    success: boolean,
    message: string,
    data: {
        user: UserData,
        socialLogins: [],
        branchShifts: [],
        externalSource: null
    },
    error: null
}