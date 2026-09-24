package com.kursmerkezi.randevu.repository;

import com.kursmerkezi.randevu.model.Appointment;
import com.kursmerkezi.randevu.model.AppointmentStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByStudentId(Long studentId);

    List<Appointment> findByAvailabilityGuidanceTeacherId(Long guidanceTeacherId);

    boolean existsByAvailabilityIdAndAppointmentDateAndStatusNot(
            Long availabilityId, LocalDate appointmentDate, AppointmentStatus excludedStatus);

    List<Appointment> findByAvailabilityIdInAndAppointmentDateAndStatusNot(
            List<Long> availabilityIds, LocalDate appointmentDate, AppointmentStatus excludedStatus);
}
