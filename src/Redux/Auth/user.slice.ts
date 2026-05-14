import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserData {
  id: string;
  email: string;
  role?: string;
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
    clearUserData: (state) => {
      state.userData = null;
    },
  },
});

export const { setUserData, clearUserData } = userSlice.actions;

export default userSlice.reducer;
