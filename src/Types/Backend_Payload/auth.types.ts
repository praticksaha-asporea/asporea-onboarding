export interface RegisterPayload {
    firstName:string,
    lastName:string,
    email:string,
    password:string
}

export interface LoginPayload {
    email:string;
    password:string
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  password: string;
  confirmPassword: string;
  code: number;
}

export interface changePasswordPayload {
  userId: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
