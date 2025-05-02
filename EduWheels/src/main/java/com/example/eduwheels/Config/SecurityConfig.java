package com.example.eduwheels.Config; // Adjust package name as needed

import com.example.eduwheels.Service.GoogleOAuth2UserService;
import com.example.eduwheels.Utils.JwtAuthenticationFilter;
import com.example.eduwheels.Utils.JwtUtil;
import com.example.eduwheels.Handler.CustomOAuth2SuccessHandler; // Ensure this handler is correctly implemented

import jakarta.servlet.http.HttpServletResponse;
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
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(
                                "/users/login",
                                "/users/signup",
                                "/oauth2/**",
                                "/login",
                                "/complete-profile",
                                "/api/vehicles/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()

                        // Allow read access to bookings, but require auth for write operations
                        .requestMatchers(HttpMethod.GET, "/api/bookings/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/bookings/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/bookings/**").authenticated()

                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").authenticated()


                        // Fallback
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Unauthorized\"}");
                        })
                )
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/login")
                        .successHandler(customOAuth2SuccessHandler)
                        .failureHandler((request, response, exception) -> {
                            response.sendRedirect("http://localhost:3000/login?error=oauth_failed");
                        })
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form.disable())
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
