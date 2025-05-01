package com.example.eduwheels.booking

import android.app.Activity
import android.os.Bundle
import android.widget.*
import com.example.eduwheels.R
import com.example.eduwheels.base.BaseActivity

class BookingForm : BaseActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentLayout(R.layout.activity_booking_form)

        val pickUpLocationInput = findViewById<EditText>(R.id.pickUpLocationInput)
        val pickUpTimeInput = findViewById<EditText>(R.id.pickUpTimeInput)
        val dropOffLocationInput = findViewById<EditText>(R.id.dropOffLocationInput)
        val dropOffTimeInput = findViewById<EditText>(R.id.dropOffTimeInput)
        val passengerCountInput = findViewById<EditText>(R.id.passengerCountInput)
        val confirmBookingBtn = findViewById<Button>(R.id.confirmBookingBtn)

        confirmBookingBtn.setOnClickListener {
            val pickUpLocation = pickUpLocationInput.text.toString().trim()
            val pickUpTime = pickUpTimeInput.text.toString().trim()
            val dropOffLocation = dropOffLocationInput.text.toString().trim()
            val dropOffTime = dropOffTimeInput.text.toString().trim()
            val passengers = passengerCountInput.text.toString().trim()

            if (pickUpLocation.isBlank() || pickUpTime.isBlank() || dropOffLocation.isBlank() || dropOffTime.isBlank() || passengers.isBlank()) {
                Toast.makeText(this, "Please fill in all fields!", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Booking Confirmed!", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
