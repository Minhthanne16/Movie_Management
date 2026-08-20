package com.movie.server.controller;

import com.movie.server.dto.request.MovieRequest;
import com.movie.server.dto.response.ApiResponse;
import com.movie.server.dto.response.MovieResponse;
import com.movie.server.service.MovieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/movies")
@Tag(name = "Movies", description = "Movie catalogue management (ADMIN write, all roles read)")
@SecurityRequirement(name = "bearerAuth")
public class MovieController {
    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping
    @Operation(summary = "List movies with optional keyword / genre / rating filters")
    public ResponseEntity<ApiResponse<List<MovieResponse>>> findAll(
            @Parameter(description = "Search by title or description") @RequestParam(required = false) String keyword,
            @Parameter(description = "Filter by genre") @RequestParam(required = false) String genre,
            @Parameter(description = "Filter by age rating (e.g. PG, R)") @RequestParam(required = false) String rating) {
        return ResponseEntity.ok(new ApiResponse<>(
                LocalDateTime.now(),
                HttpStatus.OK.value(),
                "Movies fetched",
                movieService.findAll(keyword, genre, rating)));
    }

    @GetMapping("/now-showing")
    public ResponseEntity<ApiResponse<List<MovieResponse>>> findNowShowing() {
        return ResponseEntity.ok(new ApiResponse<>(
                LocalDateTime.now(), HttpStatus.OK.value(), "Now showing movies fetched",
                movieService.findNowShowing()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get movie by ID")
    public ResponseEntity<ApiResponse<MovieResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(
                LocalDateTime.now(), HttpStatus.OK.value(), "Movie fetched", movieService.findById(id)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new movie (ADMIN only)")
    public ResponseEntity<ApiResponse<MovieResponse>> create(
            @ModelAttribute MovieRequest request, @RequestPart(name = "poster", required = false) MultipartFile poster) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                LocalDateTime.now(),
                HttpStatus.CREATED.value(),
                "Movie created",
                movieService.create(request, poster)));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update a movie (ADMIN only)")
    public ResponseEntity<ApiResponse<MovieResponse>> update(
            @PathVariable Long id,
            @ModelAttribute MovieRequest request,
            @RequestPart(name = "poster", required = false) MultipartFile poster) {
        return ResponseEntity.ok(new ApiResponse<>(
                LocalDateTime.now(), HttpStatus.OK.value(), "Movie updated", movieService.update(id, request, poster)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a movie (ADMIN only)")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        movieService.softDelete(id);
        return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Movie deleted", null));
    }

    @PostMapping(value = "/poster", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a poster image and get its URL (ADMIN only)")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPoster(@RequestPart("poster") MultipartFile poster) {
        String url = movieService.uploadPoster(poster);
        return ResponseEntity.ok(new ApiResponse<>(
                LocalDateTime.now(), HttpStatus.OK.value(), "Poster uploaded", Map.of("posterUrl", url)));
    }
}
