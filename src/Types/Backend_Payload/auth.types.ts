export interface RegisterPayload {
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  phoneNumber: string,
  whatsappNumber: string,
  passportStatus: "having" | "not" | "applied",
  passportNo: string,
  address: string
  social: {
    providerId: string,
    scopes: string,
    accessToken: string,
    expiresAt: string,
    type: "google" | "facebook" | "instagram" | "linkedin",
  }
}

export interface LoginPayload {
  email: string;
  password: string
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
