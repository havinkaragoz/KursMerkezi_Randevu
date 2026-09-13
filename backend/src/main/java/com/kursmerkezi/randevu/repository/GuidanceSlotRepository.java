package com.kursmerkezi.randevu.repository;

import com.kursmerkezi.randevu.model.GuidanceSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuidanceSlotRepository extends JpaRepository<GuidanceSlot, Long> {
    List<GuidanceSlot> findByGuidanceTeacherIdAndBookedFalseOrderByStartTimeAsc(Long guidanceTeacherId);
    List<GuidanceSlot> findByGuidanceTeacherIdOrderByStartTimeAsc(Long guidanceTeacherId);
}
