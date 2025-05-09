package com.example.eduwheels.models

import androidx.compose.ui.semantics.Role


data class User(
    val id: Long,
    val email: String,
    val username: String,
    val firstName: String,
    val lastName: String,
    val role: String,
    val schoolid: String,
    val password: String
)

