import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  User,
  Mail,
  Lock,
  Briefcase,
  Clock,
  Shield,
  KeyRound
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { staffService } from "../../services/staff.service";
import type { Staff } from "../../types/staff";

const ROLES = ["Manager", "Ticketing", "Concession", "Admin"];
const SHIFTS = [
  "Morning Shift (08:00 - 16:00)",
  "Evening Shift (16:00 - 00:00)",
  "Night Shift (00:00 - 08:00)",
  "Flexible",
];

export default function AdminStaff() {
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Ticketing",
    shift: "Morning Shift (08:00 - 16:00)",
    status: "Active" as string,
  });

  useEffect(() => {
    staffService.getAll()
      .then(setStaffData)
      .catch(err => setError(typeof err === "string" ? err : "Failed to load staff"))
      .finally(() => setLoading(false));
  }, []);

  const filteredStaff = staffData.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name,
        email: staff.email,
        phone: staff.phone ?? "",
        password: "", // Don't populate password for editing
        role: staff.role,
        shift: staff.shift,
        status: staff.status,
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "Ticketing",
        shift: "Morning Shift (08:00 - 16:00)",
        status: "Active",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleSave = async () => {
    try {
      const req = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        shift: formData.shift,
        status: formData.status,
      };
      if (editingStaff) {
        const updated = await staffService.update(editingStaff.id, req);
        setStaffData((prev) => prev.map((s) => s.id === editingStaff.id ? updated : s));
      } else {
        const created = await staffService.create(req);
        setStaffData((prev) => [created, ...prev]);
      }
      handleCloseModal();
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to save staff member");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await staffService.delete(id);
        setStaffData((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to delete staff member");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">
              Staff Accounts
            </h1>
            <p className="text-slate-400 font-medium">
              Manage employee credentials, roles, and shift statuses
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-all"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm whitespace-nowrap shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:scale-105 transition-all"
            >
              <Plus size={18} />
              Add New Staff
            </button>
          </div>
        </div>

        {/* Main Content - Staff Data Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">
                    Staff Member
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">
                    Email / Account
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">
                    Shift / Work Hours
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading staff...</td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-red-400 text-sm">{error}</td>
                  </tr>
                )}
                {!loading && filteredStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={`https://i.pravatar.cc/150?u=${staff.email}`}
                          alt={staff.name}
                          className="w-10 h-10 rounded-full border border-white/10 object-cover"
                        />
                        <div>
                          <p className="text-sm font-bold text-white">
                            {staff.name}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            {`EMP-${String(staff.id).padStart(3, "0")}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">{staff.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
                        <Shield size={12} className="text-pink-400" />
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-400 flex items-center gap-2">
                        <Clock size={14} className="text-purple-400" />
                        {staff.shift}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            staff.status === "Active"
                              ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                              : "bg-slate-500"
                          }`}
                        ></div>
                        <span className="text-sm font-bold text-slate-300">
                          {staff.status === "Active" ? "On Shift" : "Offline"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleOpenModal(staff)}
                          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-pink-500/50 hover:bg-pink-500/10 transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(staff.id)}
                          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                        <Search size={24} className="text-slate-500" />
                      </div>
                      <p className="text-slate-400 font-medium">
                        No staff members found matching your search.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Update Account Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseModal();
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                    {editingStaff ? (
                      <Edit2 size={20} className="text-white" />
                    ) : (
                      <User size={20} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-white">
                      {editingStaff ? "Update Staff Info" : "Add New Staff Account"}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {editingStaff
                        ? `Editing details for EMP-${String(editingStaff.id).padStart(3, "0")}`
                        : "Create credentials for a new employee"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-8 py-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      <User size={12} className="inline mr-1.5" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      <Mail size={12} className="inline mr-1.5" /> System Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="e.g. john.doe@tickify.com"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                    />
                  </div>

                  {/* Password / Reset */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      <Lock size={12} className="inline mr-1.5" /> Password
                    </label>
                    {editingStaff ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/10">
                        <span className="text-sm text-slate-400 font-medium flex items-center gap-2">
                           <KeyRound size={16}/> Password is securely stored
                        </span>
                        <button className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all border border-white/10">
                          Send Reset Link
                        </button>
                      </div>
                    ) : (
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Enter initial password"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                      />
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      <Briefcase size={12} className="inline mr-1.5" /> Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all appearance-none cursor-pointer"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Shift */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      <Clock size={12} className="inline mr-1.5" /> Shift Schedule
                    </label>
                    <select
                      value={formData.shift}
                      onChange={(e) =>
                        setFormData({ ...formData, shift: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all appearance-none cursor-pointer"
                    >
                      {SHIFTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Toggle */}
                  <div className="md:col-span-2 pt-2">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <p className="text-sm font-bold text-white mb-1">
                          Account Status
                        </p>
                        <p className="text-xs text-slate-400">
                          Determine if this user can access the system
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            status:
                              formData.status === "Active"
                                ? "Offline"
                                : "Active",
                          })
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          formData.status === "Active"
                            ? "bg-pink-500"
                            : "bg-slate-700"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.status === "Active"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-white/10 bg-white/5">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:scale-105 transition-all"
                >
                  Save Information
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
