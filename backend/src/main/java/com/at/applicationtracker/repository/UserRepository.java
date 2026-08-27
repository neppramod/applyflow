package com.at.applicationtracker.repository;

import com.at.applicationtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Used by @AuthenticationPrincipal to find the logged-in user profile
    Optional<User> findByUsername(String username);
}
