export interface TheaterRoom {
  id: number;
  name: string;
  totalRows: number;
  seatsPerRow: number;
}

export interface Seat {
  id: number;
  roomId: number;
  roomName: string;
  rowLabel: string;
  seatNumber: number;
  tierId: number;
  tierName: string;
}

export interface SeatAvailability extends Seat {
  isBooked: boolean;
}

export interface SeatTier {
  id: number;
  name: string;
  priceMultiplier: number;
  description: string | null;
}
