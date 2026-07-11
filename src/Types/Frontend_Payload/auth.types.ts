
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


export interface NotificationPreference {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
}

export interface profileUpdateData {
  id?: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  phoneNumber?: string,
  whatsappNumber?: string,
  address?: string,
  passportStatus?: string,
  passportNo?: string,
  enquired?: string,
  experienceInMonths?: string,
  bio?: string,
  profilePicData?: string,
  notificationPreference?: NotificationPreference
}