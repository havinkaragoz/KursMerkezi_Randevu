package com.kursmerkezi.randevu.service;

import com.kursmerkezi.randevu.dto.QueueEntryResponse;
import com.kursmerkezi.randevu.dto.QueueSessionRequest;
import com.kursmerkezi.randevu.dto.QueueSessionResponse;
import com.kursmerkezi.randevu.exception.ApiException;
import com.kursmerkezi.randevu.model.*;
import com.kursmerkezi.randevu.repository.QueueEntryRepository;
import com.kursmerkezi.randevu.repository.QueueSessionRepository;
import com.kursmerkezi.randevu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QueueService {

    private final QueueSessionRepository sessionRepository;
    private final QueueEntryRepository entryRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Transactional
    public QueueSessionResponse openSession(Long teacherId, QueueSessionRequest request) {
        User teacher = getUser(teacherId);

        if (request.getMaxCapacity() != null && request.getMaxCapacity() <= 0) {
            throw new ApiException("Kontenjan pozitif bir sayı olmalı", HttpStatus.BAD_REQUEST);
        }

        QueueSession session = QueueSession.builder()
                .teacher(teacher)
                .title(request.getTitle())
                .status(QueueStatus.OPEN)
                .maxCapacity(request.getMaxCapacity())
                .createdAt(LocalDateTime.now())
                .build();

        session = sessionRepository.save(session);

        activityLogService.log(teacher, "QUEUE_OPEN",
                teacher.getFullName() + " \"" + session.getTitle() + "\" soru çözüm oturumunu açtı"
                        + (session.getMaxCapacity() != null ? " (kontenjan: " + session.getMaxCapacity() + ")" : ""));

        return toResponse(session);
    }

    @Transactional
    public void closeSession(Long sessionId, Long teacherId) {
        QueueSession session = getSession(sessionId);
        if (!session.getTeacher().getId().equals(teacherId)) {
            throw new ApiException("Bu oturumu kapatma yetkiniz yok", HttpStatus.FORBIDDEN);
        }
        session.setStatus(QueueStatus.CLOSED);
        sessionRepository.save(session);

        activityLogService.log(session.getTeacher(), "QUEUE_CLOSE",
                session.getTeacher().getFullName() + " \"" + session.getTitle() + "\" soru çözüm oturumunu kapattı");
    }

    public List<QueueSessionResponse> listOpenSessions() {
        return sessionRepository.findByStatus(QueueStatus.OPEN).stream().map(this::toResponse).toList();
    }

    public QueueSessionResponse getSessionDetail(Long sessionId) {
        return toResponse(getSession(sessionId));
    }

    @Transactional
    public QueueSessionResponse joinQueue(Long sessionId, Long studentId) {
        QueueSession session = getSession(sessionId);

        if (session.getStatus() != QueueStatus.OPEN) {
            throw new ApiException("Bu oturum artık kapalı", HttpStatus.BAD_REQUEST);
        }

        entryRepository.findBySessionIdAndStudentIdAndStatus(sessionId, studentId, QueueEntryStatus.WAITING)
                .ifPresent(e -> {
                    throw new ApiException("Zaten bu kuyruktasınız", HttpStatus.CONFLICT);
                });

        if (session.getMaxCapacity() != null) {
            int currentCount = entryRepository.findBySessionIdAndStatusOrderByJoinedAtAsc(sessionId, QueueEntryStatus.WAITING).size();
            if (currentCount >= session.getMaxCapacity()) {
                throw new ApiException("Kontenjan dolu", HttpStatus.CONFLICT);
            }
        }

        User student = getUser(studentId);

        QueueEntry entry = QueueEntry.builder()
                .session(session)
                .student(student)
                .status(QueueEntryStatus.WAITING)
                .joinedAt(LocalDateTime.now())
                .build();

        entryRepository.save(entry);

        activityLogService.log(student, "QUEUE_JOIN",
                student.getFullName() + ", \"" + session.getTitle() + "\" kuyruğuna katıldı");

        return toResponse(session);
    }

    @Transactional
    public QueueSessionResponse leaveQueue(Long sessionId, Long studentId) {
        QueueEntry entry = entryRepository.findBySessionIdAndStudentIdAndStatus(sessionId, studentId, QueueEntryStatus.WAITING)
                .orElseThrow(() -> new ApiException("Kuyrukta kaydınız yok", HttpStatus.NOT_FOUND));

        entry.setStatus(QueueEntryStatus.CANCELLED);
        entryRepository.save(entry);

        QueueSession session = getSession(sessionId);

        activityLogService.log(entry.getStudent(), "QUEUE_LEAVE",
                entry.getStudent().getFullName() + ", \"" + session.getTitle() + "\" kuyruğundan ayrıldı");

        return toResponse(session);
    }

    @Transactional
    public QueueSessionResponse completeNext(Long sessionId, Long teacherId) {
        QueueSession session = getSession(sessionId);
        if (!session.getTeacher().getId().equals(teacherId)) {
            throw new ApiException("Bu oturumu yönetme yetkiniz yok", HttpStatus.FORBIDDEN);
        }

        List<QueueEntry> waiting = entryRepository.findBySessionIdAndStatusOrderByJoinedAtAsc(sessionId, QueueEntryStatus.WAITING);
        if (waiting.isEmpty()) {
            throw new ApiException("Kuyrukta bekleyen öğrenci yok", HttpStatus.BAD_REQUEST);
        }

        QueueEntry first = waiting.get(0);
        first.setStatus(QueueEntryStatus.DONE);
        entryRepository.save(first);

        activityLogService.log(session.getTeacher(), "QUEUE_COMPLETE",
                session.getTeacher().getFullName() + ", " + first.getStudent().getFullName()
                        + " adlı öğrenciyi \"" + session.getTitle() + "\" oturumunda tamamladı");

        return toResponse(session);
    }

    private QueueSessionResponse toResponse(QueueSession session) {
        List<QueueEntry> waiting = entryRepository.findBySessionIdAndStatusOrderByJoinedAtAsc(session.getId(), QueueEntryStatus.WAITING);

        List<QueueEntryResponse> entries = new java.util.ArrayList<>();
        for (int i = 0; i < waiting.size(); i++) {
            QueueEntry e = waiting.get(i);
            entries.add(new QueueEntryResponse(
                    e.getId(), i + 1, e.getStudent().getId(),
                    e.getStudent().getUsername(), e.getStudent().getFullName(), e.getJoinedAt()
            ));
        }

        return new QueueSessionResponse(
                session.getId(), session.getTitle(), session.getStatus().name(),
                session.getTeacher().getId(), session.getTeacher().getFullName(),
                session.getMaxCapacity(), session.getCreatedAt(), entries
        );
    }

    private QueueSession getSession(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new ApiException("Oturum bulunamadı", HttpStatus.NOT_FOUND));
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND));
    }
}
