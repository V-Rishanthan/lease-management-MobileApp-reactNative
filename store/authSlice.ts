import { createSlice } from "@reduxjs/toolkit";

type AuthState = {
  user: any | null;
  session: any | null;
};

const initialState: AuthState = {
  user: null,
  session: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action) => {
      state.session = action.payload;
      state.user = action.payload?.user || null;
    },
  },
});

export const { setSession } = authSlice.actions;
export default authSlice.reducer;
