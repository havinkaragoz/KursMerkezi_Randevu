package com.kursmerkezi.randevu.controller;

import com.kursmerkezi.randevu.dto.WeeklyProgramResponse;
import com.kursmerkezi.randevu.security.UserPrincipal;
import com.kursmerkezi.randevu.service.ProgramService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/programs")
@RequiredArgsConstructor
public class ProgramController {

    private final ProgramService programService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public WeeklyProgramResponse upload(@AuthenticationPrincipal UserPrincipal principal,
                                         @RequestParam("file") MultipartFile file) {
        return programService.upload(principal.getUser(), file);
    }

    @GetMapping("/current")
    public WeeklyProgramResponse getCurrentMeta() {
        return programService.getCurrentMeta();
    }

    @GetMapping("/current/file")
    public ResponseEntity<Resource> getCurrentFile() {
        Resource resource = programService.getCurrentFile();
        String contentType = programService.getCurrentContentType();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}
