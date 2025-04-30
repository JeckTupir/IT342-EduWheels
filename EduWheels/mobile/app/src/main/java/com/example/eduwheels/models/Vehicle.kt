package com.example.eduwheels.models

import com.google.gson.annotations.SerializedName

class Vehicle {
    data class Vehicle(
        @SerializedName("vehicleId") val vehicleId: Long,
        @SerializedName("plateNumber") val plateNumber: String,
        @SerializedName("type") val type: String,
        @SerializedName("capacity") val capacity: Int,
        @SerializedName("status") val status: String,
        @SerializedName("photoPath") val photoPath: String?,  // Nullable because some vehicles might not have photos
        @SerializedName("vehicleName") val vehicleName: String
    )
}
