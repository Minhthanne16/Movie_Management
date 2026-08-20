package com.movie.server.repository;

import com.movie.server.entity.Ticket;
import com.movie.server.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByBookingId(Long bookingId);

    boolean existsByShowtime_IdAndSeat_IdAndStatusNot(Long showtimeId, Long seatId, TicketStatus status);


    @Query("SELECT t.seat.id FROM Ticket t WHERE t.showtime.id = :showtimeId AND t.status <> com.movie.server.enums.TicketStatus.CANCELLED")
    List<Long> findBookedSeatIdsByShowtimeId(@Param("showtimeId") Long showtimeId);

    @Query("""
            SELECT COUNT(t), COALESCE(SUM(t.price), 0)
            FROM Ticket t
            WHERE t.status IN :statuses
              AND t.createdAt >= COALESCE(:start, t.createdAt)
              AND t.createdAt <= COALESCE(:end, t.createdAt)
            """)
    List<Object[]> findTotals(
            @Param("statuses") List<TicketStatus> statuses,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
            SELECT
                CAST(t.createdAt AS date),
                COUNT(t),
                COALESCE(SUM(t.price), 0)
            FROM Ticket t
            WHERE t.status IN :statuses
              AND t.createdAt >= COALESCE(:start, t.createdAt)
              AND t.createdAt <= COALESCE(:end, t.createdAt)
            GROUP BY CAST(t.createdAt AS date)
            ORDER BY CAST(t.createdAt AS date)
            """)
    List<Object[]> findDailySummaries(
            @Param("statuses") List<TicketStatus> statuses,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
