export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface OrderItem {
  id: number;
  orderId: number;
  foodItemId: number;
  foodItemName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  bookingId: number | null;
  status: OrderStatus;
  totalPrice: number;
  items: OrderItem[];
  createdAt: string;
}

export interface PlaceOrderRequest {
  bookingId: number | null;
  items: { foodItemId: number; quantity: number }[];
}

export interface PlaceOrderResponse {
  id: number;
  userId: number;
  bookingId: number | null;
  status: OrderStatus;
  totalPrice: number;
  items: OrderItem[];
  createdAt: string;
}
