package com.movie.server.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.movie.server.exception.BadRequestException;
import java.io.IOException;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageUploadService {

    private final Cloudinary cloudinary;

    public ImageUploadService(@Value("${CLOUDINARY_URL:}") String cloudinaryUrl) {
        this.cloudinary = (cloudinaryUrl != null && !cloudinaryUrl.isBlank())
                ? new Cloudinary(cloudinaryUrl) : null;
    }

    public String uploadImage(MultipartFile image) {
        if (cloudinary == null) {
            throw new BadRequestException("Image upload is not configured (CLOUDINARY_URL missing)");
        }
        validateImage(image);

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.emptyMap());
            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                throw new IllegalStateException("Cloudinary did not return secure_url");
            }
            return secureUrl.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Failed to upload image to Cloudinary", ex);
        }
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new BadRequestException("image file is required");
        }
        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("file must be an image");
        }
    }
}
