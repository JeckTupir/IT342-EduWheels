package com.example.eduwheels.models

import com.google.gson.annotations.SerializedName

data class Vehicle(
    @SerializedName("vehicleId") val vehicleId: Long,
    @SerializedName("plateNumber") val plateNumber: String,
    @SerializedName("type") val type: String,
    @SerializedName("capacity") val capacity: Int,
    @SerializedName("status") val status: String,
    @SerializedName("photoPath") val photoPath: String?, // nullable
    @SerializedName("vehicleName") val vehicleName: String
)
