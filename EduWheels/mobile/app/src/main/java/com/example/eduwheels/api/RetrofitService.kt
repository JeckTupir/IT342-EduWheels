package com.example.eduwheels.api

import com.example.eduwheels.booking.BookingRequest
import com.example.eduwheels.models.Booking
import com.example.eduwheels.models.User
import com.example.eduwheels.models.Vehicle
import com.example.eduwheels.user.UpdateProfileRequest
import com.google.android.gms.common.api.Response
import retrofit2.Call
import retrofit2.http.*

interface RetrofitService {

    @POST("/users/signup")
    fun registerUser(@Body user: User): Call<User>

    @POST("/users/login")
    fun loginUser(@Body credentials: Map<String, String>): Call<Map<String, Any>>

    @GET("/users")
    fun getAllUsers(): Call<List<User>>

    @GET("/users/{id}")
    fun getUserById(@Path("id") id: Long): Call<User>

    @PUT("users/{id}")
    fun updateUser(
        @Path("id") id: Long,
        @Body updateRequest: UpdateProfileRequest
    ): Call<User>


    @GET("/users/me")
    fun getCurrentUser(
        @Header("Authorization") token: String
    ): Call<Map<String, @JvmSuppressWildcards Any>>

    @PUT("users/me")
    fun updateUser(@Body updatedData: Map<String, String>): Call<Map<String, Any>>



    @GET("/api/vehicles")
    fun getAllVehicles(): Call<List<Vehicle>>


    @GET("/api/bookings")
    fun getAllBookings(): Call<List<Booking>>

    @GET("/api/bookings/{id}")
    fun getBookingById(@Path("id") id: Long): Call<Booking>

    @GET("/api/bookings/my")
    fun getMyBookings(@Header("Authorization") token: String): Call<List<Booking>>

    @POST("/api/bookings")
    fun createBooking(@Body bookingRequest: BookingRequest): Call<Booking>

    @PUT("/api/bookings/{id}")
    fun updateBooking(@Path("id") id: Long, @Body booking: Booking): Call<Booking>

    @DELETE("/api/bookings/{id}")
    fun deleteBooking(@Path("id") id: Long): Call<Void>

    //@POST("bookings/create")
    //suspend fun createBooking(@Body booking: Booking): Response<Booking>

}