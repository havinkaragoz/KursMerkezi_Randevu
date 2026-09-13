package com.kursmerkezi.randevu.service;

import com.kursmerkezi.randevu.dto.AppointmentResponse;
import com.kursmerkezi.randevu.dto.GuidanceSlotRequest;
import com.kursmerkezi.randevu.dto.GuidanceSlotResponse;
import com.kursmerkezi.randevu.dto.UserResponse;
import com.kursmerkezi.randevu.exception.ApiException;
import com.kursmerkezi.randevu.model.*;
import com.kursmerkezi.randevu.repository.AppointmentRepository;
import com.kursmerkezi.randevu.repository.GuidanceSlotRepository;
import com.kursmerkezi.randevu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GuidanceService {

    private final GuidanceSlotRepository slotRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Transactional
    public GuidanceSlotResponse createSlot(Long guidanceTeacherId, GuidanceSlotRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ApiException("Bitiş saati başlangıçtan sonra olmalı", HttpStatus.BAD_REQUEST);
        }

        User guidanceTeacher = getUser(guidanceTeacherId);

        GuidanceSlot slot = GuidanceSlot.builder()
                .guidanceTeacher(guidanceTeacher)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .booked(false)
                .build();

        slot = slotRepository.save(slot);

        activityLogService.log(guidanceTeacher, "GUIDANCE_SLOT_CREATE",
                guidanceTeacher.getFullName() + ", " + slot.getStartTime() + " için rehberlik randevu saati oluşturdu");

        return toResponse(slot);
    }

    public List<UserResponse> listGuidanceTeachers() {
        return userRepository.findByRole(Role.GUIDANCE).stream().map(UserResponse::from).toList();
    }

    public List<GuidanceSlotResponse> listAvailableSlots(Long guidanceTeacherId) {
        return slotRepository.findByGuidanceTeacherIdAndBookedFalseOrderByStartTimeAsc(guidanceTeacherId)
                .stream().map(this::toResponse).toList();
    }

    public List<GuidanceSlotResponse> listMySlots(Long guidanceTeacherId) {
        return slotRepository.findByGuidanceTeacherIdOrderByStartTimeAsc(guidanceTeacherId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public AppointmentResponse bookSlot(Long slotId, Long studentId) {
        GuidanceSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ApiException("Randevu saati bulunamadı", HttpStatus.NOT_FOUND));

        if (slot.isBooked()) {
            throw new ApiException("Bu saat başka bir öğrenci tarafından alınmış", HttpStatus.CONFLICT);
        }

        slot.setBooked(true);
        slotRepository.save(slot);

        User student = getUser(studentId);

        Appointment appointment = Appointment.builder()
                .slot(slot)
                .student(student)
                .status(AppointmentStatus.BOOKED)
                .createdAt(LocalDateTime.now())
                .build();

        appointment = appointmentRepository.save(appointment);

        activityLogService.log(student, "APPOINTMENT_BOOK",
                student.getFullName() + ", " + slot.getGuidanceTeacher().getFullName()
                        + " ile " + slot.getStartTime() + " tarihine randevu aldı");

        return toResponse(appointment);
    }

    @Transactional
    public void cancelAppointment(Long appointmentId, Long studentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ApiException("Randevu bulunamadı", HttpStatus.NOT_FOUND));

        if (!appointment.getStudent().getId().equals(studentId)) {
            throw new ApiException("Bu randevuyu iptal etme yetkiniz yok", HttpStatus.FORBIDDEN);
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        GuidanceSlot slot = appointment.getSlot();
        slot.setBooked(false);
        slotRepository.save(slot);

        activityLogService.log(appointment.getStudent(), "APPOINTMENT_CANCEL",
                appointment.getStudent().getFullName() + ", " + slot.getStartTime() + " tarihli randevusunu iptal etti");
    }

    public List<AppointmentResponse> myAppointments(Long studentId) {
        return appointmentRepository.findByStudentId(studentId).stream().map(this::toResponse).toList();
    }

    public List<AppointmentResponse> appointmentsForGuidanceTeacher(Long guidanceTeacherId) {
        return appointmentRepository.findBySlotGuidanceTeacherId(guidanceTeacherId).stream().map(this::toResponse).toList();
    }

    private GuidanceSlotResponse toResponse(GuidanceSlot slot) {
        return new GuidanceSlotResponse(
                slot.getId(), slot.getGuidanceTeacher().getId(), slot.getGuidanceTeacher().getFullName(),
                slot.getStartTime(), slot.getEndTime(), slot.isBooked()
        );
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(), appointment.getSlot().getId(),
                appointment.getSlot().getStartTime(), appointment.getSlot().getEndTime(),
                appointment.getStudent().getId(), appointment.getStudent().getFullName(),
                appointment.getSlot().getGuidanceTeacher().getFullName(), appointment.getStatus().name()
        );
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND));
    }
}
