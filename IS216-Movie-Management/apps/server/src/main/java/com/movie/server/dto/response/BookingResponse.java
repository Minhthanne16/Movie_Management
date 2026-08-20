package com.movie.server.dto.response;

import com.movie.server.enums.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class BookingResponse {
    private Long id;
    private Long userId;
    private Long showtimeId;
    private String movieTitle;
    private String moviePosterUrl;
    private String roomName;
    private LocalDateTime startTime;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private List<TicketResponse> tickets;
    private LocalDateTime createdAt;

    public BookingResponse(Long id, Long userId, Long showtimeId, String movieTitle,
                           String moviePosterUrl, String roomName, LocalDateTime startTime,
                           BigDecimal totalPrice, BookingStatus status,
                           List<TicketResponse> tickets, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.showtimeId = showtimeId;
        this.movieTitle = movieTitle;
        this.moviePosterUrl = moviePosterUrl;
        this.roomName = roomName;
        this.startTime = startTime;
        this.totalPrice = totalPrice;
        this.status = status;
        this.tickets = tickets;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getShowtimeId() { return showtimeId; }
    public String getMovieTitle() { return movieTitle; }
    public String getMoviePosterUrl() { return moviePosterUrl; }
    public String getRoomName() { return roomName; }
    public LocalDateTime getStartTime() { return startTime; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public BookingStatus getStatus() { return status; }
    public List<TicketResponse> getTickets() { return tickets; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
