package com.kursmerkezi.randevu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class WeeklyProgramResponse {
    private Long id;
    private String originalFileName;
    private String contentType;
    private String uploadedByFullName;
    private LocalDateTime uploadedAt;
}
