package com.kursmerkezi.randevu.controller;

import com.kursmerkezi.randevu.dto.WeeklyProgramResponse;
import com.kursmerkezi.randevu.security.UserPrincipal;
import com.kursmerkezi.randevu.service.ProgramService;
import java.util.List;
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

    @GetMapping
    public List<WeeklyProgramResponse> listPrograms() {
        return programService.listPrograms();
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> getFile(@PathVariable Long id) {
        Resource resource = programService.getFile(id);
        String contentType = programService.getContentType(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProgram(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        programService.deleteProgram(id, principal.getUser());
    }
}
