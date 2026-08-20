package com.movie.server.repository;

import com.movie.server.entity.TheaterRoom;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TheaterRoomRepository extends JpaRepository<TheaterRoom, Long> {
    List<TheaterRoom> findByDeletedAtIsNull();

    Optional<TheaterRoom> findByIdAndDeletedAtIsNull(Long id);
}
