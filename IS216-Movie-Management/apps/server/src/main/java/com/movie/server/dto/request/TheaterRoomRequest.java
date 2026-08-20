package com.movie.server.dto.request;

public class TheaterRoomRequest {
    private String name;
    private Integer totalRows;
    private Integer seatsPerRow;

    public TheaterRoomRequest() {}

    public TheaterRoomRequest(String name, Integer totalRows, Integer seatsPerRow) {
        this.name = name;
        this.totalRows = totalRows;
        this.seatsPerRow = seatsPerRow;
    }

    public String getName() {
        return name;
    }

    public Integer getTotalRows() {
        return totalRows;
    }

    public Integer getSeatsPerRow() {
        return seatsPerRow;
    }

}
