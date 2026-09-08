import { createSlice } from "@reduxjs/toolkit";

let token = null;
try {
  const storedToken = localStorage.getItem("token");
  if (storedToken && storedToken !== "undefined") {
    token = storedToken; 
  }
} catch (error) {
  console.error("Failed to parse token:", error);
}

const initialState = {
  signupData: null,
  loading: false,
  token: token,
  user: JSON.parse(localStorage.getItem("user")) || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setSignupData(state, value) {
      state.signupData = value.payload;
    },
    setLoading(state, value) {
      state.loading = value.payload;
    },
    setToken(state, value) {
      state.token = value.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload
    },
  },
});

export const { setSignupData, setLoading, setToken,setUser } = authSlice.actions;

export default authSlice.reducer;
