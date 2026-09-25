package com.kursmerkezi.randevu.service;

import com.kursmerkezi.randevu.dto.WeeklyProgramResponse;
import com.kursmerkezi.randevu.exception.ApiException;
import com.kursmerkezi.randevu.model.User;
import com.kursmerkezi.randevu.model.WeeklyProgram;
import com.kursmerkezi.randevu.repository.WeeklyProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private static final int MAX_PROGRAMS = 3;

    private final WeeklyProgramRepository programRepository;
    private final ActivityLogService activityLogService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;

    @Transactional
    public WeeklyProgramResponse upload(User admin, MultipartFile file) {
        if (programRepository.count() >= MAX_PROGRAMS) {
            throw new ApiException(
                    "En fazla " + MAX_PROGRAMS + " program yükleyebilirsiniz. Yeni birini eklemek için önce birini silin.",
                    HttpStatus.CONFLICT);
        }
        if (file.isEmpty()) {
            throw new ApiException("Dosya boş olamaz", HttpStatus.BAD_REQUEST);
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ApiException("Dosya boyutu 10MB'dan büyük olamaz", HttpStatus.BAD_REQUEST);
        }

        String contentType = file.getContentType();
        if (contentType == null || !(contentType.startsWith("image/") || contentType.equals("application/pdf"))) {
            throw new ApiException("Sadece resim veya PDF dosyası yükleyebilirsiniz", HttpStatus.BAD_REQUEST);
        }

        try {
            Path dir = Path.of(uploadDir);
            Files.createDirectories(dir);

            // Uzantı asla istemcinin gönderdiği dosya adından türetilmez (path traversal riski) —
            // sadece daha önce doğrulanmış content-type'a göre sabit bir listeden seçilir.
            String extension = switch (contentType) {
                case "image/jpeg" -> ".jpg";
                case "image/png" -> ".png";
                case "image/gif" -> ".gif";
                case "image/webp" -> ".webp";
                case "image/svg+xml" -> ".svg";
                case "application/pdf" -> ".pdf";
                default -> "";
            };
            String original = file.getOriginalFilename();
            String storedFileName = UUID.randomUUID() + extension;

            Path target = dir.resolve(storedFileName);
            file.transferTo(target);

            WeeklyProgram program = WeeklyProgram.builder()
                    .storedFileName(storedFileName)
                    .originalFileName(original != null ? original : storedFileName)
                    .contentType(contentType)
                    .uploadedBy(admin)
                    .uploadedAt(LocalDateTime.now())
                    .build();

            program = programRepository.save(program);

            activityLogService.log(admin, "PROGRAM_UPLOAD",
                    admin.getFullName() + ", yeni bir haftalık program yükledi (" + program.getOriginalFileName() + ")");

            return toResponse(program);
        } catch (IOException e) {
            throw new ApiException("Dosya kaydedilirken hata oluştu", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public List<WeeklyProgramResponse> listPrograms() {
        return programRepository.findAllByOrderByUploadedAtDesc().stream().map(this::toResponse).toList();
    }

    public Resource getFile(Long id) {
        WeeklyProgram program = getProgram(id);

        Path path = Path.of(uploadDir).resolve(program.getStoredFileName());
        if (!Files.exists(path)) {
            throw new ApiException("Dosya bulunamadı", HttpStatus.NOT_FOUND);
        }
        return new FileSystemResource(path);
    }

    public String getContentType(Long id) {
        return getProgram(id).getContentType();
    }

    @Transactional
    public void deleteProgram(Long id, User admin) {
        WeeklyProgram program = getProgram(id);

        Path path = Path.of(uploadDir).resolve(program.getStoredFileName());
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // dosya zaten yoksa veya silinemiyorsa kayıt yine de veritabanından kaldırılır
        }

        programRepository.delete(program);

        activityLogService.log(admin, "PROGRAM_DELETE",
                admin.getFullName() + ", \"" + program.getOriginalFileName() + "\" programını sildi");
    }

    private WeeklyProgram getProgram(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new ApiException("Program bulunamadı", HttpStatus.NOT_FOUND));
    }

    private WeeklyProgramResponse toResponse(WeeklyProgram program) {
        return new WeeklyProgramResponse(
                program.getId(), program.getOriginalFileName(), program.getContentType(),
                program.getUploadedBy().getFullName(), program.getUploadedAt()
        );
    }
}
