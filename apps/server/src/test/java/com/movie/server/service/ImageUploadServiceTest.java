package com.movie.server.service;

import com.movie.server.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;

class ImageUploadServiceTest {

    @Test
    void constructorDoesNotThrowWhenUrlIsBlank() {
        assertDoesNotThrow(() -> new ImageUploadService(""));
    }

    @Test
    void uploadImageThrowsBadRequestWhenNotConfigured() {
        ImageUploadService service = new ImageUploadService("");
        MockMultipartFile file = new MockMultipartFile(
                "poster", "test.jpg", "image/jpeg", new byte[]{1, 2, 3});
        assertThrows(BadRequestException.class, () -> service.uploadImage(file));
    }
}
