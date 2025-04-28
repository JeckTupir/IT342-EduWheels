package com.example.eduwheels.Service; // Adjust package name as needed

import com.example.eduwheels.Entity.UserEntity;
import com.example.eduwheels.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import Transactional

import java.util.Optional;

@Service
public class GoogleOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Fetches an existing user by email or prepares a transient (unsaved)
     * UserEntity object for a new user based on OAuth2 details.
     * Does NOT save new users to the database directly during this step.
     * This is called by the SecurityConfig successHandler.
     *
     * @param oAuth2User The user details provided by Google.
     * @return UserEntity (either persisted from DB or transient/unsaved).
     */
    @Transactional(readOnly = true) // Use read-only transaction for fetching/preparing
    public UserEntity prepareOrFetchUser(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");

        // Check if user already exists in the database
        Optional<UserEntity> existingUserOpt = userRepository.findByEmail(email);

        if (existingUserOpt.isPresent()) {
            // User exists, return the existing entity from the database
            UserEntity existingUser = existingUserOpt.get();
            // Optional: Consider if you need to update names based on Google profile here.
            // If so, you might need a separate @Transactional method or adjust this one.
            return existingUser;
        } else {
            // User does not exist, create a transient (in-memory, unsaved) entity
            // This object will be used to populate the session attributes.
            UserEntity transientUser = new UserEntity();
            transientUser.setEmail(email);
            transientUser.setFirstName(firstName);
            transientUser.setLastName(lastName);
            transientUser.setRole("User");
            // Generate a username (can be refined later if needed)
            transientUser.setUsername(firstName != null && lastName != null ? firstName + lastName : email);
            transientUser.setPassword(""); // No password needed for OAuth2 users
            // DO NOT set an ID. DO NOT save here. `schoolid` remains null.
            return transientUser; // Return the unsaved, transient object
        }
    }

    /**
     * Saves a complete UserEntity profile to the database.
     * This is called by the UserController's /complete-profile endpoint
     * after the user provides their school ID.
     *
     * @param user The complete UserEntity object (including schoolid) to save.
     * @return The saved UserEntity with its generated ID.
     */
    @Transactional // Use default transaction for saving
    public UserEntity saveUserProfile(UserEntity user) {
        // Add any final validation or logic before saving if necessary
        // Ensure the user doesn't already exist before saving (though UserController should check too)
        if (user.getUserid() == null && userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalStateException("Cannot save new user, email already exists: " + user.getEmail());
        }
        return userRepository.save(user);
    }

    /**
     * Fetches a user by email. Used by UserController's /me endpoint.
     * @param email The email to search for.
     * @return Optional containing the UserEntity if found.
     */
    @Transactional(readOnly = true)
    public Optional<UserEntity> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
