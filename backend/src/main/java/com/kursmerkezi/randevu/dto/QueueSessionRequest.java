package com.kursmerkezi.randevu.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QueueSessionRequest {

    @NotBlank
    private String title;

    private Integer maxCapacity;
}
