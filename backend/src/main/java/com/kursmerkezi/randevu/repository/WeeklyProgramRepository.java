package com.kursmerkezi.randevu.repository;

import com.kursmerkezi.randevu.model.WeeklyProgram;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WeeklyProgramRepository extends JpaRepository<WeeklyProgram, Long> {
    Optional<WeeklyProgram> findTopByOrderByUploadedAtDesc();
}
