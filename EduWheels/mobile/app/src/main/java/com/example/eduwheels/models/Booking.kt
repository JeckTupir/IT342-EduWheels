package com.example.eduwheels.models

data class Booking(
    val id: Long? = null,
    val userID: Long,
    val vehicleID: Long,
    val startDate: String,
    val endDate: String,
    val numberOfPassengers: Int,
    val status: String,
    val plateNumber: String? = null,
    val vehicleAvailableSeats: Int? = null,
    val pickUp: String,
    val dropOff: String
)
