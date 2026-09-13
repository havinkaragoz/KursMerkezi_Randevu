package com.kursmerkezi.randevu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class GuidanceSlotResponse {
    private Long id;
    private Long guidanceTeacherId;
    private String guidanceTeacherFullName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean booked;
}
