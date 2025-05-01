    package com.example.eduwheels.Controller;

    import com.example.eduwheels.Config.SecurityConfig;
    import com.example.eduwheels.Entity.UserEntity;
    import com.example.eduwheels.Repository.UserRepository;
    import com.example.eduwheels.Service.GoogleOAuth2UserService;
    import com.example.eduwheels.Service.UserService;
    import com.example.eduwheels.Utils.JwtAuthenticationFilter;
    import com.example.eduwheels.Utils.JwtUtil;
    import jakarta.servlet.http.HttpServletRequest;
    import jakarta.servlet.http.HttpServletResponse;
    import jakarta.servlet.http.HttpSession;
    import jakarta.servlet.http.Cookie;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
    import org.springframework.security.core.Authentication;
    import org.springframework.security.core.context.SecurityContextHolder;
    import org.springframework.security.core.userdetails.UserDetails;
    import org.springframework.security.oauth2.core.user.OAuth2User;
    import org.springframework.web.bind.annotation.*;
    import org.springframework.security.crypto.password.PasswordEncoder;


    import java.util.HashMap;
    import java.util.List;
    import java.util.Map;
    import java.util.Optional;

    @RestController
    @RequestMapping("/users")
    public class UserController {

        @Autowired
        private GoogleOAuth2UserService googleOAuth2UserService;

        @Autowired
        private UserService userService;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private JwtUtil jwtUtil;

        public static class CompleteProfileRequest {
            private String schoolid;
            private String password;

            public String getSchoolid() { return schoolid; }
            public void setSchoolid(String schoolid) { this.schoolid = schoolid; }

            public String getPassword() { return password; }
            public void setPassword(String password) { this.password = password; }
        }

        @PostMapping("/complete-profile")
        public ResponseEntity<?> completeProfile(
                @RequestBody CompleteProfileRequest requestData,
                HttpSession session,
                HttpServletRequest request,
                HttpServletResponse response) {

            @SuppressWarnings("unchecked")
            Map<String, String> pending = (Map<String, String>)
                    session.getAttribute(SecurityConfig.PENDING_OAUTH2_USER_ATTRIBUTE_KEY);
            if (pending == null || pending.get("email") == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Missing user information. Please retry Google login."));
            }

            String rawSchoolId = Optional.ofNullable(requestData.getSchoolid()).orElse("").replace("-", "");
            if (rawSchoolId.length() != 9) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid School ID format."));
            }

            String rawPassword = Optional.ofNullable(requestData.getPassword()).orElse("");
            if (rawPassword.length() < 8) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Password must be at least 8 characters."));
            }

            try {
                String email = pending.get("email");
                if (userRepository.findByEmail(email).isPresent()) {
                    session.removeAttribute(SecurityConfig.PENDING_OAUTH2_USER_ATTRIBUTE_KEY);
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(Map.of("message", "User already exists."));
                }

                // Build and save the new user
                UserEntity newUser = new UserEntity();
                newUser.setEmail(email);
                newUser.setFirstName(pending.get("firstName"));
                newUser.setLastName(pending.get("lastName"));
                String username = pending.getOrDefault("username", pending.get("firstName") + pending.get("lastName"));
                newUser.setUsername(username);
                newUser.setPassword(passwordEncoder.encode(rawPassword));
                newUser.setSchoolid(rawSchoolId);

                googleOAuth2UserService.saveUserProfile(newUser);
                session.removeAttribute(SecurityConfig.PENDING_OAUTH2_USER_ATTRIBUTE_KEY);

                // Generate JWT including email & username
                String token = jwtUtil.generateToken(newUser.getEmail(), newUser.getUsername());

                // Prepare response payload
                Map<String, Object> resp = new HashMap<>();
                resp.put("token", token);  // ← NEW: return the JWT
                resp.put("message", "Profile completed successfully.");

                Map<String, Object> userDetails = new HashMap<>();
                userDetails.put("id", newUser.getUserid());
                userDetails.put("name", newUser.getFirstName() + " " + newUser.getLastName());
                userDetails.put("email", newUser.getEmail());
                userDetails.put("username", newUser.getUsername());         // ← NEW
                userDetails.put("schoolid", newUser.getSchoolid());
                userDetails.put("isProfileComplete", true);

                resp.put("user", userDetails);

                return ResponseEntity.ok(resp);

            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Error saving profile. Please try again."));
            }
        }

        @GetMapping("/me")
        public ResponseEntity<?> getCurrentUser(HttpSession session) {
            @SuppressWarnings("unchecked")
            Map<String, String> pending = (Map<String, String>)
                    session.getAttribute(SecurityConfig.PENDING_OAUTH2_USER_ATTRIBUTE_KEY);
            if (pending != null && pending.get("email") != null) {
                Map<String, Object> details = new HashMap<>();
                details.put("id", null);
                details.put("email", pending.get("email"));
                details.put("firstName", pending.get("firstName"));
                details.put("lastName", pending.get("lastName"));
                details.put("schoolid", "");
                details.put("isProfileComplete", false);
                return ResponseEntity.ok(details);
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()
                    && !"anonymousUser".equals(auth.getPrincipal())) {

                String email = null;

                if (auth.getPrincipal() instanceof OAuth2User oauth2User) {
                    email = oauth2User.getAttribute("email");
                } else if (auth.getPrincipal() instanceof UserDetails userDetails) {
                    email = userDetails.getUsername();
                }

                if (email != null) {
                    Optional<UserEntity> userOpt = googleOAuth2UserService.findByEmail(email);
                    if (userOpt.isPresent()) {
                        UserEntity user = userOpt.get();
                        Map<String, Object> details = new HashMap<>();
                        details.put("id", user.getUserid());
                        details.put("name", user.getFirstName() + " " + user.getLastName());
                        details.put("email", user.getEmail());
                        details.put("firstName", user.getFirstName());
                        details.put("lastName", user.getLastName());
                        details.put("schoolid", user.getSchoolid() != null ? user.getSchoolid() : "");
                        details.put("isProfileComplete", user.getSchoolid() != null && !user.getSchoolid().isBlank());
                        return ResponseEntity.ok(details);
                    }
                }
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not authenticated."));
        }

        @PutMapping("/me")
        public ResponseEntity<?> updateUser(@RequestBody Map<String, String> updatedData, Authentication authentication) {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated."));
            }

            String email = null;
            if (authentication.getPrincipal() instanceof OAuth2User) {
                email = ((OAuth2User) authentication.getPrincipal()).getAttribute("email");
            } else if (authentication.getPrincipal() instanceof UserDetails) {
                email = ((UserDetails) authentication.getPrincipal()).getUsername();
            }

            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Could not determine user email."));
            }

            Optional<UserEntity> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found."));
            }

            UserEntity user = userOptional.get();

            if (updatedData.containsKey("firstName")) {
                user.setFirstName(updatedData.get("firstName"));
            }
            if (updatedData.containsKey("lastName")) {
                user.setLastName(updatedData.get("lastName"));
            }
            if (updatedData.containsKey("username")) {
                user.setUsername(updatedData.get("username"));
            }
            if (updatedData.containsKey("schoolId")) {
                String rawSchoolId = updatedData.get("schoolId").replace("-", "");
                if (rawSchoolId.length() != 9) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Invalid School ID format."));
                }
                user.setSchoolid(rawSchoolId);
            }

            try {
                userRepository.save(user);
                Map<String, Object> userDetails = new HashMap<>();
                userDetails.put("id", user.getUserid());
                userDetails.put("name", user.getFirstName() + " " + user.getLastName());
                userDetails.put("email", user.getEmail());
                userDetails.put("firstName", user.getFirstName());
                userDetails.put("lastName", user.getLastName());
                userDetails.put("schoolId", user.getSchoolid());
                userDetails.put("username", user.getUsername());
                return ResponseEntity.ok(Map.of("message", "Profile updated successfully.", "user", userDetails));
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error updating profile."));
            }
        }

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

        @PostMapping("/signup")
        public ResponseEntity<?> signUp(@RequestBody UserEntity user) {
            if (userService.userExists(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Email already in use"));
            }
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Password is required for standard signup."));
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            if (user.getSchoolid() == null || user.getSchoolid().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "School ID is required for standard signup."));
            }
            user.setSchoolid(user.getSchoolid().replace("-", ""));

            if (userRepository.findBySchoolid(user.getSchoolid()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "School ID already in use"));
            }

            UserEntity created = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        }

        @PostMapping("/login")
        public ResponseEntity<?> loginUser(@RequestBody Map<String, String> payload) {
            String schoolid = payload.get("schoolid");
            String password = payload.get("password");

            Optional<UserEntity> userOpt = userRepository.findBySchoolid(schoolid);
            if (userOpt.isPresent()) {
                UserEntity user = userOpt.get();
                if (passwordEncoder.matches(password, user.getPassword())) {

                    // 1) Issue a JWT embedding both email & username:
                    String token = jwtUtil.generateToken(user.getEmail(), user.getUsername());

                    // 2) Build the response with token + user details
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("token", token);                                // ← NEW
                    resp.put("user", Map.of(
                            "id", user.getUserid(),
                            "name", user.getFirstName() + " " + user.getLastName(),
                            "email", user.getEmail(),
                            "username", user.getUsername(),                 // ← NEW
                            "schoolid", user.getSchoolid(),
                            "isProfileComplete", user.getSchoolid() != null && !user.getSchoolid().isBlank()
                    ));
                    return ResponseEntity.ok(resp);
                }
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        }

        @GetMapping("/school/{schoolid}")
        public ResponseEntity<UserEntity> getUserBySchoolId(@PathVariable String schoolid) {
            return userRepository.findBySchoolid(schoolid)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        }

    }