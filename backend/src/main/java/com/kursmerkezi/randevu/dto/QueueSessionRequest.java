package com.kursmerkezi.randevu.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class QueueSessionRequest {

    @NotBlank
    private String title;

    private Integer maxCapacity;

    private LocalDateTime sessionTime;
}
