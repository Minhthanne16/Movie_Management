package com.movie.server;

import com.movie.server.entity.*;
import com.movie.server.enums.Role;
import com.movie.server.repository.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
public class DataSeeder implements ApplicationRunner {

    private final MovieRepository movieRepository;
    private final TheaterRoomRepository theaterRoomRepository;
    private final SeatRepository seatRepository;
    private final SeatTierRepository seatTierRepository;
    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;
    private final FoodItemRepository foodItemRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            MovieRepository movieRepository,
            TheaterRoomRepository theaterRoomRepository,
            SeatRepository seatRepository,
            SeatTierRepository seatTierRepository,
            UserRepository userRepository,
            ShowtimeRepository showtimeRepository,
            FoodItemRepository foodItemRepository,
            PasswordEncoder passwordEncoder) {
        this.movieRepository = movieRepository;
        this.theaterRoomRepository = theaterRoomRepository;
        this.seatRepository = seatRepository;
        this.seatTierRepository = seatTierRepository;
        this.userRepository = userRepository;
        this.showtimeRepository = showtimeRepository;
        this.foodItemRepository = foodItemRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (movieRepository.count() > 0) {
            return;
        }

        // Seat tiers
        SeatTier standard = saveTier("Standard", "1.00", "Regular seating");
        SeatTier premium = saveTier("Premium", "1.30", "Extra legroom");
        SeatTier vip = saveTier("VIP", "1.50", "Recliner seats");

        // Theater rooms
        TheaterRoom hall1 = saveRoom("Hall 1", 6, 8);
        TheaterRoom hall2 = saveRoom("Hall 2", 5, 10);

        // Seats for Hall 1 (rows A-F, 8 seats each)
        seedSeats(hall1, new String[]{"A", "B", "C", "D", "E", "F"}, 8,
                new SeatTier[]{standard, standard, premium, premium, vip, vip});

        // Seats for Hall 2 (rows A-E, 10 seats each)
        seedSeats(hall2, new String[]{"A", "B", "C", "D", "E"}, 10,
                new SeatTier[]{standard, standard, premium, premium, vip});

        // Users
        saveUser("Admin User", "admin@cinema.com", "Admin@123", Role.ADMIN, null);
        saveUser("Staff One", "staff1@cinema.com", "Staff@123", Role.STAFF, "Morning Shift");
        saveUser("Staff Two", "staff2@cinema.com", "Staff@123", Role.STAFF, "Evening Shift");
        saveUser("Customer Demo", "customer@cinema.com", "Customer@123", Role.CUSTOMER, null);

        // Movies
        Movie avengers = saveMovie(
                "Avengers: Endgame",
                "The Avengers assemble once more to undo Thanos's actions.",
                181, LocalDate.of(2019, 4, 26),
                "PG-13", "Action, Adventure",
                "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
                "https://www.youtube.com/watch?v=TcMBFSGVi1c");

        Movie spiderman = saveMovie(
                "Spider-Man: No Way Home",
                "Peter Parker asks Doctor Strange for help after his identity is revealed.",
                148, LocalDate.of(2021, 12, 17),
                "PG-13", "Action, Adventure",
                "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
                "https://www.youtube.com/watch?v=JfVOs4VSpmA");

        Movie topgun = saveMovie(
                "Top Gun: Maverick",
                "After thirty years, Maverick is still pushing the envelope as a Navy test pilot.",
                130, LocalDate.of(2022, 5, 27),
                "PG-13", "Action, Drama",
                "https://image.tmdb.org/t/p/w500/62HCnUTHJl2v3DWvSLM2lTdmkdL.jpg",
                "https://www.youtube.com/watch?v=qSqVVswa420");

        Movie interstellar = saveMovie(
                "Interstellar",
                "A team of astronauts travel through a wormhole near Saturn in search of a new home.",
                169, LocalDate.of(2014, 11, 7),
                "PG-13", "Drama, Sci-Fi",
                "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                "https://www.youtube.com/watch?v=zSWdZVtXT7E");

        Movie inception = saveMovie(
                "Inception",
                "A thief who steals corporate secrets through dream-sharing technology.",
                148, LocalDate.of(2010, 7, 16),
                "PG-13", "Sci-Fi, Thriller",
                "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                "https://www.youtube.com/watch?v=YoHD9XEInc0");

        List<Movie> movies = List.of(avengers, spiderman, topgun, interstellar, inception);
        List<TheaterRoom> rooms = List.of(hall1, hall2);
        List<LocalTime> times = List.of(
                LocalTime.of(9, 0),
                LocalTime.of(14, 0),
                LocalTime.of(19, 30));

        // 3 showtimes per movie over next 7 days
        LocalDate today = LocalDate.now();
        for (int i = 0; i < movies.size(); i++) {
            Movie movie = movies.get(i);
            for (int day = 1; day <= 3; day++) {
                LocalDate date = today.plusDays(day + i);
                LocalTime time = times.get(day - 1);
                TheaterRoom room = rooms.get((i + day) % 2);
                LocalDateTime start = LocalDateTime.of(date, time);
                LocalDateTime end = start.plusMinutes(movie.getDurationMinutes() + 20);

                Showtime showtime = new Showtime();
                showtime.setMovie(movie);
                showtime.setRoom(room);
                showtime.setStartTime(start);
                showtime.setEndTime(end);
                showtime.setBasePrice(BigDecimal.valueOf(120000));
                showtimeRepository.save(showtime);
            }
        }

        // Food items
        saveFoodItem("Large Popcorn", "Freshly popped buttered popcorn", "80000", "POPCORN", "https://png.pngtree.com/png-clipart/20250103/original/pngtree-watch-movie-popcorn-maker-snack-foods-png-image_18726224.png");
        saveFoodItem("Nachos", "Crispy nachos with cheese dip", "65000", "POPCORN", "https://png.pngtree.com/png-clipart/20231020/original/pngtree-mexican-food-nachos-png-image_13378418.png");
        saveFoodItem("Coke", "Ice cold Coca-Cola 500ml", "45000", "DRINK", "https://static.vecteezy.com/system/resources/thumbnails/047/429/595/small/refreshing-glass-of-cola-with-ice-cubes-splashing-out-perfect-for-representing-a-cool-beverage-or-drink-advertisement-png.png");
        saveFoodItem("Sprite", "Refreshing Sprite 500ml", "45000", "DRINK", "https://static.vecteezy.com/system/resources/thumbnails/047/429/595/small/refreshing-glass-of-cola-with-ice-cubes-splashing-out-perfect-for-representing-a-cool-beverage-or-drink-advertisement-png.png");
        saveFoodItem("Combo 1 (Popcorn + Coke)", "Large popcorn and Coke combo", "110000", "COMBO", "https://png.pngtree.com/png-vector/20260330/ourmid/pngtree-cinema-movie-night-snacks-3d-glasses-popcorn-colorful-soda-drink-fun-png-image_18975892.webp");
        saveFoodItem("Couple Set", "2 popcorns, 2 drinks", "180000", "COUPLE_SET", "https://png.pngtree.com/png-vector/20250506/ourmid/pngtree-popcorn-and-3d-glasses-for-cinema-essentials-indicating-a-soothing-movie-png-image_16172008.png");
        saveFoodItem("M&Ms", "Chocolate candy", "35000", "CANDY", "https://www.pngall.com/wp-content/uploads/15/MM-Background-PNG.png");
    }

    private SeatTier saveTier(String name, String multiplier, String description) {
        SeatTier tier = new SeatTier();
        tier.setName(name);
        tier.setPriceMultiplier(new BigDecimal(multiplier));
        tier.setDescription(description);
        return seatTierRepository.save(tier);
    }

    private TheaterRoom saveRoom(String name, int totalRows, int seatsPerRow) {
        TheaterRoom room = new TheaterRoom();
        room.setName(name);
        room.setTotalRows(totalRows);
        room.setSeatsPerRow(seatsPerRow);
        return theaterRoomRepository.save(room);
    }

    private void seedSeats(TheaterRoom room, String[] rows, int seatsPerRow, SeatTier[] tiers) {
        for (int r = 0; r < rows.length; r++) {
            SeatTier tier = tiers[r];
            for (int s = 1; s <= seatsPerRow; s++) {
                Seat seat = new Seat();
                seat.setRoom(room);
                seat.setRowLabel(rows[r]);
                seat.setSeatNumber(s);
                seat.setTier(tier);
                seatRepository.save(seat);
            }
        }
    }

    private void saveUser(String name, String email, String rawPassword, Role role, String shift) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setEnabled(true);
        user.setStatus("Offline");
        if (shift != null) {
            user.setShift(shift);
        }
        userRepository.save(user);
    }

    private Movie saveMovie(String title, String description, int duration,
                            LocalDate releaseDate, String rating, String genre,
                            String posterUrl, String trailerUrl) {
        Movie movie = new Movie();
        movie.setTitle(title);
        movie.setDescription(description);
        movie.setDurationMinutes(duration);
        movie.setReleaseDate(releaseDate);
        movie.setRating(rating);
        movie.setGenre(genre);
        movie.setPosterUrl(posterUrl);
        movie.setTrailerUrl(trailerUrl);
        return movieRepository.save(movie);
    }

    private void saveFoodItem(String name, String description, String price, String category, String imageUrl) {
        FoodItem item = new FoodItem();
        item.setName(name);
        item.setDescription(description);
        item.setPrice(new BigDecimal(price));
        item.setCategory(category);
        item.setImageUrl(imageUrl);
        item.setIsAvailable(true);
        foodItemRepository.save(item);
    }
}
