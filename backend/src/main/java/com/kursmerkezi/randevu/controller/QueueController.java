package com.kursmerkezi.randevu.controller;

import com.kursmerkezi.randevu.dto.QueueSessionRequest;
import com.kursmerkezi.randevu.dto.QueueSessionResponse;
import com.kursmerkezi.randevu.security.UserPrincipal;
import com.kursmerkezi.randevu.service.QueueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue/sessions")
@RequiredArgsConstructor
public class QueueController {

    private final QueueService queueService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public QueueSessionResponse openSession(@AuthenticationPrincipal UserPrincipal principal,
                                             @Valid @RequestBody QueueSessionRequest request) {
        return queueService.openSession(principal.getId(), request);
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('TEACHER')")
    public void closeSession(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        queueService.closeSession(id, principal.getId());
    }

    @GetMapping
    public List<QueueSessionResponse> listOpenSessions() {
        return queueService.listOpenSessions();
    }

    @GetMapping("/{id}")
    public QueueSessionResponse getSession(@PathVariable Long id) {
        return queueService.getSessionDetail(id);
    }

    @PostMapping("/{id}/join")
    @PreAuthorize("hasRole('STUDENT')")
    public QueueSessionResponse join(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return queueService.joinQueue(id, principal.getId());
    }

    @PostMapping("/{id}/leave")
    @PreAuthorize("hasRole('STUDENT')")
    public QueueSessionResponse leave(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return queueService.leaveQueue(id, principal.getId());
    }

    @PostMapping("/{id}/next")
    @PreAuthorize("hasRole('TEACHER')")
    public QueueSessionResponse completeNext(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return queueService.completeNext(id, principal.getId());
    }
}
