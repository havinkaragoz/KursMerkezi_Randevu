package com.kursmerkezi.randevu.service;

import com.kursmerkezi.randevu.dto.CreateUserRequest;
import com.kursmerkezi.randevu.dto.UserResponse;
import com.kursmerkezi.randevu.exception.ApiException;
import com.kursmerkezi.randevu.model.Role;
import com.kursmerkezi.randevu.model.User;
import com.kursmerkezi.randevu.repository.AppointmentRepository;
import com.kursmerkezi.randevu.repository.GuidanceAvailabilityRepository;
import com.kursmerkezi.randevu.repository.QueueEntryRepository;
import com.kursmerkezi.randevu.repository.QueueSessionRepository;
import com.kursmerkezi.randevu.repository.UserRepository;
import com.kursmerkezi.randevu.repository.WeeklyProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;
    private final QueueSessionRepository queueSessionRepository;
    private final QueueEntryRepository queueEntryRepository;
    private final GuidanceAvailabilityRepository guidanceAvailabilityRepository;
    private final AppointmentRepository appointmentRepository;
    private final WeeklyProgramRepository weeklyProgramRepository;

    public UserResponse createUser(Long adminId, CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ApiException("Bu kullanıcı adı zaten kullanılıyor", HttpStatus.CONFLICT);
        }

        User admin = getUser(adminId);

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .build();

        user = userRepository.save(user);

        activityLogService.log(admin, "USER_CREATE",
                admin.getFullName() + ", \"" + user.getFullName() + "\" (" + user.getRole() + ") kullanıcısını oluşturdu");

        return UserResponse.from(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    public void deleteUser(Long adminId, Long id) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND));

        if (target.getRole() == Role.ADMIN && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new ApiException("Sistemde en az bir admin hesabı kalmalı, bu hesap silinemez", HttpStatus.CONFLICT);
        }

        boolean hasHistory = queueSessionRepository.existsByTeacherId(id)
                || queueEntryRepository.existsByStudentId(id)
                || guidanceAvailabilityRepository.existsByGuidanceTeacherId(id)
                || appointmentRepository.existsByStudentId(id)
                || weeklyProgramRepository.existsByUploadedById(id);
        if (hasHistory) {
            throw new ApiException(
                    "Bu kullanıcının sistemde geçmiş kayıtları (oturum, randevu, program vb.) olduğu için silinemez",
                    HttpStatus.CONFLICT);
        }

        User admin = getUser(adminId);

        userRepository.deleteById(id);

        activityLogService.log(admin, "USER_DELETE",
                admin.getFullName() + ", \"" + target.getFullName() + "\" kullanıcısını sildi");
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND));
    }
}
