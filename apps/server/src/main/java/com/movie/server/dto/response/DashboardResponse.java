package com.movie.server.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class DashboardResponse {

    private long totalTicketsSold;
    private BigDecimal totalRevenue;
    private List<DailySummaryDTO> dailySummaries;

    public DashboardResponse(long totalTicketsSold, BigDecimal totalRevenue, List<DailySummaryDTO> dailySummaries) {
        this.totalTicketsSold = totalTicketsSold;
        this.totalRevenue = totalRevenue;
        this.dailySummaries = dailySummaries;
    }

    public long getTotalTicketsSold() { return totalTicketsSold; }
    public void setTotalTicketsSold(long totalTicketsSold) { this.totalTicketsSold = totalTicketsSold; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public List<DailySummaryDTO> getDailySummaries() { return dailySummaries; }
    public void setDailySummaries(List<DailySummaryDTO> dailySummaries) { this.dailySummaries = dailySummaries; }
}
