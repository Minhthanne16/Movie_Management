import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout.tsx";
import { Plus, Edit2, Trash2, Search, ArrowUpDown } from "lucide-react";
import type { Room } from "./types/adminRoom";
import RoomModals from "./components/RoomModals.tsx";
import { DEFAULT_TYPE_CONFIGS } from "./types/adminRoom";
import { theaterRoomService } from "../../services/theaterRoom.service";
import type { TheaterRoomRequest } from "../../services/theaterRoom.service";
import type { TheaterRoom } from "../../types/cinema";
import { seatService } from "../../services/seat.service";
import type { Seat as CinemaSeat } from "../../types/cinema";

function toUIRoom(tr: TheaterRoom): Room {
  return {
    id: String(tr.id),
    roomId: `ROOM-${String(tr.id).padStart(3, "0")}`,
    name: tr.name,
    description: "",
    rowCount: tr.totalRows,
    colCount: tr.seatsPerRow,
    seats: [],
    seatTypeConfigs: DEFAULT_TYPE_CONFIGS,
    createdAt: new Date().toISOString(),
  };
}

function toAPIRequest(room: Room): TheaterRoomRequest {
  return {
    name: room.name,
    totalRows: room.rowCount,
    seatsPerRow: room.colCount,
  };
}

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    theaterRoomService.getAll()
      .then(rooms => setRooms(rooms.map(toUIRoom)))
      .catch(err => setError(typeof err === "string" ? err : "Failed to load rooms"))
      .finally(() => setLoading(false));
  }, []);

  const handleAddRoom = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleEditRoom = async (room: Room) => {
    try {
      const numericId = Number(room.id);
      const backendSeats: CinemaSeat[] = await seatService.getByRoom(numericId);
      const uiSeats = backendSeats.map(s => ({
        id: String(s.id),
        row: s.rowLabel.charCodeAt(0) - 65,
        col: s.seatNumber - 1,
        type: (s.tierName.toLowerCase().includes("vip") ? "VIP"
               : s.tierName.toLowerCase().includes("couple") ? "Couple"
               : "Regular") as "Regular" | "VIP" | "Couple" | "Blocked" | "Aisle",
        label: `${s.rowLabel}${s.seatNumber}`,
      }));
      setEditingRoom({ ...room, seats: uiSeats });
    } catch {
      setEditingRoom(room);
    }
    setIsModalOpen(true);
  };

  const handleDeleteRoom = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this room? This action cannot be undone.",
      )
    ) {
      try {
        await theaterRoomService.delete(Number(id));
        setRooms(prev => prev.filter((r) => r.id !== id));
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to delete room");
      }
    }
  };

  const handleSaveRoom = async (room: Room) => {
    try {
      const req = toAPIRequest(room);
      if (editingRoom) {
        const updated = await theaterRoomService.update(Number(editingRoom.id), req);
        setRooms(prev => prev.map((r) => r.id === editingRoom.id ? toUIRoom(updated) : r));
      } else {
        const created = await theaterRoomService.create(req);
        setRooms(prev => [...prev, toUIRoom(created)]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to save room");
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              Cinema Rooms
            </h1>
            <p className="text-gray-500 font-medium">
              Manage your theater layout and seat configurations.
            </p>
          </div>
          <button
            onClick={handleAddRoom}
            className="flex items-center gap-2 bg-linear-to-r from-tickify-pink to-tickify-purple px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:shadow-[0_0_30px_rgba(255,0,128,0.5)] transition-all disabled:opacity-50"
            disabled={loading}
          >
            <Plus size={20} />
            Add New Room
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-tickify-card border border-white/5 rounded-4xl overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-tickify-pink transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="px-8 py-6">
                    Room ID <ArrowUpDown size={12} className="inline ml-1" />
                  </th>
                  <th className="px-8 py-6">Name</th>
                  <th className="px-8 py-6">Capacity</th>
                  <th className="px-8 py-6">Dimensions</th>
                  <th className="px-8 py-6">Created At</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-gray-500 text-sm">
                      Loading rooms...
                    </td>
                  </tr>
                )}
                {!loading && filteredRooms.map((room) => (
                  <tr
                    key={room.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors group"
                  >
                    <td className="px-8 py-6 font-bold text-tickify-pink">
                      {room.roomId}
                    </td>
                    <td className="px-8 py-6">{room.name}</td>
                    <td className="px-8 py-6">
                      {room.rowCount * room.colCount} Seats
                    </td>
                    <td className="px-8 py-6 text-gray-400">
                      {room.rowCount}R x {room.colCount}C
                    </td>
                    <td className="px-8 py-6 text-gray-500">
                      {new Date(room.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEditRoom(room)}
                          className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-tickify-cyan transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <RoomModals
          room={editingRoom}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveRoom}
          existingRooms={rooms}
        />
      )}
    </AdminLayout>
  );
}
