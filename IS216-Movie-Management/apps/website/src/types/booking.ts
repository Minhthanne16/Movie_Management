export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface Ticket {
  id: number;
  seatId: number;
  rowLabel: string;
  seatNumber: number;
  tierName: string;
  price: number;
}

export interface Booking {
  id: number;
  userId: number;
  showtimeId: number;
  movieTitle: string;
  moviePosterUrl: string;
  roomName: string;
  startTime: string;
  totalPrice: number;
  status: BookingStatus;
  tickets: Ticket[];
  createdAt: string;
}

export interface BookingRequest {
  showtimeId: number;
  seatIds: number[];
}
