package com.movie.server.repository;

import com.movie.server.entity.Showtime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByDeletedAtIsNull();

    Optional<Showtime> findByIdAndDeletedAtIsNull(Long id);

    List<Showtime> findByDeletedAtIsNullAndStartTimeBetween(LocalDateTime from, LocalDateTime to);

    List<Showtime> findByMovie_IdAndDeletedAtIsNull(Long movieId);

    List<Showtime> findByMovie_IdAndDeletedAtIsNullAndStartTimeBetween(
            Long movieId, LocalDateTime from, LocalDateTime to);

    @Query(
            "SELECT s FROM Showtime s "
                    + "WHERE s.room.id = :roomId "
                    + "AND s.deletedAt IS NULL "
                    + "AND :startTime < s.endTime "
                    + "AND :endTime > s.startTime")
    List<Showtime> findConflictingShowtimes(
            @Param("roomId") Long roomId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query(
            "SELECT s FROM Showtime s "
                    + "WHERE s.room.id = :roomId "
                    + "AND s.deletedAt IS NULL "
                    + "AND s.id <> :excludeId "
                    + "AND :startTime < s.endTime "
                    + "AND :endTime > s.startTime")
    List<Showtime> findConflictingShowtimesExcludeId(
            @Param("roomId") Long roomId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeId") Long excludeId);
}
