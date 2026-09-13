package com.kursmerkezi.randevu.service;

import com.kursmerkezi.randevu.dto.AnnouncementRequest;
import com.kursmerkezi.randevu.dto.AnnouncementResponse;
import com.kursmerkezi.randevu.model.Announcement;
import com.kursmerkezi.randevu.model.User;
import com.kursmerkezi.randevu.repository.AnnouncementRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final ActivityLogService activityLogService;

    @Transactional
    public AnnouncementResponse setCurrent(User admin, AnnouncementRequest request) {
        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .updatedByFullName(admin.getFullName())
                .updatedAt(LocalDateTime.now())
                .build();

        announcement = announcementRepository.save(announcement);

        activityLogService.log(admin, "ANNOUNCEMENT_UPDATE",
                admin.getFullName() + ", duyuruyu güncelledi (\"" + announcement.getTitle() + "\")");

        return toResponse(announcement);
    }

    public AnnouncementResponse getCurrent() {
        return announcementRepository.findTopByOrderByUpdatedAtDesc()
                .map(this::toResponse)
                .orElse(null);
    }

    private AnnouncementResponse toResponse(Announcement announcement) {
        return new AnnouncementResponse(
                announcement.getId(), announcement.getTitle(), announcement.getMessage(),
                announcement.getUpdatedByFullName(), announcement.getUpdatedAt());
    }
}
