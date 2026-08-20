import api from "./api";
import { extractErrorMessage } from "../utils/error";

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const payload = response.data.data;
      if (payload?.token) {
        localStorage.setItem("token", payload.token);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", payload.role ?? "");
        localStorage.setItem("userFullName", payload.fullName ?? "");
      }
      return payload;
    } catch (error) {
      throw extractErrorMessage(error, "Login failed");
    }
  },

  register: async (fullName: string, email: string, password: string) => {
    try {
      const response = await api.post("/api/auth/register", { name: fullName, email, password });
      return response.data.data;
    } catch (error) {
      throw extractErrorMessage(error, "Registration failed");
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post("/api/auth/forgot-password", { email });
      return response.data.data;
    } catch (error) {
      throw extractErrorMessage(error, "Failed to send OTP");
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    try {
      const response = await api.post("/api/auth/verify-otp", { email, otp });
      return response.data.data;
    } catch (error) {
      throw extractErrorMessage(error, "OTP verification failed");
    }
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    try {
      const response = await api.post("/api/auth/reset-password", { email, otp, newPassword });
      return response.data.data;
    } catch (error) {
      throw extractErrorMessage(error, "Password reset failed");
    }
  },

  me: async () => {
    try {
      const response = await api.get("/api/auth/me");
      return response.data.data;
    } catch (error) {
      throw extractErrorMessage(error, "Failed to fetch user info");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userFullName");
  },

  getCurrentUser: () => localStorage.getItem("userEmail"),
  getCurrentRole: () => localStorage.getItem("userRole"),
};
