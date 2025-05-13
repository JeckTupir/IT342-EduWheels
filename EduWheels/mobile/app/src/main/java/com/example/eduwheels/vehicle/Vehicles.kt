package com.example.eduwheels.vehicle

import android.os.Bundle
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.eduwheels.R
import com.example.eduwheels.adapter.VehicleAdapter
import com.example.eduwheels.api.RetrofitService
import com.example.eduwheels.base.BaseActivity
import com.example.eduwheels.models.Vehicle
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class Vehicles : BaseActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var retrofitService: RetrofitService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentLayout(R.layout.activity_vehicles)

        recyclerView = findViewById(R.id.vehicleRecycler)
        recyclerView.layoutManager = LinearLayoutManager(this)

        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .build()

        retrofitService = Retrofit.Builder()
            .baseUrl("https://it342-eduwheels.onrender.com/")
            .addConverterFactory(GsonConverterFactory.create())
            .client(client)
            .build()
            .create(RetrofitService::class.java)

        fetchVehicles()
    }

    private fun fetchVehicles() {
        retrofitService.getAllVehicles().enqueue(object : Callback<List<Vehicle>> {
            override fun onResponse(call: Call<List<Vehicle>>, response: Response<List<Vehicle>>) {
                if (response.isSuccessful) {
                    val vehicleList = response.body() ?: emptyList()
                    recyclerView.adapter = VehicleAdapter(vehicleList)
                } else {
                    Toast.makeText(this@Vehicles, "Failed to load vehicles", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<Vehicle>>, t: Throwable) {
                Toast.makeText(this@Vehicles, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }
}
