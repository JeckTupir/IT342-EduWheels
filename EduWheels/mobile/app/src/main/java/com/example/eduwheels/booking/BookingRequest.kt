package com.example.eduwheels.booking

import java.time.LocalDateTime

data class BookingRequest(
    val startDate: LocalDateTime,
    val endDate: LocalDateTime,
    val numberOfPassengers: Int,
    val status: String,
    val plateNumber: String,
    val vehicleAvailableSeats: Int,
    val pickUp: String,
    val dropOff: String
)
