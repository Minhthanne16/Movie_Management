package com.movie.server.dto.request;

public class SeatRequest {
    private Long roomId;
    private String rowLabel;
    private Integer seatNumber;
    private Long tierId;

    public SeatRequest() {}

    public SeatRequest(Long roomId, String rowLabel, Integer seatNumber, Long tierId) {
        this.roomId = roomId;
        this.rowLabel = rowLabel;
        this.seatNumber = seatNumber;
        this.tierId = tierId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public String getRowLabel() {
        return rowLabel;
    }

    public Integer getSeatNumber() {
        return seatNumber;
    }

    public Long getTierId() {
        return tierId;
    }

}
