package com.kursmerkezi.randevu.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Data;

@Data
public class BookAppointmentRequest {

    @NotNull
    private Long availabilityId;

    @NotNull
    private LocalDate date;
}
