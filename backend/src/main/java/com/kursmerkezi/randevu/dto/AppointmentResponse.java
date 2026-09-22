package com.kursmerkezi.randevu.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private Long availabilityId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Long studentId;
    private String studentFullName;
    private String guidanceTeacherFullName;
    private String status;
}
