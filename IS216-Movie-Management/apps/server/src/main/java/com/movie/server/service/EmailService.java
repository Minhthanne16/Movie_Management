package com.movie.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("OTP xác nhận đặt lại mật khẩu");
        message.setText(
                "Mã OTP của bạn là: " + otp + "\n" +
                "Mã này sẽ hết hạn sau 10 phút."
        );
        mailSender.send(message);
    }
}