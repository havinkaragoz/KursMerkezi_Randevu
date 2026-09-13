package com.kursmerkezi.randevu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private Long slotId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long studentId;
    private String studentFullName;
    private String guidanceTeacherFullName;
    private String status;
}
