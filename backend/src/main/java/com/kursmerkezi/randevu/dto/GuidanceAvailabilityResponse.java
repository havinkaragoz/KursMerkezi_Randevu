package com.kursmerkezi.randevu.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GuidanceAvailabilityResponse {
    private Long id;
    private Long guidanceTeacherId;
    private String guidanceTeacherFullName;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
}
