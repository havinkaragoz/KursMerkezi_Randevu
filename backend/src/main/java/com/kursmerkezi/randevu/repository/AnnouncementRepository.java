package com.kursmerkezi.randevu.repository;

import com.kursmerkezi.randevu.model.Announcement;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    Optional<Announcement> findTopByOrderByUpdatedAtDesc();
}
