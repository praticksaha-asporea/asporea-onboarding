import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 1. UserData mein profile ke saare fields optional (?) karke daal diye
export interface UserData {
  id?: string;
  _id?: string;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  phoneNumber?: string | number;
  whatsappNumber?: string | number;
  address?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  language?: string;
  timezone?: string;
  currency?: string;
  passportStatus?: string;
  passportNo?: string;
  experienceInMonths?: string | number;
  bio?: string;
  enquired?: string;     
  status?: string;        
  createdAt?: string;
  updatedAt?: string;
  notificationPreference?: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
  };
}

interface UserState {
  userData: UserData | null;
}

const initialState: UserState = {
  userData: null,
};

export const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<{ userData: UserData }>) => {
      state.userData = action.payload.userData;
    },
   
    updateUserData: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.userData) {
        state.userData = { ...state.userData, ...action.payload };
      }
    },
    clearUserData: (state) => {
      state.userData = null;
    },
  },
});

export const { setUserData, updateUserData, clearUserData } = userSlice.actions;
export default userSlice.reducer;
