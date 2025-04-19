package com.example.eduwheelsmobile.api


import com.example.eduwheels.model.User
import com.example.eduwheelsmobile.model.LoginRequest
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface RetrofitService {

    @POST("/users/signup")
    fun registerUser(@Body user: User): Call<User>

    @POST("/users/login")
    fun loginUser(@Body loginRequest: LoginRequest): Call<User>

    @GET("/users")
    fun getUsers(): Call<List<User>>
}
