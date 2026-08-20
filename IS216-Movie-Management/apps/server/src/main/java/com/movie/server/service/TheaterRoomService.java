package com.movie.server.service;

import com.movie.server.dto.request.TheaterRoomRequest;
import com.movie.server.dto.response.TheaterRoomResponse;
import com.movie.server.exception.BadRequestException;
import com.movie.server.exception.ResourceNotFoundException;
import com.movie.server.entity.TheaterRoom;
import com.movie.server.repository.TheaterRoomRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class TheaterRoomService {
    private static final String UNKNOWN_ACTOR = "UNKNOWN";

    private final TheaterRoomRepository theaterRoomRepository;

    public TheaterRoomService(TheaterRoomRepository theaterRoomRepository) {
        this.theaterRoomRepository = theaterRoomRepository;
    }

    public List<TheaterRoomResponse> findAll() {
        return theaterRoomRepository.findByDeletedAtIsNull().stream().map(this::toResponse).toList();
    }

    public TheaterRoomResponse findById(Long id) {
        TheaterRoom room = getActiveRoom(id);
        return toResponse(room);
    }

    public TheaterRoomResponse create(TheaterRoomRequest request) {
        validate(request);

        LocalDateTime now = LocalDateTime.now();
        TheaterRoom room = new TheaterRoom();
        room.setName(request.getName().trim());
        room.setTotalRows(request.getTotalRows());
        room.setSeatsPerRow(request.getSeatsPerRow());
        room.setCreatedAt(now);
        room.setCreatedBy(UNKNOWN_ACTOR);
        room.setUpdatedAt(now);
        room.setUpdatedBy(UNKNOWN_ACTOR);
        return toResponse(theaterRoomRepository.save(room));
    }

    public TheaterRoomResponse update(Long id, TheaterRoomRequest request) {
        validate(request);

        TheaterRoom room = getActiveRoom(id);
        room.setName(request.getName().trim());
        room.setTotalRows(request.getTotalRows());
        room.setSeatsPerRow(request.getSeatsPerRow());
        room.setUpdatedAt(LocalDateTime.now());
        room.setUpdatedBy(UNKNOWN_ACTOR);
        return toResponse(theaterRoomRepository.save(room));
    }

    public void softDelete(Long id) {
        TheaterRoom room = getActiveRoom(id);
        room.setDeletedAt(LocalDateTime.now());
        room.setDeletedBy(UNKNOWN_ACTOR);
        room.setUpdatedBy(UNKNOWN_ACTOR);
        theaterRoomRepository.save(room);
    }

    private TheaterRoom getActiveRoom(Long id) {
        return theaterRoomRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("TheaterRoom not found: " + id));
    }

    private void validate(TheaterRoomRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("name is required");
        }
        if (request.getTotalRows() == null || request.getTotalRows() <= 0) {
            throw new BadRequestException("totalRows must be greater than 0");
        }
        if (request.getSeatsPerRow() == null || request.getSeatsPerRow() <= 0) {
            throw new BadRequestException("seatsPerRow must be greater than 0");
        }
    }

    private TheaterRoomResponse toResponse(TheaterRoom room) {
        return new TheaterRoomResponse(
                room.getId(),
                room.getName(),
                room.getTotalRows(),
                room.getSeatsPerRow(),
                room.getCreatedAt(),
                room.getCreatedBy(),
                room.getUpdatedAt(),
                room.getUpdatedBy(),
                room.getDeletedAt(),
                room.getDeletedBy());
    }
}
