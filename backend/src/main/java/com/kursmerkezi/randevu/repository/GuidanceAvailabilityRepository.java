package com.kursmerkezi.randevu.repository;

import com.kursmerkezi.randevu.model.GuidanceAvailability;
import java.time.DayOfWeek;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuidanceAvailabilityRepository extends JpaRepository<GuidanceAvailability, Long> {
    List<GuidanceAvailability> findByGuidanceTeacherIdOrderByDayOfWeekAscStartTimeAsc(Long guidanceTeacherId);

    List<GuidanceAvailability> findByGuidanceTeacherIdAndDayOfWeekOrderByStartTimeAsc(
            Long guidanceTeacherId, DayOfWeek dayOfWeek);
}
