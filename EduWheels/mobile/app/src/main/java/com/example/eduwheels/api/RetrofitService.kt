package com.example.eduwheels.api

import com.example.eduwheels.models.User
import com.example.eduwheels.models.Vehicle
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
    fun getUserById(@Path("id") id: String?): Call<User>

    @GET("/users/school/{schoolid}")
    fun getUserBySchoolId(@Path("schoolid") schoolid: String): Call<User>

    @PUT("/users/{id}")
    fun updateUser(
        @Path("id") id: String?,
        @Body updatedUser: User
    ): Call<User>

    @GET("/api/vehicles")
    fun getAllVehicles(): Call<List<Vehicle.Vehicle>>
}
