import React from "react";
import AdminLayout from "../../layouts/AdminLayout.tsx";
import { User, Mail, Shield, Calendar, Edit2, Camera } from "lucide-react";

export default function AdminProfile() {
  const [isEditing, setIsEditing] = React.useState(false);
  const [adminData, setAdminData] = React.useState({
    name: localStorage.getItem("userFullName") || "Admin User",
    email: localStorage.getItem("userEmail") || "admin@tickify.com",
    role: localStorage.getItem("userRole") || "ADMIN",
    joinedDate: "January 15, 2024",
    avatar: null as string | null,
  });

  const [tempData, setTempData] = React.useState({ ...adminData });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempData((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setAdminData(tempData);
    setIsEditing(false);
    //call api
  };

  const handleCancel = () => {
    setTempData(adminData);
    setIsEditing(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              Admin Profile
            </h1>
            <p className="text-gray-500 font-medium">
              Manage your account settings and preferences.
            </p>
          </div>
          {isEditing && (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-tickify-pink text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(255,0,128,0.3)] hover:shadow-[0_0_25px_rgba(255,0,128,0.5)] transition-all"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-tickify-card border border-white/5 rounded-[3rem] p-8 text-center shadow-xl">
              <div className="relative inline-block mb-6 group">
                <div className="w-32 h-32 rounded-full bg-tickify-pink/10 flex items-center justify-center text-tickify-pink border-2 border-tickify-pink/30 mx-auto overflow-hidden relative">
                  {tempData.avatar ? (
                    <img
                      src={tempData.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={64} />
                  )}
                  {isEditing && (
                    <div
                      className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                      onClick={handleAvatarClick}
                    >
                      <Camera size={24} className="text-white" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/*"
                />
                {!isEditing && (
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-tickify-pink rounded-full flex items-center justify-center text-white shadow-lg border-4 border-tickify-bg hover:scale-110 transition-transform"
                  >
                    <Camera size={18} />
                  </button>
                )}
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-1">
                {adminData.name}
              </h2>
              <p className="text-xs font-black text-tickify-pink uppercase tracking-widest mb-6">
                {adminData.role}
              </p>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-2xl py-4 text-sm font-bold text-white hover:bg-white/10 transition-all"
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-tickify-card border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-xl">
              <h3 className="text-xl font-display font-bold">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <User size={12} /> Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempData.name}
                      onChange={(e) =>
                        setTempData({ ...tempData, name: e.target.value })
                      }
                      className="w-full text-sm font-bold text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-tickify-pink outline-none transition-all"
                    />
                  ) : (
                    <p className="text-sm font-bold text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      {adminData.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} /> Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={tempData.email}
                      onChange={(e) =>
                        setTempData({ ...tempData, email: e.target.value })
                      }
                      className="w-full text-sm font-bold text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-tickify-pink outline-none transition-all"
                    />
                  ) : (
                    <p className="text-sm font-bold text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      {adminData.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Shield size={12} /> Role
                  </label>
                  <p className="text-sm font-bold text-gray-500 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-not-allowed">
                    {adminData.role}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> Joined Date
                  </label>
                  <p className="text-sm font-bold text-gray-500 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-not-allowed">
                    {adminData.joinedDate}
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <h3 className="text-xl font-display font-bold mb-6">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {[
                    "Updated showtime for Deadpool & Wolverine",
                    "Added new cinema location: Riverside Plaza",
                    "Generated monthly analytics report",
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 group">
                      <div className="w-2 h-2 rounded-full bg-tickify-pink shadow-[0_0_10px_rgba(255,0,128,0.5)] group-hover:scale-150 transition-transform"></div>
                      <p className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                        {activity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
