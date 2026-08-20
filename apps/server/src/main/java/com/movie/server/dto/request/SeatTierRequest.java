package com.movie.server.dto.request;

import java.math.BigDecimal;

public class SeatTierRequest {
    private String name;
    private BigDecimal priceMultiplier;
    private String description;

    public SeatTierRequest() {}

    public SeatTierRequest(String name, BigDecimal priceMultiplier, String description) {
        this.name = name;
        this.priceMultiplier = priceMultiplier;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPriceMultiplier() {
        return priceMultiplier;
    }

    public String getDescription() {
        return description;
    }

}
