package com.example.eduwheels.Config; // Adjust package name as needed

import com.example.eduwheels.Service.GoogleOAuth2UserService;
import com.example.eduwheels.Utils.JwtAuthenticationFilter;
import com.example.eduwheels.Utils.JwtUtil;
import com.example.eduwheels.Handler.CustomOAuth2SuccessHandler; // Ensure this handler is correctly implemented

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Remove Autowired fields if using constructor injection (recommended)
    private final GoogleOAuth2UserService googleOAuth2UserService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtUtil jwtUtil; // Consider if this is needed directly here or just in the filter
    private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;

    public static final String PENDING_OAUTH2_USER_ATTRIBUTE_KEY = "pendingOAuth2UserDetails";

    // Constructor Injection (Preferred over @Autowired fields)
    @Autowired
    public SecurityConfig(GoogleOAuth2UserService googleOAuth2UserService,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          JwtUtil jwtUtil,
                          CustomOAuth2SuccessHandler customOAuth2SuccessHandler) {
        this.googleOAuth2UserService = googleOAuth2UserService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtUtil = jwtUtil;
        this.customOAuth2SuccessHandler = customOAuth2SuccessHandler;
    }


    // --- Define PasswordEncoder Bean ---
    @Bean
    public PasswordEncoder passwordEncoder() {
        // Uses BCrypt by default, which is recommended
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
    // ---

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF as JWT is used (assuming stateless)
                .csrf(csrf -> csrf.disable())
                // Apply CORS configuration from the corsConfigurationSource bean
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Configure session management to be stateless
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // Define authorization rules
                .authorizeHttpRequests(authz -> authz
                        // Permit access to public endpoints without authentication
                        .requestMatchers(
                                "/users/login",
                                "/users/signup",
                                "/oauth2/**",      // For OAuth2 flow
                                "/login",          // Default Spring Security login page path if needed, or custom
                                "/complete-profile",
                                "/users/**",       // Consider if this is too broad
                                "/api/vehicles/**", // Allow access to vehicle info
                                "/api/bookings/**" // *** CORRECTED PATH *** Allow access to booking endpoints
                        ).permitAll()
                        // IMPORTANT: Explicitly permit OPTIONS requests for CORS preflight checks
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Any other request must be authenticated
                        .anyRequest().authenticated()
                )
                // Configure OAuth2 Login
                .oauth2Login(oauth2 -> oauth2
                                // Specify the login page (can be a frontend route)
                                .loginPage("/login") // Or your frontend login route e.g., "http://localhost:3000/login"
                                // Use the custom success handler after successful OAuth2 login
                                .successHandler(customOAuth2SuccessHandler)
                                // Define failure handling
                                .failureHandler((request, response, exception) -> {
                                    // Redirect to frontend login page with an error parameter
                                    String frontendLoginUrl = "http://localhost:3000/login?error=oauth_failed";
                                    response.sendRedirect(frontendLoginUrl);
                                })
                        // Optional: Configure user info endpoint if needed
                        // .userInfoEndpoint(userInfo -> userInfo
                        //     .userService(googleOAuth2UserService) // If using custom user service
                        // )
                )
                // Add the custom JWT filter before the standard UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                // Disable default form login
                .formLogin(form -> form.disable())
                // Disable HTTP Basic authentication
                .httpBasic(basic -> basic.disable());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow requests only from your React frontend origin
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // Ensure this matches your frontend URL
        // Specify allowed HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")); // Added PATCH
        // Allow all headers (you might want to restrict this in production)
        configuration.setAllowedHeaders(List.of("*")); // Allows common headers + Authorization
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        // How long the results of a preflight request can be cached
        configuration.setMaxAge(3600L); // Optional: Cache preflight response for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all paths
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
