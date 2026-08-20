// ============================================================
// MOCK AUTH – Tài khoản demo (không cần Backend)
// Dùng cho mục đích phát triển / demo
// ============================================================

export type UserRole = "admin" | "staff" | "customer";

export interface MockUser {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  redirectPath: string; // Trang sẽ chuyển hướng sau khi đăng nhập
}

// Danh sách tài khoản demo
export const MOCK_ACCOUNTS: MockUser[] = [
  {
    email: "admin@tickify.vn",
    password: "admin123",
    role: "admin",
    name: "Admin Tickify",
    redirectPath: "/admin/dashboard",
  },
  {
    email: "staff@tickify.vn",
    password: "staff123",
    role: "staff",
    name: "Nhân viên POS",
    redirectPath: "/staff/dashboard",
  },
  {
    email: "customer@tickify.vn",
    password: "customer123",
    role: "customer",
    name: "Khách hàng",
    redirectPath: "/home",
  },
];

/**
 * Xác thực tài khoản mock.
 * @returns MockUser nếu tìm thấy, null nếu sai thông tin.
 */
export function mockLogin(email: string, password: string): MockUser | null {
  return (
    MOCK_ACCOUNTS.find(
      (acc) =>
        acc.email.toLowerCase() === email.toLowerCase() &&
        acc.password === password,
    ) ?? null
  );
}

// Helper lưu thông tin user vào localStorage
export function saveUserSession(user: MockUser): void {
  localStorage.setItem("role", user.role);
  localStorage.setItem("userEmail", user.email);
  localStorage.setItem("userName", user.name);
}

// Helper lấy role hiện tại
export function getCurrentRole(): UserRole | null {
  return (localStorage.getItem("role") as UserRole) ?? null;
}

// Helper đăng xuất
export function clearUserSession(): void {
  localStorage.removeItem("role");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("token");
}
