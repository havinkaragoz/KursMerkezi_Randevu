package com.kursmerkezi.randevu.repository;

import com.kursmerkezi.randevu.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByStudentId(Long studentId);
    List<Appointment> findBySlotGuidanceTeacherId(Long guidanceTeacherId);
}
