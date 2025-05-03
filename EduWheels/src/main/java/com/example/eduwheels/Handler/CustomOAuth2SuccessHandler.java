package com.example.eduwheels.Handler;

import com.example.eduwheels.Entity.UserEntity;
import com.example.eduwheels.Service.GoogleOAuth2UserService;
import com.example.eduwheels.Utils.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final GoogleOAuth2UserService googleOAuth2UserService;
    private final JwtUtil jwtUtil;

    public CustomOAuth2SuccessHandler(GoogleOAuth2UserService googleOAuth2UserService, JwtUtil jwtUtil) {
        this.googleOAuth2UserService = googleOAuth2UserService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        UserEntity user = googleOAuth2UserService.prepareOrFetchUser(oAuth2User);

        String frontendCallback = "https://it-342-edu-wheels.vercel.app/oauth2/callback";

        // If the user still needs to finish profile, signal the frontend to go to the form:
        if (user.getUserid() == null
                || user.getSchoolid() == null
                || user.getSchoolid().trim().isEmpty()) {

            HttpSession session = request.getSession();
            session.setAttribute(
                    "pendingOAuth2UserDetails",
                    Map.of(
                            "email", oAuth2User.getAttribute("email"),
                            "firstName", oAuth2User.getAttribute("given_name"),
                            "lastName", oAuth2User.getAttribute("family_name")
                    )
            );

            // Redirect to your unified callback with a pending flag
            String redirectUrl = frontendCallback + "?pending=true";
            response.sendRedirect(redirectUrl);
            return;
        }

        // Otherwise the user is fully onboarded → issue a token
        String token = jwtUtil.generateToken(user.getEmail(), user.getUsername());
        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);

        // Redirect to the same callback, passing the token
        String redirectUrl = frontendCallback + "?token=" + encodedToken;
        response.sendRedirect(redirectUrl);
    }
}
