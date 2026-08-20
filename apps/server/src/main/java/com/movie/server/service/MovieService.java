package com.movie.server.service;

import com.movie.server.dto.request.MovieRequest;
import com.movie.server.dto.response.MovieResponse;
import com.movie.server.entity.Movie;
import com.movie.server.exception.BadRequestException;
import com.movie.server.exception.ResourceNotFoundException;
import com.movie.server.repository.MovieRepository;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MovieService {
    private static final String UNKNOWN_ACTOR = "UNKNOWN";

    private final MovieRepository movieRepository;
    private final ImageUploadService imageUploadService;

    public MovieService(MovieRepository movieRepository, ImageUploadService imageUploadService) {
        this.movieRepository = movieRepository;
        this.imageUploadService = imageUploadService;
    }

    public List<MovieResponse> findAll(String keyword, String genre, String rating) {
        return movieRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (keyword != null && !keyword.isBlank()) {
                String likeKeyword = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("title")), likeKeyword),
                                cb.like(cb.lower(root.get("description")), likeKeyword)));
            }

            if (genre != null && !genre.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("genre")), "%" + genre.trim().toLowerCase() + "%"));
            }

            if (rating != null && !rating.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("rating")), rating.trim().toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        }).stream().map(this::toResponse).toList();
    }

    public MovieResponse findById(Long id) {
        return toResponse(getActiveMovie(id));
    }

    public List<MovieResponse> findNowShowing() {
        return movieRepository.findNowShowingMovies(LocalDateTime.now())
                .stream().map(this::toResponse).toList();
    }

    public MovieResponse create(MovieRequest request, MultipartFile poster) {
        validate(request, poster != null && !poster.isEmpty());
        LocalDateTime now = LocalDateTime.now();
        Movie movie = new Movie();

        applyFields(movie, request);
        if (poster != null && !poster.isEmpty()) {
            movie.setPosterUrl(imageUploadService.uploadImage(poster));
        }

        movie.setCreatedAt(now);
        movie.setCreatedBy(UNKNOWN_ACTOR);
        movie.setUpdatedAt(now);
        movie.setUpdatedBy(UNKNOWN_ACTOR);
        return toResponse(movieRepository.save(movie));
    }

    public MovieResponse update(Long id, MovieRequest request, MultipartFile poster) {
        validate(request, poster != null && !poster.isEmpty());
        Movie movie = getActiveMovie(id);
        applyFields(movie, request);

        if (poster != null && !poster.isEmpty()) {
            movie.setPosterUrl(imageUploadService.uploadImage(poster));
        }

        movie.setUpdatedAt(LocalDateTime.now());
        movie.setUpdatedBy(UNKNOWN_ACTOR);
        return toResponse(movieRepository.save(movie));
    }

    public void softDelete(Long id) {
        Movie movie = getActiveMovie(id);
        movie.setDeletedAt(LocalDateTime.now());
        movie.setDeletedBy(UNKNOWN_ACTOR);
        movie.setUpdatedAt(LocalDateTime.now());
        movie.setUpdatedBy(UNKNOWN_ACTOR);
        movieRepository.save(movie);
    }

    public String uploadPoster(MultipartFile poster) {
        return imageUploadService.uploadImage(poster);
    }

    private Movie getActiveMovie(Long id) {
        return movieRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found: " + id));
    }

    private void validate(MovieRequest request, boolean hasPosterFile) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("title is required");
        }
        if (request.getDurationMinutes() == null || request.getDurationMinutes() <= 0) {
            throw new BadRequestException("durationMinutes must be greater than 0");
        }
        if (request.getRating() == null || request.getRating().isBlank()) {
            throw new BadRequestException("rating is required");
        }
        if (!hasPosterFile && (request.getPosterUrl() == null || request.getPosterUrl().isBlank())) {
            throw new BadRequestException("posterUrl is required when poster file is missing");
        }
    }

    private void applyFields(Movie movie, MovieRequest request) {
        movie.setTitle(request.getTitle().trim());
        movie.setDescription(request.getDescription());
        movie.setDurationMinutes(request.getDurationMinutes());
        movie.setReleaseDate(request.getReleaseDate());
        movie.setRating(request.getRating().trim());
        movie.setGenre(request.getGenre());
        if (request.getPosterUrl() != null && !request.getPosterUrl().isBlank()) {
            movie.setPosterUrl(request.getPosterUrl().trim());
        }
        movie.setTrailerUrl(request.getTrailerUrl());
    }

    private MovieResponse toResponse(Movie movie) {
        return new MovieResponse(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getDurationMinutes(),
                movie.getReleaseDate(),
                movie.getRating(),
                movie.getGenre(),
                movie.getPosterUrl(),
                movie.getTrailerUrl(),
                movie.getCreatedAt(),
                movie.getCreatedBy(),
                movie.getUpdatedAt(),
                movie.getUpdatedBy(),
                movie.getDeletedAt(),
                movie.getDeletedBy());
    }
}
