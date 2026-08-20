package com.movie.server.dto.response;

public class SeatAvailabilityResponse {
    private Long id;
    private Long roomId;
    private String roomName;
    private String rowLabel;
    private Integer seatNumber;
    private Long tierId;
    private String tierName;
    private boolean isBooked;

    public SeatAvailabilityResponse(Long id, Long roomId, String roomName,
                                    String rowLabel, Integer seatNumber,
                                    Long tierId, String tierName, boolean isBooked) {
        this.id = id;
        this.roomId = roomId;
        this.roomName = roomName;
        this.rowLabel = rowLabel;
        this.seatNumber = seatNumber;
        this.tierId = tierId;
        this.tierName = tierName;
        this.isBooked = isBooked;
    }

    public Long getId() { return id; }
    public Long getRoomId() { return roomId; }
    public String getRoomName() { return roomName; }
    public String getRowLabel() { return rowLabel; }
    public Integer getSeatNumber() { return seatNumber; }
    public Long getTierId() { return tierId; }
    public String getTierName() { return tierName; }
    public boolean isBooked() { return isBooked; }
}
