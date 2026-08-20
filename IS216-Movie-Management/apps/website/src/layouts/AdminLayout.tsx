import React from "react";
import AdminSidebar from "../pages/admin/components/AdminSideBar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-tickify-bg text-white">
      <AdminSidebar />
      <main className="flex-1 p-12 overflow-y-auto">{children}</main>
    </div>
  );
}
