package com.at.applicationtracker.repository;

import com.at.applicationtracker.model.Job;
import com.at.applicationtracker.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // FIX 1: Map this paginated search scope directly to the current isolated user profile
    Page<Job> findByUserOrderByIdDesc(User user, Pageable pageable);

    // Used for idempotent row verification checking during Excel imports
    Optional<Job> findByUserAndCompanyIgnoreCaseAndRoleIgnoreCaseAndLocationIgnoreCase(
            User user, String company, String role, String location
    );

    // FIX 2: Ensure method name matches repository.countApplicationsByCompany()
    @Query(value = "SELECT company AS company, COUNT(*) AS count FROM jobs WHERE user_id = :userId GROUP BY company", nativeQuery = true)
    List<Map<String, Object>> countApplicationsByCompany(@Param("userId") Long userId);

    // FIX 3: Ensure method name matches repository.countApplicationsByDay()
    @Query(value = "SELECT applied_date AS date, COUNT(*) AS count FROM jobs WHERE user_id = :userId GROUP BY applied_date ORDER BY applied_date DESC", nativeQuery = true)
    List<Map<String, Object>> countApplicationsByDay(@Param("userId") Long userId);
}