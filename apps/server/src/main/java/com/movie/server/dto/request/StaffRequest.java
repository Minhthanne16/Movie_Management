package com.movie.server.dto.request;

public class StaffRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private String shift;
    private String status;
    private String phone;

    public StaffRequest() {}

    public StaffRequest(String name, String email, String password, String role, String shift, String status, String phone) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.shift = shift;
        this.status = status;
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getShift() {
        return shift;
    }

    public void setShift(String shift) {
        this.shift = shift;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
