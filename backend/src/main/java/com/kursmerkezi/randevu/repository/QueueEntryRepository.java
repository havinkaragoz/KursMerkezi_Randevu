package com.kursmerkezi.randevu.repository;

import com.kursmerkezi.randevu.model.QueueEntry;
import com.kursmerkezi.randevu.model.QueueEntryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {

    List<QueueEntry> findBySessionIdAndStatusOrderByJoinedAtAsc(Long sessionId, QueueEntryStatus status);

    Optional<QueueEntry> findBySessionIdAndStudentIdAndStatus(Long sessionId, Long studentId, QueueEntryStatus status);
}
