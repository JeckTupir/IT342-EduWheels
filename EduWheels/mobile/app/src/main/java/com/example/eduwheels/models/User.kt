package com.example.eduwheels.models

data class User(
    val userid: Long?,
    val schoolid: String,
    val firstName: String,
    val lastName: String,
    val username: String,
    val email: String,
    val password: String
)
