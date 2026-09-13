package com.kursmerkezi.randevu.controller;

import com.kursmerkezi.randevu.dto.AppointmentResponse;
import com.kursmerkezi.randevu.dto.GuidanceSlotRequest;
import com.kursmerkezi.randevu.dto.GuidanceSlotResponse;
import com.kursmerkezi.randevu.security.UserPrincipal;
import com.kursmerkezi.randevu.service.GuidanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guidance")
@RequiredArgsConstructor
public class GuidanceController {

    private final GuidanceService guidanceService;

    @PostMapping("/slots")
    @PreAuthorize("hasRole('GUIDANCE')")
    public GuidanceSlotResponse createSlot(@AuthenticationPrincipal UserPrincipal principal,
                                            @Valid @RequestBody GuidanceSlotRequest request) {
        return guidanceService.createSlot(principal.getId(), request);
    }

    @GetMapping("/slots/available/{guidanceTeacherId}")
    public List<GuidanceSlotResponse> availableSlots(@PathVariable Long guidanceTeacherId) {
        return guidanceService.listAvailableSlots(guidanceTeacherId);
    }

    @GetMapping("/slots/mine")
    @PreAuthorize("hasRole('GUIDANCE')")
    public List<GuidanceSlotResponse> mySlots(@AuthenticationPrincipal UserPrincipal principal) {
        return guidanceService.listMySlots(principal.getId());
    }

    @PostMapping("/slots/{slotId}/book")
    @PreAuthorize("hasRole('STUDENT')")
    public AppointmentResponse bookSlot(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long slotId) {
        return guidanceService.bookSlot(slotId, principal.getId());
    }

    @DeleteMapping("/appointments/{appointmentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public void cancelAppointment(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long appointmentId) {
        guidanceService.cancelAppointment(appointmentId, principal.getId());
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
