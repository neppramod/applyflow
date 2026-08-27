package com.at.applicationtracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String role;

    @Enumerated(EnumType.STRING)
    private JobStatus status;

    @Column(nullable = false)
    private LocalDate appliedDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String link;     // New Field (LinkedIn URL)
    private String location; // New Field (Optional location text e.g., "Remote", "New York")

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Default Constructor
    public Job() {}

    // Complete Parameter Constructor
    public Job(String company, String role, JobStatus status, LocalDate appliedDate, String description, String link, String location) {
        this.company = company;
        this.role = role;
        this.status = status;
        this.appliedDate = appliedDate;
        this.description = description;
        this.link = link;
        this.location = location;
    }

    // Getters and Setters for all fields...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }
    public LocalDate getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDate appliedDate) { this.appliedDate = appliedDate; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
