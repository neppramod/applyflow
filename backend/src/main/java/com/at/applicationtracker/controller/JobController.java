package com.at.applicationtracker.controller;

import com.at.applicationtracker.model.Job;
import com.at.applicationtracker.model.JobStatus;
import com.at.applicationtracker.model.User;
import com.at.applicationtracker.repository.JobRepository;
import com.at.applicationtracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    @Autowired
    private JobRepository repository;

    @Autowired
    private UserRepository userRepository;

    // Helper method to safely fallback to a default account if user details are missing or unauthenticated
    private synchronized User getAuthenticatedOrFallbackUser(UserDetails userDetails) {
        String username = (userDetails != null) ? userDetails.getUsername() : "guest_user";

        // 1. Initial look up check
        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        // 2. Synchronized double-check block protects against simultaneous parallel threads
        synchronized (this) {
            return userRepository.findByUsername(username).orElseGet(() -> {
                User newUser = new User(username, "$2a$10$eCqOOpD7V12.O.Y0E/C0BOe/0WkO46.6m91m9K3g1f9b9M8S8Y8K.");
                return userRepository.saveAndFlush(newUser); // Force flush to database immediately
            });
        }
    }

    @GetMapping
    public ResponseEntity<Page<Job>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = getAuthenticatedOrFallbackUser(userDetails);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(repository.findByUserOrderByIdDesc(user, pageable));
    }

    @PostMapping
    public ResponseEntity<Job> addJob(@RequestBody Job job, @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedOrFallbackUser(userDetails);
        job.setUser(user);
        job.setAppliedDate(LocalDate.now());
        job.setStatus(JobStatus.APPLIED);
        return ResponseEntity.ok(repository.save(job));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getExtendedAnalytics(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedOrFallbackUser(userDetails);

        Map<String, Object> data = new HashMap<>();
        data.put("companyCounts", repository.countApplicationsByCompany(user.getId()));
        data.put("dailyCounts", repository.countApplicationsByDay(user.getId()));
        return ResponseEntity.ok(data);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Job> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Job job = repository.findById(id).orElse(null);
        if (job == null) return ResponseEntity.notFound().build();

        String statusStr = payload.get("status");
        try {
            job.setStatus(JobStatus.valueOf(statusStr.toUpperCase().trim()));
            return ResponseEntity.ok(repository.save(job));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @RequestBody Job updatedJobDetails) {
        return repository.findById(id).map(existingJob -> {
            // Update all editable text fields
            existingJob.setCompany(updatedJobDetails.getCompany());
            existingJob.setRole(updatedJobDetails.getRole());
            existingJob.setLocation(updatedJobDetails.getLocation());
            existingJob.setLink(updatedJobDetails.getLink());
            existingJob.setDescription(updatedJobDetails.getDescription());

            // Save and commit changes to H2 file disk
            Job savedJob = repository.save(existingJob);
            return ResponseEntity.ok(savedJob);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    public void exportToExcel(HttpServletResponse response, @AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = getAuthenticatedOrFallbackUser(userDetails);
        List<Job> userJobs = repository.findByUserOrderByIdDesc(user, Pageable.unpaged()).getContent();

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=job_tracker_pipeline.csv");

        PrintWriter writer = response.getWriter();
        writer.println("Company,Role,Status,AppliedDate,Location,Link,Description");

        for (Job job : userJobs) {
            writer.println(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"",
                    job.getCompany() != null ? job.getCompany().replace("\"", "\"\"") : "",
                    job.getRole() != null ? job.getRole().replace("\"", "\"\"") : "",

                    // FIX: Safe enum string unboxing prevents printing literal "null" text
                    job.getStatus() != null ? job.getStatus().name() : "",

                    job.getAppliedDate() != null ? job.getAppliedDate().toString() : "",
                    job.getLocation() != null ? job.getLocation().replace("\"", "\"\"") : "",
                    job.getLink() != null ? job.getLink().replace("\"", "\"\"") : "",
                    job.getDescription() != null ? job.getDescription().replace("\"", "\"\"") : ""
            ));
        }
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importFromExcel(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal UserDetails userDetails) throws Exception {
        User user = getAuthenticatedOrFallbackUser(userDetails);
        BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()));
        String line;
        int importedCount = 0;
        int duplicateCount = 0;

        br.readLine(); // Skip header row

        while ((line = br.readLine()) != null) {
            String[] columns = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
            if (columns.length < 2) continue;

            String company = columns[0].replaceAll("^\"|\"$", "").trim();
            String role = columns[1].replaceAll("^\"|\"$", "").trim();
            String statusStr = columns[2].replaceAll("^\"|\"$", "").trim().toUpperCase(); // <-- FORCE UPPERCASE
            String dateStr = columns[3].replaceAll("^\"|\"$", "").trim();
            String location = columns.length > 4 ? columns[4].replaceAll("^\"|\"$", "").trim() : "";
            String link = columns.length > 5 ? columns[5].replaceAll("^\"|\"$", "").trim() : "";
            String desc = columns.length > 6 ? columns[6].replaceAll("^\"|\"$", "").trim() : "";

            boolean exists = repository.findByUserAndCompanyIgnoreCaseAndRoleIgnoreCaseAndLocationIgnoreCase(
                    user, company, role, location
            ).isPresent();

            if (exists) {
                duplicateCount++;
                continue;
            }

// FIX: Safely parse string into enum type using a try-catch fallback block
            JobStatus jobStatus;
            try {
                jobStatus = JobStatus.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                jobStatus = JobStatus.APPLIED; // Fallback default if cell contains invalid data
            }

            Job job = new Job(company, role, jobStatus, LocalDate.parse(dateStr), desc, link, location);
            job.setUser(user);
            repository.save(job);
            importedCount++;
        }

        Map<String, Object> report = new HashMap<>();
        report.put("successCount", importedCount);
        report.put("skippedDuplicates", duplicateCount);
        return ResponseEntity.ok(report);
    }
}