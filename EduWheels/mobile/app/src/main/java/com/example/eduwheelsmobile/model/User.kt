package com.example.eduwheels.model

data class User(
    val userid: Long? = null,
    val schoolid: String,
    val firstName: String,
    val lastName: String,
    val username: String,
    val email: String,
    val password: String
)
