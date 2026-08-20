package com.movie.server.service;

import com.movie.server.dto.request.SeatRequest;
import com.movie.server.dto.response.SeatAvailabilityResponse;
import com.movie.server.dto.response.SeatResponse;
import com.movie.server.entity.Showtime;
import com.movie.server.exception.BadRequestException;
import com.movie.server.exception.ResourceNotFoundException;
import com.movie.server.entity.Seat;
import com.movie.server.entity.SeatTier;
import com.movie.server.entity.TheaterRoom;
import com.movie.server.repository.SeatRepository;
import com.movie.server.repository.SeatTierRepository;
import com.movie.server.repository.ShowtimeRepository;
import com.movie.server.repository.TheaterRoomRepository;
import com.movie.server.repository.TicketRepository;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class SeatService {
    private static final String UNKNOWN_ACTOR = "UNKNOWN";

    private final SeatRepository seatRepository;
    private final TheaterRoomRepository theaterRoomRepository;
    private final SeatTierRepository seatTierRepository;
    private final ShowtimeRepository showtimeRepository;
    private final TicketRepository ticketRepository;

    public SeatService(
            SeatRepository seatRepository,
            TheaterRoomRepository theaterRoomRepository,
            SeatTierRepository seatTierRepository,
            ShowtimeRepository showtimeRepository,
            TicketRepository ticketRepository) {
        this.seatRepository = seatRepository;
        this.theaterRoomRepository = theaterRoomRepository;
        this.seatTierRepository = seatTierRepository;
        this.showtimeRepository = showtimeRepository;
        this.ticketRepository = ticketRepository;
    }

    public List<SeatResponse> findAll(Long roomId) {
        if (roomId == null) {
            return seatRepository.findByDeletedAtIsNull().stream().map(this::toResponse).toList();
        }
        return seatRepository.findByRoomIdAndDeletedAtIsNull(roomId).stream().map(this::toResponse).toList();
    }

    public List<SeatAvailabilityResponse> findAvailable(Long showtimeId) {
        Showtime showtime = showtimeRepository.findByIdAndDeletedAtIsNull(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found: " + showtimeId));
        Set<Long> booked = new HashSet<>(ticketRepository.findBookedSeatIdsByShowtimeId(showtimeId));
        return seatRepository.findByRoomIdAndDeletedAtIsNull(showtime.getRoom().getId())
                .stream()
                .map(seat -> new SeatAvailabilityResponse(
                        seat.getId(),
                        seat.getRoom().getId(),
                        seat.getRoom().getName(),
                        seat.getRowLabel(),
                        seat.getSeatNumber(),
                        seat.getTier().getId(),
                        seat.getTier().getName(),
                        booked.contains(seat.getId())))
                .toList();
    }

    public SeatResponse findById(Long id) {
        return toResponse(getActiveSeat(id));
    }

    public SeatResponse create(SeatRequest request) {
        validate(request);

        TheaterRoom room = getActiveRoom(request.getRoomId());
        SeatTier tier = getActiveTier(request.getTierId());
        LocalDateTime now = LocalDateTime.now();

        Seat seat = new Seat();
        seat.setRoom(room);
        seat.setRowLabel(request.getRowLabel().trim().toUpperCase());
        seat.setSeatNumber(request.getSeatNumber());
        seat.setTier(tier);
        seat.setCreatedAt(now);
        seat.setCreatedBy(UNKNOWN_ACTOR);
        seat.setUpdatedAt(now);
        seat.setUpdatedBy(UNKNOWN_ACTOR);
        return toResponse(seatRepository.save(seat));
    }

    public SeatResponse update(Long id, SeatRequest request) {
        validate(request);
        TheaterRoom room = getActiveRoom(request.getRoomId());
        SeatTier tier = getActiveTier(request.getTierId());

        Seat seat = getActiveSeat(id);
        seat.setRoom(room);
        seat.setRowLabel(request.getRowLabel().trim().toUpperCase());
        seat.setSeatNumber(request.getSeatNumber());
        seat.setTier(tier);
        seat.setUpdatedAt(LocalDateTime.now());
        seat.setUpdatedBy(UNKNOWN_ACTOR);
        return toResponse(seatRepository.save(seat));
    }

    public void softDelete(Long id) {
        Seat seat = getActiveSeat(id);
        seat.setDeletedAt(LocalDateTime.now());
        seat.setDeletedBy(UNKNOWN_ACTOR);
        seat.setUpdatedBy(UNKNOWN_ACTOR);
        seatRepository.save(seat);
    }

    private TheaterRoom getActiveRoom(Long id) {
        return theaterRoomRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("TheaterRoom not found: " + id));
    }

    private SeatTier getActiveTier(Long id) {
        return seatTierRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("SeatTier not found: " + id));
    }

    private Seat getActiveSeat(Long id) {
        return seatRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat not found: " + id));
    }

    private void validate(SeatRequest request) {
        if (request.getRoomId() == null) {
            throw new BadRequestException("roomId is required");
        }
        if (request.getRowLabel() == null || request.getRowLabel().isBlank() || request.getRowLabel().trim().length() != 1) {
            throw new BadRequestException("rowLabel must be a single character");
        }
        if (request.getSeatNumber() == null || request.getSeatNumber() < 1 || request.getSeatNumber() > 99) {
            throw new BadRequestException("seatNumber must be between 1 and 99");
        }
        if (request.getTierId() == null) {
            throw new BadRequestException("tierId is required");
        }
    }

    private SeatResponse toResponse(Seat seat) {
        return new SeatResponse(
                seat.getId(),
                seat.getRoom().getId(),
                seat.getRoom().getName(),
                seat.getRowLabel(),
                seat.getSeatNumber(),
                seat.getTier().getId(),
                seat.getTier().getName(),
                seat.getCreatedAt(),
                seat.getCreatedBy(),
                seat.getUpdatedAt(),
                seat.getUpdatedBy(),
                seat.getDeletedAt(),
                seat.getDeletedBy());
    }
}
