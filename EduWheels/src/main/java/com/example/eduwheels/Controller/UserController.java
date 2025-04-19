package com.example.eduwheels.Controller; // ✅ Fixed package name (lowercase)

import com.example.eduwheels.Entity.UserEntity; // ✅ Fixed import (lowercase)
import com.example.eduwheels.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping
    public List<UserEntity> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserEntity> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @PostMapping("/signup")  // Modified to /signup endpoint
    public ResponseEntity<UserEntity> signUp(@RequestBody UserEntity user) {
        try {
            // Check if user already exists
            if (userService.userExists(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(null);  // Return bad request if email exists
            }

            // Create the user
            UserEntity createdUser = userService.createUser(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);  // Return an error response if any issues
        }
    }

    @PostMapping("/login")
    public ResponseEntity<UserEntity> login(@RequestBody UserEntity loginUser) {
        Optional<UserEntity> user = userService.getAllUsers().stream()
                .filter(u -> u.getEmail().equals(loginUser.getEmail()) && u.getPassword().equals(loginUser.getPassword()))
                .findFirst();

        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {

        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}

