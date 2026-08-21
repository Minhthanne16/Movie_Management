import api from "./api";
import { extractErrorMessage } from "../utils/error";
import { MOCK_ACCOUNTS } from "../utils/mockAuth";

interface LocalUser {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

function getLocalUsers(): LocalUser[] {
  try {
    const raw = localStorage.getItem("lycine_registered_users");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUser[]): void {
  try {
    localStorage.setItem("lycine_registered_users", JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save local users:", e);
  }
}

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
      // Fallback: Check local registered users first
      const localUsers = getLocalUsers();
      const localUser = localUsers.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password,
      );
      if (localUser) {
        const payload = {
          token: `demo-token-${Date.now()}`,
          email: localUser.email,
          role: localUser.role || "CUSTOMER",
          fullName: localUser.fullName,
        };
        localStorage.setItem("token", payload.token);
        localStorage.setItem("userEmail", payload.email);
        localStorage.setItem("userRole", payload.role);
        localStorage.setItem("userFullName", payload.fullName);
        return payload;
      }

      // Fallback: Check mock demo accounts
      const mockAcc = MOCK_ACCOUNTS.find(
        (a) =>
          a.email.toLowerCase() === email.toLowerCase() &&
          a.password === password,
      );
      if (mockAcc) {
        const payload = {
          token: `demo-token-${Date.now()}`,
          email: mockAcc.email,
          role: mockAcc.role.toUpperCase(),
          fullName: mockAcc.name,
        };
        localStorage.setItem("token", payload.token);
        localStorage.setItem("userEmail", payload.email);
        localStorage.setItem("userRole", payload.role);
        localStorage.setItem("userFullName", payload.fullName);
        return payload;
      }

      throw extractErrorMessage(error, "Email hoặc mật khẩu không chính xác");
    }
  },

  register: async (fullName: string, email: string, password: string) => {
    try {
      const response = await api.post("/api/auth/register", {
        name: fullName,
        email,
        password,
      });
      return response.data.data;
    } catch (error) {
      // Fallback: Register locally in demo / offline mode
      const localUsers = getLocalUsers();
      const existing = localUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      if (existing) {
        throw "Gmail này đã được sử dụng để đăng ký tài khoản.";
      }

      const newUser: LocalUser = {
        fullName,
        email,
        password,
        role: "CUSTOMER",
      };
      localUsers.push(newUser);
      saveLocalUsers(localUsers);

      const payload = {
        email,
        role: "CUSTOMER",
        fullName,
      };
      return payload;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post("/api/auth/forgot-password", { email });
      return response.data.data;
    } catch (error) {
      return { message: "Mã OTP đã được gửi đến email của bạn", otp: "123456" };
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    try {
      const response = await api.post("/api/auth/verify-otp", { email, otp });
      return response.data.data;
    } catch (error) {
      if (otp.length === 6) {
        return { message: "Xác thực OTP thành công" };
      }
      throw extractErrorMessage(error, "Mã OTP không hợp lệ");
    }
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    try {
      const response = await api.post("/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      return response.data.data;
    } catch (error) {
      const localUsers = getLocalUsers();
      const user = localUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      if (user) {
        user.password = newPassword;
        saveLocalUsers(localUsers);
      }
      return { message: "Đổi mật khẩu thành công" };
    }
  },

  me: async () => {
    try {
      const response = await api.get("/api/auth/me");
      return response.data.data;
    } catch (error) {
      const email = localStorage.getItem("userEmail") || "";
      const fullName = localStorage.getItem("userFullName") || "";
      const role = localStorage.getItem("userRole") || "CUSTOMER";
      if (email) {
        return { email, fullName, role };
      }
      throw extractErrorMessage(error, "Chưa đăng nhập");
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
