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

const HAS_API_SERVER = Boolean(import.meta.env.VITE_API_URL);

export const authService = {
  login: async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Kiểm tra tài khoản đã đăng ký trên máy (Offline / Local storage)
    const localUsers = getLocalUsers();
    const localUser = localUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail,
    );
    if (localUser) {
      if (localUser.password && localUser.password !== password) {
        throw "Mật khẩu không chính xác.";
      }
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

    // 2. Kiểm tra tài khoản mẫu MOCK_ACCOUNTS
    const mockAcc = MOCK_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === cleanEmail,
    );
    if (mockAcc) {
      if (mockAcc.password && mockAcc.password !== password) {
        throw "Mật khẩu không chính xác.";
      }
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

    // 3. Nếu có Backend API server, gửi request lên server
    if (HAS_API_SERVER) {
      try {
        const response = await api.post("/api/auth/login", { email, password });
        const payload = response.data.data;
        if (payload?.token) {
          localStorage.setItem("token", payload.token);
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userRole", payload.role ?? "CUSTOMER");
          localStorage.setItem("userFullName", payload.fullName ?? "");
        }
        return payload;
      } catch (error) {
        // Fallback: nếu server không phản hồi, cho phép truy cập offline ngay lập tức
      }
    }

    // 4. Fallback tự động: Cho phép người dùng đăng nhập ngay lập tức (0s delay)
    const defaultName = email.split("@")[0] || "User";
    const newUser: LocalUser = {
      fullName: defaultName,
      email: cleanEmail,
      password,
      role: "CUSTOMER",
    };
    localUsers.push(newUser);
    saveLocalUsers(localUsers);

    const payload = {
      token: `demo-token-${Date.now()}`,
      email: cleanEmail,
      role: "CUSTOMER",
      fullName: defaultName,
    };
    localStorage.setItem("token", payload.token);
    localStorage.setItem("userEmail", payload.email);
    localStorage.setItem("userRole", payload.role);
    localStorage.setItem("userFullName", payload.fullName);
    return payload;
  },

  register: async (fullName: string, email: string, password: string) => {
    // 1. Kiểm tra xem email đã tồn tại trong local users hoặc mock accounts chưa
    const localUsers = getLocalUsers();
    const existing =
      localUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
      MOCK_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      throw "Gmail này đã được sử dụng để đăng ký tài khoản.";
    }

    // 2. Nếu có Backend API, đồng bộ lên server
    if (HAS_API_SERVER) {
      try {
        const response = await api.post("/api/auth/register", {
          name: fullName,
          email,
          password,
        });
        const newUser: LocalUser = {
          fullName,
          email,
          password,
          role: "CUSTOMER",
        };
        localUsers.push(newUser);
        saveLocalUsers(localUsers);
        return response.data.data;
      } catch (error) {
        // Nếu API lỗi, vẫn lưu local để người dùng trải nghiệm mượt mà
      }
    }

    // 3. Lưu vào danh sách tài khoản cục bộ (ngay lập tức, 0s delay)
    const newUser: LocalUser = {
      fullName,
      email,
      password,
      role: "CUSTOMER",
    };
    localUsers.push(newUser);
    saveLocalUsers(localUsers);

    return {
      email,
      role: "CUSTOMER",
      fullName,
    };
  },

  forgotPassword: async (email: string) => {
    if (HAS_API_SERVER) {
      try {
        const response = await api.post("/api/auth/forgot-password", { email });
        return response.data.data;
      } catch (error) {}
    }
    return { message: "Mã OTP đã được gửi đến email của bạn", otp: "123456" };
  },

  verifyOtp: async (email: string, otp: string) => {
    if (HAS_API_SERVER) {
      try {
        const response = await api.post("/api/auth/verify-otp", { email, otp });
        return response.data.data;
      } catch (error) {}
    }
    if (otp.length === 6) {
      return { message: "Xác thực OTP thành công" };
    }
    throw "Mã OTP không hợp lệ";
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    if (HAS_API_SERVER) {
      try {
        const response = await api.post("/api/auth/reset-password", {
          email,
          otp,
          newPassword,
        });
        return response.data.data;
      } catch (error) {}
    }
    const localUsers = getLocalUsers();
    const user = localUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (user) {
      user.password = newPassword;
      saveLocalUsers(localUsers);
    }
    return { message: "Đổi mật khẩu thành công" };
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
