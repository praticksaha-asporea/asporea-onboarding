
export interface loginBodyData {
  identity: string;
  password?: string;
}



export interface ChangePasswordData {
  userId: string,
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
};

export interface SendOtpData {
  identity: string;
}

export interface VerifyOtpData {
  identity: string;
  otp: string;
}