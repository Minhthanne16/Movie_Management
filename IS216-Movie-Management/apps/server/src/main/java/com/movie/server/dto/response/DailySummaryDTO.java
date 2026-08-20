package com.movie.server.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DailySummaryDTO {

    private LocalDate date;
    private long ticketsSold;
    private BigDecimal revenue;

    public DailySummaryDTO(LocalDate date, long ticketsSold, BigDecimal revenue) {
        this.date = date;
        this.ticketsSold = ticketsSold;
        this.revenue = revenue;
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public long getTicketsSold() { return ticketsSold; }
    public void setTicketsSold(long ticketsSold) { this.ticketsSold = ticketsSold; }

    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
}
