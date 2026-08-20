package com.movie.server.repository;

import com.movie.server.entity.SeatTier;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeatTierRepository extends JpaRepository<SeatTier, Long> {
    List<SeatTier> findByDeletedAtIsNull();

    Optional<SeatTier> findByIdAndDeletedAtIsNull(Long id);
}
