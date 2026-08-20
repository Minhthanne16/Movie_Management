package com.movie.server.repository;

import com.movie.server.entity.Order;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByDeletedAtIsNull();

    Optional<Order> findByIdAndDeletedAtIsNull(Long id);

    List<Order> findByUser_EmailAndDeletedAtIsNull(String email);
}
