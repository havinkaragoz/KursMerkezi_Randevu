package com.kursmerkezi.randevu.service;

import com.kursmerkezi.randevu.model.ActivityLog;
import com.kursmerkezi.randevu.model.Role;
import com.kursmerkezi.randevu.model.User;
import com.kursmerkezi.randevu.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public void log(User actor, String action, String description) {
        ActivityLog logEntry = ActivityLog.builder()
                .actorId(actor.getId())
                .actorFullName(actor.getFullName())
                .actorRole(actor.getRole())
                .action(action)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
        activityLogRepository.save(logEntry);
    }

    public Page<ActivityLog> getLogs(Pageable pageable, Role actorRoleFilter, String search) {
        boolean hasSearch = search != null && !search.isBlank();

        if (actorRoleFilter != null && hasSearch) {
            return activityLogRepository.findByActorRoleAndActorFullNameContainingIgnoreCaseOrderByCreatedAtDesc(
                    actorRoleFilter, search.trim(), pageable);
        }
        if (hasSearch) {
            return activityLogRepository.findByActorFullNameContainingIgnoreCaseOrderByCreatedAtDesc(
                    search.trim(), pageable);
        }
        if (actorRoleFilter != null) {
            return activityLogRepository.findByActorRoleOrderByCreatedAtDesc(actorRoleFilter, pageable);
        }
        return activityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
