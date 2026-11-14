
import api from "../api/api";

// =============================
// Signup
// =============================

export const signup = async (data) => {
  const response = await api.post("/signup", data);
  return response.data;
};

// =============================
// Login
// =============================

export const login = async (data) => {
  const response = await api.post("/login", data);
  return response.data;
};

// =============================
// Get Current User Profile
// =============================

export const getMyProfile = async () => {
  const response = await api.get("/me");
  return response.data;
};

// =============================
// Update User Settings
// =============================

export const updateMySettings = async (data) => {
  const response = await api.put("/me/settings", data);
  return response.data;
};
