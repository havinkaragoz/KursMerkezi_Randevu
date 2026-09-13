package com.kursmerkezi.randevu.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AnnouncementResponse {
    private Long id;
    private String title;
    private String message;
    private String updatedByFullName;
    private LocalDateTime updatedAt;
}
