package com.kursmerkezi.randevu.repository;

import com.kursmerkezi.randevu.model.WeeklyProgram;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeeklyProgramRepository extends JpaRepository<WeeklyProgram, Long> {
    List<WeeklyProgram> findAllByOrderByUploadedAtDesc();
}
