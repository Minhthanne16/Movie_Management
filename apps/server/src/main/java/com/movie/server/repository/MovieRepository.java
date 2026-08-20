package com.movie.server.repository;

import com.movie.server.entity.Movie;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MovieRepository extends JpaRepository<Movie, Long>, JpaSpecificationExecutor<Movie> {
    Optional<Movie> findByIdAndDeletedAtIsNull(Long id);

    @Query("SELECT DISTINCT s.movie FROM Showtime s " +
           "WHERE s.deletedAt IS NULL AND s.endTime >= :now AND s.movie.deletedAt IS NULL " +
           "ORDER BY s.movie.title")
    List<Movie> findNowShowingMovies(@Param("now") LocalDateTime now);
}
