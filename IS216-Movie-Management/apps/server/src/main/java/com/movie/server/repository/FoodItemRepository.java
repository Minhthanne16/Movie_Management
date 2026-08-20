package com.movie.server.repository;

import com.movie.server.entity.FoodItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByDeletedAtIsNull();

    Optional<FoodItem> findByIdAndDeletedAtIsNull(Long id);
}
