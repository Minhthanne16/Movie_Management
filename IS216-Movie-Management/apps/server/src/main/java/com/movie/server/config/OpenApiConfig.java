package com.movie.server.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Tickify Cinema API",
                version = "1.0",
                description = "Backend API for Tickify cinema management system. " +
                              "Three roles: ADMIN, STAFF, CUSTOMER. " +
                              "Authenticate via POST /api/auth/login to get a Bearer token, " +
                              "then click 'Authorize' and enter: Bearer <token>"
        ),
        servers = @Server(url = "/", description = "Local server")
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}
