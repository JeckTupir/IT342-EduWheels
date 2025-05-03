package com.example.eduwheels.models

data class User(
    val userid: Long? = null,
    val schoolid: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val username: String,
    val email: String,
    val password: String
)
