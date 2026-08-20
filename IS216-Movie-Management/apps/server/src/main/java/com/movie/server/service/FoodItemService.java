package com.movie.server.service;

import com.movie.server.dto.request.FoodItemRequest;
import com.movie.server.dto.response.FoodItemResponse;
import com.movie.server.entity.FoodItem;
import com.movie.server.exception.BadRequestException;
import com.movie.server.exception.ResourceNotFoundException;
import com.movie.server.repository.FoodItemRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FoodItemService {
    private static final String UNKNOWN_ACTOR = "UNKNOWN";

    private final FoodItemRepository foodItemRepository;
    private final ImageUploadService imageUploadService;

    public FoodItemService(FoodItemRepository foodItemRepository, ImageUploadService imageUploadService) {
        this.foodItemRepository = foodItemRepository;
        this.imageUploadService = imageUploadService;
    }

    public List<FoodItemResponse> findAll() {
        return foodItemRepository.findByDeletedAtIsNull().stream().map(this::toResponse).toList();
    }

    public FoodItemResponse findById(Long id) {
        return toResponse(getActiveFoodItem(id));
    }

    public FoodItemResponse create(FoodItemRequest request, MultipartFile image) {
        validate(request);
        LocalDateTime now = LocalDateTime.now();
        String imageUrl = imageUploadService.uploadImage(image);

        FoodItem foodItem = new FoodItem();
        foodItem.setName(request.getName().trim());
        foodItem.setDescription(request.getDescription());
        foodItem.setPrice(request.getPrice());
        foodItem.setImageUrl(imageUrl);
        foodItem.setIsAvailable(request.getIsAvailable() == null ? Boolean.TRUE : request.getIsAvailable());
        foodItem.setCategory(request.getCategory());
        foodItem.setCreatedAt(now);
        foodItem.setCreatedBy(UNKNOWN_ACTOR);
        foodItem.setUpdatedAt(now);
        foodItem.setUpdatedBy(UNKNOWN_ACTOR);
        return toResponse(foodItemRepository.save(foodItem));
    }

    public FoodItemResponse update(Long id, FoodItemRequest request) {
        validate(request);
        FoodItem foodItem = getActiveFoodItem(id);
        foodItem.setName(request.getName().trim());
        foodItem.setDescription(request.getDescription());
        foodItem.setPrice(request.getPrice());
        foodItem.setImageUrl(request.getImageUrl());
        foodItem.setIsAvailable(request.getIsAvailable() == null ? foodItem.getIsAvailable() : request.getIsAvailable());
        foodItem.setCategory(request.getCategory());
        foodItem.setUpdatedAt(LocalDateTime.now());
        foodItem.setUpdatedBy(UNKNOWN_ACTOR);
        return toResponse(foodItemRepository.save(foodItem));
    }

    public void softDelete(Long id) {
        FoodItem foodItem = getActiveFoodItem(id);
        foodItem.setDeletedAt(LocalDateTime.now());
        foodItem.setDeletedBy(UNKNOWN_ACTOR);
        foodItem.setUpdatedAt(LocalDateTime.now());
        foodItem.setUpdatedBy(UNKNOWN_ACTOR);
        foodItemRepository.save(foodItem);
    }

    private FoodItem getActiveFoodItem(Long id) {
        return foodItemRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("FoodItem not found: " + id));
    }

    private void validate(FoodItemRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("name is required");
        }
        if (request.getPrice() == null || request.getPrice().doubleValue() < 0) {
            throw new BadRequestException("price must be greater than or equal to 0");
        }
    }

    private FoodItemResponse toResponse(FoodItem foodItem) {
        return new FoodItemResponse(
                foodItem.getId(),
                foodItem.getName(),
                foodItem.getDescription(),
                foodItem.getPrice(),
                foodItem.getImageUrl(),
                foodItem.getIsAvailable(),
                foodItem.getCategory(),
                foodItem.getCreatedAt(),
                foodItem.getCreatedBy(),
                foodItem.getUpdatedAt(),
                foodItem.getUpdatedBy(),
                foodItem.getDeletedAt(),
                foodItem.getDeletedBy());
    }
}
