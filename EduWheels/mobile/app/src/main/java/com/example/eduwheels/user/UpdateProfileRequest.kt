package com.example.eduwheels.user

data class UpdateProfileRequest(
    val firstName: String,
    val lastName: String,
    val username: String,
    val currentPassword: String,
    val newPassword: String
)
