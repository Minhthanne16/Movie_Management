package com.movie.server.repository;

import com.movie.server.entity.Seat;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByDeletedAtIsNull();

    Optional<Seat> findByIdAndDeletedAtIsNull(Long id);

    List<Seat> findByRoomIdAndDeletedAtIsNull(Long roomId);
}
