package com.kursmerkezi.randevu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class QueueSessionResponse {
    private Long id;
    private String title;
    private String status;
    private Long teacherId;
    private String teacherFullName;
    private Integer maxCapacity;
    private LocalDateTime createdAt;
    private List<QueueEntryResponse> waitingList;
}
