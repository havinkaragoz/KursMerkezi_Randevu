package com.kursmerkezi.randevu.repository;

import com.kursmerkezi.randevu.model.QueueSession;
import com.kursmerkezi.randevu.model.QueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QueueSessionRepository extends JpaRepository<QueueSession, Long> {
    List<QueueSession> findByStatus(QueueStatus status);
    List<QueueSession> findByTeacherId(Long teacherId);
}
