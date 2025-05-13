package com.example.eduwheels.booking

import android.os.Build
import android.os.Bundle
import android.widget.*
import androidx.annotation.RequiresApi
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.eduwheels.R
import com.example.eduwheels.api.RetrofitClient
import com.example.eduwheels.base.BaseActivity
import com.example.eduwheels.models.Vehicle
import com.example.eduwheels.vehicle.VehicleCarouselAdapter
import kotlinx.coroutines.*
import retrofit2.HttpException
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class BookingForm : BaseActivity() {

    private lateinit var etPickup: EditText
    private lateinit var etDropoff: EditText
    private lateinit var etPassengerCount: EditText
    private lateinit var etBookingDate: EditText
    private lateinit var etReturnDate: EditText
    private lateinit var btnBook: Button
    private lateinit var tvResponse: TextView
    private lateinit var vehicleCarousel: RecyclerView

    private var selectedVehicle: Vehicle? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentLayout(R.layout.activity_booking_form)

        etPickup = findViewById(R.id.etPickup)
        etDropoff = findViewById(R.id.etDropoff)
        etPassengerCount = findViewById(R.id.etPassengerCount)
        etBookingDate = findViewById(R.id.etBookingDate)
        etReturnDate = findViewById(R.id.etReturnDate)
        btnBook = findViewById(R.id.btnBook)
        tvResponse = findViewById(R.id.tvResponse)
        vehicleCarousel = findViewById(R.id.vehicleCarousel)

        vehicleCarousel.layoutManager = LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)

        etPassengerCount.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                val count = etPassengerCount.text.toString().toIntOrNull() ?: 0
                if (count > 0) fetchAndDisplayVehicles(count)
            }
        }

        btnBook.setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                submitBookingToDatabase()
            } else {
                Toast.makeText(this, "Requires Android O or higher", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun fetchAndDisplayVehicles(passengerCount: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val response = RetrofitClient.bookingApi.getAllVehicles().execute()
                if (response.isSuccessful) {
                    val vehicles = response.body() ?: emptyList()

                    // Only keep vehicles with capacity >= passengerCount
                    val filtered = vehicles.filter { it.capacity >= passengerCount }

                    withContext(Dispatchers.Main) {
                        if (filtered.isNotEmpty()) {
                            vehicleCarousel.adapter = VehicleCarouselAdapter(filtered) { vehicle: Vehicle ->
                                selectedVehicle = vehicle
                                Toast.makeText(
                                    this@BookingForm,
                                    "Selected: ${vehicle.vehicleName}",
                                    Toast.LENGTH_SHORT
                                ).show()
                            }

                        } else {
                            Toast.makeText(
                                this@BookingForm,
                                "No vehicles available for $passengerCount passengers",
                                Toast.LENGTH_SHORT
                            ).show()
                            vehicleCarousel.adapter = null
                            selectedVehicle = null
                        }
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(
                            this@BookingForm,
                            "🚫 Failed: ${response.code()} ${response.message()}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@BookingForm,
                        "Error loading vehicles: ${e.localizedMessage}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }



    @RequiresApi(Build.VERSION_CODES.O)
    private fun submitBookingToDatabase() {
        val pickup = etPickup.text.toString().trim()
        val dropoff = etDropoff.text.toString().trim()
        val passengerCount = etPassengerCount.text.toString().toIntOrNull() ?: 0
        val bookingDate = etBookingDate.text.toString().trim()
        val returnDate = etReturnDate.text.toString().trim()

        if (pickup.isEmpty() || dropoff.isEmpty() || bookingDate.isEmpty() || returnDate.isEmpty()) {
            Toast.makeText(this, "Please complete all fields", Toast.LENGTH_SHORT).show()
            return
        }

        val selected = selectedVehicle
        if (selected == null) {
            Toast.makeText(this, "Please select a vehicle", Toast.LENGTH_SHORT).show()
            return
        }

        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")
        val startDate = LocalDateTime.parse(bookingDate, formatter)
        val endDate = LocalDateTime.parse(returnDate, formatter)

        val bookingRequest = BookingRequest(
            startDate = startDate,
            endDate = endDate,
            numberOfPassengers = passengerCount,
            status = "Pending",
            plateNumber = selected.plateNumber,
            vehicleAvailableSeats = selected.capacity,
            pickUp = pickup,
            dropOff = dropoff
        )

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val response = RetrofitClient.bookingApi.createBooking(bookingRequest).execute()
                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        tvResponse.text = "🎉 Booking successful!"
                    } else {
                        tvResponse.text = "❌ Failed: ${response.code()} ${response.message()}"
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    tvResponse.text = "🚫 Error: ${e.localizedMessage}"
                }
            }
        }
    }

}
