package com.kursmerkezi.randevu.repository;

import com.kursmerkezi.randevu.model.Appointment;
import com.kursmerkezi.randevu.model.AppointmentStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByStudentId(Long studentId);

    List<Appointment> findByAvailabilityGuidanceTeacherId(Long guidanceTeacherId);

    Optional<Appointment> findByAvailabilityIdAndAppointmentDateAndStatus(
            Long availabilityId, LocalDate appointmentDate, AppointmentStatus status);

    List<Appointment> findByAvailabilityIdInAndAppointmentDateAndStatus(
            List<Long> availabilityIds, LocalDate appointmentDate, AppointmentStatus status);
}
