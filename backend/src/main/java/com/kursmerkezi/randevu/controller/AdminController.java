package com.kursmerkezi.randevu.controller;

import com.kursmerkezi.randevu.dto.CreateUserRequest;
import com.kursmerkezi.randevu.dto.UserResponse;
import com.kursmerkezi.randevu.model.ActivityLog;
import com.kursmerkezi.randevu.model.Role;
import com.kursmerkezi.randevu.security.UserPrincipal;
import com.kursmerkezi.randevu.service.ActivityLogService;
import com.kursmerkezi.randevu.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ActivityLogService activityLogService;

    @PostMapping("/users")
    public UserResponse createUser(@AuthenticationPrincipal UserPrincipal principal,
                                    @Valid @RequestBody CreateUserRequest request) {
        return adminService.createUser(principal.getId(), request);
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        adminService.deleteUser(principal.getId(), id);
    }

    @GetMapping("/activity-logs")
    public Page<ActivityLog> getActivityLogs(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "50") int size,
                                              @RequestParam(required = false) Role actorRole,
                                              @RequestParam(required = false) String search) {
        return activityLogService.getLogs(PageRequest.of(page, size), actorRole, search);
    }
}
