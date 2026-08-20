import { createContext, useContext, useState, type ReactNode } from "react";

interface BookingState {
  showtimeId: number | null;
  selectedSeatIds: number[];
  bookingId: number | null;
  totalPrice: number | null;
  orderId: number | null;
  paymentId: number | null;
  movieTitle: string | null;
}

interface BookingContextValue extends BookingState {
  setShowtime: (id: number) => void;
  setSeats: (ids: number[]) => void;
  setBookingId: (id: number) => void;
  setTotalPrice: (amount: number) => void;
  setOrderId: (id: number) => void;
  setPaymentId: (id: number) => void;
  setMovieTitle: (title: string) => void;
  reset: () => void;
}

const initial: BookingState = {
  showtimeId: null,
  selectedSeatIds: [],
  bookingId: null,
  totalPrice: null,
  orderId: null,
  paymentId: null,
  movieTitle: null,
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(initial);

  const setShowtime = (id: number) => setState(s => ({ ...s, showtimeId: id }));
  const setSeats = (ids: number[]) => setState(s => ({ ...s, selectedSeatIds: ids }));
  const setBookingId = (id: number) => setState(s => ({ ...s, bookingId: id }));
  const setTotalPrice = (amount: number) => setState(s => ({ ...s, totalPrice: amount }));
  const setOrderId = (id: number) => setState(s => ({ ...s, orderId: id }));
  const setPaymentId = (id: number) => setState(s => ({ ...s, paymentId: id }));
  const setMovieTitle = (title: string) => setState(s => ({ ...s, movieTitle: title }));
  const reset = () => setState(initial);

  return (
    <BookingContext.Provider value={{ ...state, setShowtime, setSeats, setBookingId, setTotalPrice, setOrderId, setPaymentId, setMovieTitle, reset }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
