package com.kursmerkezi.randevu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class QueueEntryResponse {
    private Long entryId;
    private int position;
    private Long studentId;
    private String studentUsername;
    private String studentFullName;
    private LocalDateTime joinedAt;
}
