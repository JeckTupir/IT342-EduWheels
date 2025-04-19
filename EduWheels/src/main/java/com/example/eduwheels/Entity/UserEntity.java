package com.example.eduwheels.Entity; // ✅ Ensure package is lowercase

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
@Entity
@Table(name = "tblusers")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userid;

    @Column(unique = true, nullable = false)
    private String schoolid;

    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String password;

    public UserEntity() {}

    public UserEntity(String schoolid, String firstName, String lastName, String username, String email, String password) {
        this.schoolid = schoolid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public Long getUserid() { return userid; }
    public void setUserid(Long userid) { this.userid = userid; }
    public String getSchoolid() { return schoolid; }
    public void setSchoolid(String schoolid) { this.schoolid = schoolid; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
