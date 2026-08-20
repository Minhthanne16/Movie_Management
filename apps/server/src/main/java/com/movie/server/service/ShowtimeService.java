package com.movie.server.service;

import com.movie.server.dto.request.ShowtimeRequest;
import com.movie.server.dto.response.ShowtimeResponse;
import com.movie.server.entity.Movie;
import com.movie.server.entity.Showtime;
import com.movie.server.entity.TheaterRoom;
import com.movie.server.exception.BadRequestException;
import com.movie.server.exception.ResourceNotFoundException;
import com.movie.server.repository.MovieRepository;
import com.movie.server.repository.ShowtimeRepository;
import com.movie.server.repository.TheaterRoomRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ShowtimeService {

    private static final String UNKNOWN_ACTOR = "UNKNOWN";

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final TheaterRoomRepository theaterRoomRepository;

    public ShowtimeService(
            ShowtimeRepository showtimeRepository,
            MovieRepository movieRepository,
            TheaterRoomRepository theaterRoomRepository) {
        this.showtimeRepository = showtimeRepository;
        this.movieRepository = movieRepository;
        this.theaterRoomRepository = theaterRoomRepository;
    }

    public List<ShowtimeResponse> findAll(Long movieId, LocalDateTime from, LocalDateTime to) {
        List<Showtime> showtimes;
        boolean hasMovieId = movieId != null;
        boolean hasDateRange = from != null && to != null;

        if (hasMovieId && hasDateRange) {
            showtimes = showtimeRepository.findByMovie_IdAndDeletedAtIsNullAndStartTimeBetween(movieId, from, to);
        } else if (hasMovieId) {
            showtimes = showtimeRepository.findByMovie_IdAndDeletedAtIsNull(movieId);
        } else if (hasDateRange) {
            showtimes = showtimeRepository.findByDeletedAtIsNullAndStartTimeBetween(from, to);
        } else {
            showtimes = showtimeRepository.findByDeletedAtIsNull();
        }
        return showtimes.stream().map(this::toResponse).toList();
    }

    public ShowtimeResponse findById(Long id) {
        return toResponse(getActiveShowtime(id));
    }

    public ShowtimeResponse create(ShowtimeRequest request) {
        validate(request);
        Movie movie = getActiveMovie(request.getMovieId());
        TheaterRoom room = getActiveRoom(request.getRoomId());
        validateTimeRange(request.getStartTime(), request.getEndTime(), movie);
        validateConflict(room.getId(), request.getStartTime(), request.getEndTime(), null);

        Showtime showtime = new Showtime();
        showtime.setMovie(movie);
        showtime.setRoom(room);
        showtime.setStartTime(request.getStartTime());
        showtime.setEndTime(request.getEndTime());
        showtime.setBasePrice(request.getBasePrice());
        showtime.setCreatedAt(LocalDateTime.now());
        showtime.setCreatedBy(UNKNOWN_ACTOR);
        showtime.setUpdatedAt(LocalDateTime.now());
        showtime.setUpdatedBy(UNKNOWN_ACTOR);
        return toResponse(showtimeRepository.save(showtime));
    }

    public ShowtimeResponse update(Long id, ShowtimeRequest request) {
        validate(request);
        Showtime showtime = getActiveShowtime(id);
        Movie movie = getActiveMovie(request.getMovieId());
        TheaterRoom room = getActiveRoom(request.getRoomId());
        validateTimeRange(request.getStartTime(), request.getEndTime(), movie);
        validateConflict(room.getId(), request.getStartTime(), request.getEndTime(), id);

        showtime.setMovie(movie);
        showtime.setRoom(room);
        showtime.setStartTime(request.getStartTime());
        showtime.setEndTime(request.getEndTime());
        showtime.setBasePrice(request.getBasePrice());
        showtime.setUpdatedAt(LocalDateTime.now());
        showtime.setUpdatedBy(UNKNOWN_ACTOR);
        return toResponse(showtimeRepository.save(showtime));
    }

    public void softDelete(Long id) {
        Showtime showtime = getActiveShowtime(id);
        showtime.setDeletedAt(LocalDateTime.now());
        showtime.setDeletedBy(UNKNOWN_ACTOR);
        showtime.setUpdatedAt(LocalDateTime.now());
        showtime.setUpdatedBy(UNKNOWN_ACTOR);
        showtimeRepository.save(showtime);
    }

    private void validate(ShowtimeRequest request) {
        if (request.getMovieId() == null) {
            throw new BadRequestException("movieId is required");
        }
        if (request.getRoomId() == null) {
            throw new BadRequestException("roomId is required");
        }
        if (request.getStartTime() == null) {
            throw new BadRequestException("startTime is required");
        }
        if (request.getEndTime() == null) {
            throw new BadRequestException("endTime is required");
        }
        if (request.getBasePrice() == null || request.getBasePrice().signum() <= 0) {
            throw new BadRequestException("basePrice must be greater than 0");
        }
    }

    private void validateTimeRange(LocalDateTime startTime, LocalDateTime endTime, Movie movie) {
        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("endTime must be after startTime");
        }
        if (movie.getDurationMinutes() != null) {
            LocalDateTime minimumEnd = startTime.plusMinutes(movie.getDurationMinutes());
            if (endTime.isBefore(minimumEnd)) {
                throw new BadRequestException("endTime must be equal or greater than movie duration");
            }
        }
    }

    private void validateConflict(Long roomId, LocalDateTime startTime, LocalDateTime endTime, Long excludeId) {
        boolean hasConflict = excludeId == null
                ? !showtimeRepository.findConflictingShowtimes(roomId, startTime, endTime).isEmpty()
                : !showtimeRepository.findConflictingShowtimesExcludeId(roomId, startTime, endTime, excludeId).isEmpty();

        if (hasConflict) {
            throw new BadRequestException("Showtime conflict detected: overlapping schedule exists in this room.");
        }
    }

    private Showtime getActiveShowtime(Long id) {
        return showtimeRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found: " + id));
    }

    private Movie getActiveMovie(Long id) {
        return movieRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found: " + id));
    }

    private TheaterRoom getActiveRoom(Long id) {
        return theaterRoomRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("TheaterRoom not found: " + id));
    }

    private ShowtimeResponse toResponse(Showtime showtime) {
        return new ShowtimeResponse(
                showtime.getId(),
                showtime.getMovie().getId(),
                showtime.getMovie().getTitle(),
                showtime.getMovie().getPosterUrl(),
                showtime.getRoom().getId(),
                showtime.getRoom().getName(),
                showtime.getStartTime(),
                showtime.getEndTime(),
                showtime.getBasePrice(),
                showtime.getCreatedAt(),
                showtime.getCreatedBy(),
                showtime.getUpdatedAt(),
                showtime.getUpdatedBy(),
                showtime.getDeletedAt(),
                showtime.getDeletedBy());
    }
}
