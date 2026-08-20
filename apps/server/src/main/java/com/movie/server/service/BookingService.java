package com.movie.server.service;

import com.movie.server.dto.request.BookingRequest;
import com.movie.server.dto.response.BookingResponse;
import com.movie.server.dto.response.TicketResponse;
import com.movie.server.entity.Booking;
import com.movie.server.entity.Seat;
import com.movie.server.entity.Showtime;
import com.movie.server.entity.Ticket;
import com.movie.server.entity.User;
import com.movie.server.enums.BookingStatus;
import com.movie.server.enums.TicketStatus;
import com.movie.server.exception.BadRequestException;
import com.movie.server.exception.ResourceNotFoundException;
import com.movie.server.repository.BookingRepository;
import com.movie.server.repository.SeatRepository;
import com.movie.server.repository.ShowtimeRepository;
import com.movie.server.repository.TicketRepository;
import com.movie.server.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          ShowtimeRepository showtimeRepository,
                          SeatRepository seatRepository,
                          TicketRepository ticketRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BookingResponse create(BookingRequest request, String userEmail) {
        if (request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            throw new BadRequestException("At least one seat must be selected");
        }
        Showtime showtime = showtimeRepository.findByIdAndDeletedAtIsNull(request.getShowtimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found: " + request.getShowtimeId()));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate all seats and calculate total BEFORE creating the booking
        List<Seat> seats = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (Long seatId : request.getSeatIds()) {
            Seat seat = seatRepository.findByIdAndDeletedAtIsNull(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("Seat not found: " + seatId));
            // Guard: check if seat is already booked for this showtime
            if (ticketRepository.existsByShowtime_IdAndSeat_IdAndStatusNot(
                    showtime.getId(), seat.getId(), TicketStatus.CANCELLED)) {
                throw new BadRequestException("Seat already booked: " + seat.getRowLabel() + seat.getSeatNumber());
            }
            seats.add(seat);
            total = total.add(showtime.getBasePrice().multiply(seat.getTier().getPriceMultiplier()));
        }

        LocalDateTime now = LocalDateTime.now();

        // Save booking ONCE with CONFIRMED status and correct total
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShowtime(showtime);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setTotalPrice(total);
        booking.setCreatedAt(now);
        booking.setCreatedBy(userEmail);
        booking.setUpdatedAt(now);
        booking.setUpdatedBy(userEmail);
        booking = bookingRepository.save(booking);

        // Create tickets for the pre-validated seats
        List<TicketResponse> ticketResponses = new ArrayList<>();
        for (Seat seat : seats) {
            BigDecimal price = showtime.getBasePrice().multiply(seat.getTier().getPriceMultiplier());

            Ticket ticket = new Ticket();
            ticket.setBooking(booking);
            ticket.setShowtime(showtime);
            ticket.setSeat(seat);
            ticket.setPrice(price);
            ticket.setStatus(TicketStatus.PAID);
            ticket.setCreatedAt(now);
            ticket.setCreatedBy(userEmail);
            ticket.setUpdatedAt(now);
            ticket.setUpdatedBy(userEmail);
            ticket = ticketRepository.save(ticket);

            ticketResponses.add(new TicketResponse(
                    ticket.getId(), seat.getId(),
                    seat.getRowLabel(), seat.getSeatNumber(),
                    seat.getTier().getName(), price));
        }

        return toResponse(booking, ticketResponses);
    }

    public BookingResponse findById(Long id) {
        Booking booking = bookingRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        List<TicketResponse> tickets = buildTicketResponses(booking);
        return toResponse(booking, tickets);
    }

    public List<BookingResponse> findMyBookings(String userEmail) {
        return bookingRepository.findByUser_EmailAndDeletedAtIsNull(userEmail)
                .stream()
                .map(b -> toResponse(b, buildTicketResponses(b)))
                .toList();
    }

    @Transactional
    public BookingResponse cancel(Long id, String userEmail) {
        Booking booking = bookingRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("Not authorized to cancel this booking");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }
        LocalDateTime now = LocalDateTime.now();
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(now);
        booking.setUpdatedBy(userEmail);
        booking = bookingRepository.save(booking);

        List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
        tickets.forEach(t -> {
            t.setStatus(TicketStatus.CANCELLED);
            t.setUpdatedAt(now);
            t.setUpdatedBy(userEmail);
        });
        ticketRepository.saveAll(tickets);

        return toResponse(booking, buildTicketResponses(booking));
    }

    private List<TicketResponse> buildTicketResponses(Booking booking) {
        return ticketRepository.findByBookingId(booking.getId())
                .stream()
                .map(t -> new TicketResponse(
                        t.getId(), t.getSeat().getId(),
                        t.getSeat().getRowLabel(), t.getSeat().getSeatNumber(),
                        t.getSeat().getTier().getName(), t.getPrice()))
                .toList();
    }

    private BookingResponse toResponse(Booking booking, List<TicketResponse> tickets) {
        Showtime s = booking.getShowtime();
        return new BookingResponse(
                booking.getId(),
                booking.getUser().getId(),
                s.getId(),
                s.getMovie().getTitle(),
                s.getMovie().getPosterUrl(),
                s.getRoom().getName(),
                s.getStartTime(),
                booking.getTotalPrice(),
                booking.getStatus(),
                tickets,
                booking.getCreatedAt());
    }
}
