export interface DailySummary {
  date: string;
  ticketCount: number;
  revenue: number;
}

export interface DashboardStats {
  totalTicketsSold: number;
  totalRevenue: number;
  dailySummaries: DailySummary[];
}
