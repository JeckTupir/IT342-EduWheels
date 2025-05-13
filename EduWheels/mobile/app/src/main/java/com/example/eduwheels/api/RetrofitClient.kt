package com.example.eduwheels.api

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {

    private const val BASE_URL = "https://it342-eduwheels.onrender.com/"
    // Update if needed

    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    // Direct access to Retrofit instance
    fun getInstance(): Retrofit = retrofit

    // Interface binding for API
    val bookingApi: RetrofitService by lazy {
        retrofit.create(RetrofitService::class.java)
    }
}
