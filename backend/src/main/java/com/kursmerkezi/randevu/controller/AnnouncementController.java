package com.kursmerkezi.randevu.controller;

import com.kursmerkezi.randevu.dto.AnnouncementRequest;
import com.kursmerkezi.randevu.dto.AnnouncementResponse;
import com.kursmerkezi.randevu.security.UserPrincipal;
import com.kursmerkezi.randevu.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PutMapping("/current")
    @PreAuthorize("hasRole('ADMIN')")
    public AnnouncementResponse setCurrent(@AuthenticationPrincipal UserPrincipal principal,
                                            @Valid @RequestBody AnnouncementRequest request) {
        return announcementService.setCurrent(principal.getUser(), request);
    }

    @GetMapping("/current")
    public AnnouncementResponse getCurrent() {
        return announcementService.getCurrent();
    }
}
