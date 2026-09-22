package com.kursmerkezi.randevu.dto;

import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DayAvailabilityResponse {
    private Long availabilityId;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean booked;
}
