package com.movie.server.service;

import com.movie.server.dto.response.DailySummaryDTO;
import com.movie.server.dto.response.DashboardResponse;
import com.movie.server.enums.TicketStatus;
import com.movie.server.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class DashboardService {

    private static final List<TicketStatus> SOLD_STATUSES = List.of(TicketStatus.PAID, TicketStatus.USED);

    private final TicketRepository ticketRepository;

    public DashboardService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public DashboardResponse getDashboard(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        List<Object[]> totalRows = ticketRepository.findTotals(SOLD_STATUSES, start, end);
        Object[] totals = totalRows.isEmpty() ? new Object[]{null, null} : totalRows.get(0);
        long totalTicketsSold = totals[0] != null ? ((Number) totals[0]).longValue() : 0L;
        BigDecimal totalRevenue = totals[1] != null ? (BigDecimal) totals[1] : BigDecimal.ZERO;

        List<DailySummaryDTO> dailySummaries = ticketRepository.findDailySummaries(SOLD_STATUSES, start, end)
                .stream()
                .map(this::mapDailySummary)
                .toList();

        return new DashboardResponse(totalTicketsSold, totalRevenue, dailySummaries);
    }

    private DailySummaryDTO mapDailySummary(Object[] row) {
        Object dateValue = row[0];
        LocalDate date;
        if (dateValue instanceof LocalDate localDate) {
            date = localDate;
        } else if (dateValue instanceof Date sqlDate) {
            date = sqlDate.toLocalDate();
        } else {
            throw new IllegalStateException("Unsupported date type from query: " + dateValue);
        }

        long ticketsSold = row[1] != null ? ((Number) row[1]).longValue() : 0L;
        BigDecimal revenue = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
        return new DailySummaryDTO(date, ticketsSold, revenue);
    }
}
