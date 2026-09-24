package com.kursmerkezi.randevu.controller;

import com.kursmerkezi.randevu.dto.AppointmentResponse;
import com.kursmerkezi.randevu.dto.BookAppointmentRequest;
import com.kursmerkezi.randevu.dto.DayAvailabilityResponse;
import com.kursmerkezi.randevu.dto.GuidanceAvailabilityRequest;
import com.kursmerkezi.randevu.dto.GuidanceAvailabilityResponse;
import com.kursmerkezi.randevu.dto.UserResponse;
import com.kursmerkezi.randevu.security.UserPrincipal;
import com.kursmerkezi.randevu.service.GuidanceService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guidance")
@RequiredArgsConstructor
public class GuidanceController {

    private final GuidanceService guidanceService;

    @GetMapping("/teachers")
    public List<UserResponse> listGuidanceTeachers() {
        return guidanceService.listGuidanceTeachers();
    }

    @PostMapping("/availability")
    @PreAuthorize("hasRole('GUIDANCE')")
    public GuidanceAvailabilityResponse createAvailability(@AuthenticationPrincipal UserPrincipal principal,
                                                             @Valid @RequestBody GuidanceAvailabilityRequest request) {
        return guidanceService.createAvailability(principal.getId(), request);
    }

    @GetMapping("/availability/mine")
    @PreAuthorize("hasRole('GUIDANCE')")
    public List<GuidanceAvailabilityResponse> myAvailability(@AuthenticationPrincipal UserPrincipal principal) {
        return guidanceService.listMyAvailability(principal.getId());
    }

    @DeleteMapping("/availability/{id}")
    @PreAuthorize("hasRole('GUIDANCE')")
    public void deleteAvailability(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        guidanceService.deleteAvailability(id, principal.getId());
    }

    @GetMapping("/availability/day")
    public List<DayAvailabilityResponse> availabilityForDay(
            @RequestParam Long guidanceTeacherId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return guidanceService.listAvailabilityForDate(guidanceTeacherId, date);
    }

    @PostMapping("/appointments")
    @PreAuthorize("hasRole('STUDENT')")
    public AppointmentResponse bookAppointment(@AuthenticationPrincipal UserPrincipal principal,
                                                @Valid @RequestBody BookAppointmentRequest request) {
        return guidanceService.bookAppointment(request.getAvailabilityId(), request.getDate(), principal.getId());
    }

    @DeleteMapping("/appointments/{appointmentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public void cancelAppointment(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long appointmentId) {
        guidanceService.cancelAppointment(appointmentId, principal.getId());
    }

    @PutMapping("/appointments/{appointmentId}/attendance")
    @PreAuthorize("hasRole('GUIDANCE')")
    public AppointmentResponse markAttendance(@AuthenticationPrincipal UserPrincipal principal,
                                               @PathVariable Long appointmentId,
                                               @RequestParam boolean attended) {
        return guidanceService.markAttendance(appointmentId, principal.getId(), attended);
    }

    @GetMapping("/appointments/mine")
    @PreAuthorize("hasRole('STUDENT')")
    public List<AppointmentResponse> myAppointments(@AuthenticationPrincipal UserPrincipal principal) {
        return guidanceService.myAppointments(principal.getId());
    }

    @GetMapping("/appointments/teacher")
    @PreAuthorize("hasRole('GUIDANCE')")
    public List<AppointmentResponse> teacherAppointments(@AuthenticationPrincipal UserPrincipal principal) {
        return guidanceService.appointmentsForGuidanceTeacher(principal.getId());
    }
}
