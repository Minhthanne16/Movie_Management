import type { Movie } from "../../../types/movie";
import type { Showtime } from "../../../types/showtime";
import type { Seat, SeatType, SeatTypeConfig } from "../../admin/types/adminRoom";

export const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: "Dune: Part Two",
    description: "Paul Atreides travelsto the dangerous planet Arrakis to ensure the future of his family and people.",
    duration_minutes: 166,
    release_date: "2024-02-28",
    rating: 8.5,
    genre: "Science Fiction, Adventure, Drama",
    age_rating: "T13",
    poster_url: "https://images.unsplash.com/photo-1578327328520-d2b0760f8b71?w=300&h=450&fit=crop",
    created_at: "2024-01-01T00:00:00Z",
    created_by: 1,
    updated_at: null,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
  },
  {
    id: 2,
    title: "Oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    duration_minutes: 180,
    release_date: "2023-07-21",
    rating: 8.8,
    genre: "Biography, Drama, History",
    age_rating: "T16",
    poster_url: "https://images.unsplash.com/photo-1595432707802-6b2626ef1c91?w=300&h=450&fit=crop",
    created_at: "2024-01-01T00:00:00Z",
    created_by: 1,
    updated_at: null,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
  },
  {
    id: 3,
    title: "Barbie",
    description: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.",
    duration_minutes: 114,
    release_date: "2023-07-21",
    rating: 7.3,
    genre: "Comedy, Fantasy",
    age_rating: "K",
    poster_url: "https://images.unsplash.com/photo-1616530940355-af913651531c?w=300&h=450&fit=crop",
    created_at: "2024-01-01T00:00:00Z",
    created_by: 1,
    updated_at: null,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
  },
  {
    id: 4,
    title: "Killers of the Flower Moon",
    description: "When oil is discovered in 1920s Oklahoma, it sparks a rush that transforms the nation, and the Osage people are murdered.",
    duration_minutes: 206,
    release_date: "2023-10-27",
    rating: 8.0,
    genre: "Crime, Drama, History",
    age_rating: "T16",
    poster_url: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop",
    created_at: "2024-01-01T00:00:00Z",
    created_by: 1,
    updated_at: null,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
  },
  {
    id: 5,
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.",
    duration_minutes: 148,
    release_date: "2010-07-16",
    rating: 8.8,
    genre: "Action, Science Fiction, Thriller",
    age_rating: "T13",
    poster_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=450&fit=crop",
    created_at: "2024-01-01T00:00:00Z",
    created_by: 1,
    updated_at: null,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
  },
];

export const MOCK_SHOWTIMES: Showtime[] = [
  {
    id: 1,
    movieId: 1,
    movieTitle: "Dune: Part Two",
    moviePosterUrl: "",
    roomId: 1,
    roomName: "Room 1",
    startTime: "2024-05-18T10:00:00Z",
    endTime: "2024-05-18T12:46:00Z",
    basePrice: 200,
  },
  {
    id: 2,
    movieId: 1,
    movieTitle: "Dune: Part Two",
    moviePosterUrl: "",
    roomId: 2,
    roomName: "Room 2",
    startTime: "2024-05-18T14:00:00Z",
    endTime: "2024-05-18T16:46:00Z",
    basePrice: 250,
  },
  {
    id: 3,
    movieId: 1,
    movieTitle: "Dune: Part Two",
    moviePosterUrl: "",
    roomId: 3,
    roomName: "Room 3",
    startTime: "2024-05-18T19:00:00Z",
    endTime: "2024-05-18T21:46:00Z",
    basePrice: 180,
  },
  {
    id: 4,
    movieId: 2,
    movieTitle: "Oppenheimer",
    moviePosterUrl: "",
    roomId: 1,
    roomName: "Room 1",
    startTime: "2024-05-18T11:00:00Z",
    endTime: "2024-05-18T13:00:00Z",
    basePrice: 180,
  },
  {
    id: 5,
    movieId: 2,
    movieTitle: "Oppenheimer",
    moviePosterUrl: "",
    roomId: 2,
    roomName: "Room 2",
    startTime: "2024-05-18T16:00:00Z",
    endTime: "2024-05-18T18:00:00Z",
    basePrice: 220,
  },
  {
    id: 6,
    movieId: 3,
    movieTitle: "Barbie",
    moviePosterUrl: "",
    roomId: 1,
    roomName: "Room 1",
    startTime: "2024-05-18T13:00:00Z",
    endTime: "2024-05-18T14:54:00Z",
    basePrice: 180,
  },
  {
    id: 7,
    movieId: 3,
    movieTitle: "Barbie",
    moviePosterUrl: "",
    roomId: 3,
    roomName: "Room 3",
    startTime: "2024-05-18T18:00:00Z",
    endTime: "2024-05-18T19:54:00Z",
    basePrice: 180,
  },
  {
    id: 8,
    movieId: 4,
    movieTitle: "Killers of the Flower Moon",
    moviePosterUrl: "",
    roomId: 2,
    roomName: "Room 2",
    startTime: "2024-05-18T12:00:00Z",
    endTime: "2024-05-18T15:26:00Z",
    basePrice: 250,
  },
  {
    id: 9,
    movieId: 5,
    movieTitle: "Inception",
    moviePosterUrl: "",
    roomId: 1,
    roomName: "Room 1",
    startTime: "2024-05-18T15:00:00Z",
    endTime: "2024-05-18T17:28:00Z",
    basePrice: 200,
  },
];

export const MOCK_ROOM_DATA = {
  rowCount: 8,
  colCount: 12,
  typeConfigs: [
    { type: "Regular", color: "#FF0080", price: 150 },
    { type: "VIP", color: "#7B2CBF", price: 250 },
    { type: "Couple", color: "#00D2FF", price: 400 },
    { type: "Blocked", color: "#374151", price: 0 },
  ] as SeatTypeConfig[],
  seats: generateSeats(8, 12),
};

// Helper function to generate seat layout
function generateSeats(rowCount: number, colCount: number): Seat[] {
  const seats: Seat[] = [];
  const seatTypes: Array<"Regular" | "VIP" | "Couple" | "Aisle" | "Blocked"> = [
    "Regular",
    "Regular",
    "Aisle",
    "VIP",
    "VIP",
    "VIP",
    "Aisle",
    "Couple",
    "Couple",
    "Aisle",
    "Regular",
    "Regular",
  ];

  const blockedSeats = ["A3", "B7", "C5", "D12", "E1", "F8"];

  for (let row = 0; row < rowCount; row++) {
    const rowLetter = String.fromCharCode(65 + row);

    for (let col = 0; col < colCount; col++) {
      const seatLabel = `${rowLetter}${col + 1}`;
      let type = seatTypes[col] as SeatType;

      if (blockedSeats.includes(seatLabel)) {
        type = "Blocked";
      } else if (type === "Aisle") {
        // Skip aisle positions
        continue;
      }

      seats.push({
        id: seatLabel,
        row,
        col,
        type,
        label: seatLabel,
      });
    }
  }

  return seats;
}