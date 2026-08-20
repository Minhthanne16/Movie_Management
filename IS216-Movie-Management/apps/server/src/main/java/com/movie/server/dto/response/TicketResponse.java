package com.movie.server.dto.response;

import java.math.BigDecimal;

public class TicketResponse {
    private Long id;
    private Long seatId;
    private String rowLabel;
    private Integer seatNumber;
    private String tierName;
    private BigDecimal price;

    public TicketResponse(Long id, Long seatId, String rowLabel, Integer seatNumber,
                          String tierName, BigDecimal price) {
        this.id = id;
        this.seatId = seatId;
        this.rowLabel = rowLabel;
        this.seatNumber = seatNumber;
        this.tierName = tierName;
        this.price = price;
    }

    public Long getId() { return id; }
    public Long getSeatId() { return seatId; }
    public String getRowLabel() { return rowLabel; }
    public Integer getSeatNumber() { return seatNumber; }
    public String getTierName() { return tierName; }
    public BigDecimal getPrice() { return price; }
}
