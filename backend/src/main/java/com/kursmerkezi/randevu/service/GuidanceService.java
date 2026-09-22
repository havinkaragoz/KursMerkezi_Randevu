package com.kursmerkezi.randevu.service;

import com.kursmerkezi.randevu.dto.AppointmentResponse;
import com.kursmerkezi.randevu.dto.DayAvailabilityResponse;
import com.kursmerkezi.randevu.dto.GuidanceAvailabilityRequest;
import com.kursmerkezi.randevu.dto.GuidanceAvailabilityResponse;
import com.kursmerkezi.randevu.dto.UserResponse;
import com.kursmerkezi.randevu.exception.ApiException;
import com.kursmerkezi.randevu.model.*;
import com.kursmerkezi.randevu.repository.AppointmentRepository;
import com.kursmerkezi.randevu.repository.GuidanceAvailabilityRepository;
import com.kursmerkezi.randevu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GuidanceService {

    private static final int SLOT_MINUTES = 30;

    private final GuidanceAvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public List<UserResponse> listGuidanceTeachers() {
        return userRepository.findByRole(Role.GUIDANCE).stream().map(UserResponse::from).toList();
    }

    @Transactional
    public GuidanceAvailabilityResponse createAvailability(Long teacherId, GuidanceAvailabilityRequest request) {
        User teacher = getUser(teacherId);

        boolean alreadyExists = availabilityRepository
                .findByGuidanceTeacherIdAndDayOfWeekOrderByStartTimeAsc(teacherId, request.getDayOfWeek())
                .stream()
                .anyMatch(a -> a.getStartTime().equals(request.getStartTime()));
        if (alreadyExists) {
            throw new ApiException("Bu gün ve saat için zaten bir müsaitlik tanımlı", HttpStatus.CONFLICT);
        }

        GuidanceAvailability availability = GuidanceAvailability.builder()
                .guidanceTeacher(teacher)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getStartTime().plusMinutes(SLOT_MINUTES))
                .build();

        availability = availabilityRepository.save(availability);

        activityLogService.log(teacher, "GUIDANCE_AVAILABILITY_CREATE",
                teacher.getFullName() + ", her hafta " + dayLabel(availability.getDayOfWeek()) + " "
                        + availability.getStartTime() + " için müsaitlik ekledi");

        return toAvailabilityResponse(availability);
    }

    public List<GuidanceAvailabilityResponse> listMyAvailability(Long teacherId) {
        return availabilityRepository.findByGuidanceTeacherIdOrderByDayOfWeekAscStartTimeAsc(teacherId)
                .stream().map(this::toAvailabilityResponse).toList();
    }

    @Transactional
    public void deleteAvailability(Long availabilityId, Long teacherId) {
        GuidanceAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new ApiException("Müsaitlik bulunamadı", HttpStatus.NOT_FOUND));

        if (!availability.getGuidanceTeacher().getId().equals(teacherId)) {
            throw new ApiException("Bu müsaitliği silme yetkiniz yok", HttpStatus.FORBIDDEN);
        }

        availabilityRepository.delete(availability);

        activityLogService.log(availability.getGuidanceTeacher(), "GUIDANCE_AVAILABILITY_DELETE",
                availability.getGuidanceTeacher().getFullName() + ", " + dayLabel(availability.getDayOfWeek())
                        + " " + availability.getStartTime() + " müsaitliğini kaldırdı");
    }

    public List<DayAvailabilityResponse> listAvailabilityForDate(Long teacherId, LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        List<GuidanceAvailability> windows = availabilityRepository
                .findByGuidanceTeacherIdAndDayOfWeekOrderByStartTimeAsc(teacherId, dayOfWeek);

        if (windows.isEmpty()) {
            return List.of();
        }

        List<Long> ids = windows.stream().map(GuidanceAvailability::getId).toList();
        Set<Long> bookedIds = appointmentRepository
                .findByAvailabilityIdInAndAppointmentDateAndStatus(ids, date, AppointmentStatus.BOOKED)
                .stream().map(a -> a.getAvailability().getId()).collect(Collectors.toSet());

        return windows.stream()
                .map(w -> new DayAvailabilityResponse(w.getId(), w.getStartTime(), w.getEndTime(), bookedIds.contains(w.getId())))
                .toList();
    }

    @Transactional
    public AppointmentResponse bookAppointment(Long availabilityId, LocalDate date, Long studentId) {
        GuidanceAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new ApiException("Müsaitlik bulunamadı", HttpStatus.NOT_FOUND));

        if (date.isBefore(LocalDate.now())) {
            throw new ApiException("Geçmiş bir tarihe randevu alınamaz", HttpStatus.BAD_REQUEST);
        }
        if (date.getDayOfWeek() != availability.getDayOfWeek()) {
            throw new ApiException("Seçilen tarih bu müsaitlik günüyle uyuşmuyor", HttpStatus.BAD_REQUEST);
        }

        appointmentRepository
                .findByAvailabilityIdAndAppointmentDateAndStatus(availabilityId, date, AppointmentStatus.BOOKED)
                .ifPresent(a -> {
                    throw new ApiException("Bu saat bu tarihte dolu", HttpStatus.CONFLICT);
                });

        User student = getUser(studentId);

        Appointment appointment = Appointment.builder()
                .availability(availability)
                .appointmentDate(date)
                .student(student)
                .status(AppointmentStatus.BOOKED)
                .createdAt(LocalDateTime.now())
                .build();

        appointment = appointmentRepository.save(appointment);

        activityLogService.log(student, "APPOINTMENT_BOOK",
                student.getFullName() + ", " + availability.getGuidanceTeacher().getFullName()
                        + " ile " + date + " " + availability.getStartTime() + " saatine randevu aldı");

        return toAppointmentResponse(appointment);
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

        activityLogService.log(appointment.getStudent(), "APPOINTMENT_CANCEL",
                appointment.getStudent().getFullName() + ", " + appointment.getAppointmentDate() + " "
                        + appointment.getAvailability().getStartTime() + " tarihli randevusunu iptal etti");
    }

    public List<AppointmentResponse> myAppointments(Long studentId) {
        return appointmentRepository.findByStudentId(studentId).stream().map(this::toAppointmentResponse).toList();
    }

    public List<AppointmentResponse> appointmentsForGuidanceTeacher(Long guidanceTeacherId) {
        return appointmentRepository.findByAvailabilityGuidanceTeacherId(guidanceTeacherId)
                .stream().map(this::toAppointmentResponse).toList();
    }

    private GuidanceAvailabilityResponse toAvailabilityResponse(GuidanceAvailability a) {
        return new GuidanceAvailabilityResponse(
                a.getId(), a.getGuidanceTeacher().getId(), a.getGuidanceTeacher().getFullName(),
                a.getDayOfWeek(), a.getStartTime(), a.getEndTime());
    }

    private AppointmentResponse toAppointmentResponse(Appointment a) {
        return new AppointmentResponse(
                a.getId(), a.getAvailability().getId(), a.getAppointmentDate(),
                a.getAvailability().getStartTime(), a.getAvailability().getEndTime(),
                a.getStudent().getId(), a.getStudent().getFullName(),
                a.getAvailability().getGuidanceTeacher().getFullName(), a.getStatus().name());
    }

    private String dayLabel(DayOfWeek d) {
        return switch (d) {
            case MONDAY -> "Pazartesi";
            case TUESDAY -> "Salı";
            case WEDNESDAY -> "Çarşamba";
            case THURSDAY -> "Perşembe";
            case FRIDAY -> "Cuma";
            case SATURDAY -> "Cumartesi";
            case SUNDAY -> "Pazar";
        };
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND));
    }
}
