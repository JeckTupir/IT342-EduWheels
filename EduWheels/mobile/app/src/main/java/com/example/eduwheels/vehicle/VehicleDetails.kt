package com.example.eduwheels.vehicle

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import com.example.eduwheels.R
import com.example.eduwheels.booking.BookingForm

class VehicleDetails : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_vehicle_details)

        val brandInput = findViewById<TextView>(R.id.brandInput)
        val unitNameInput = findViewById<TextView>(R.id.unitNameInput)
        val capacityInput = findViewById<TextView>(R.id.capacityInput)
        val categoryInput = findViewById<TextView>(R.id.categoryInput)
        val statusInput = findViewById<TextView>(R.id.statusInput)
        val bookBtn = findViewById<Button>(R.id.bookNowBtn)

        // 🚀 Get data from Intent
        val vehicleType = intent.getStringExtra("vehicleType") ?: ""
        val vehicleName = intent.getStringExtra("vehicleName") ?: ""
        val capacity = intent.getIntExtra("capacity", 0)
        val plateNumber = intent.getStringExtra("plateNumber") ?: ""
        val status = intent.getStringExtra("status") ?: ""

        brandInput.text = plateNumber
        unitNameInput.text = vehicleName
        capacityInput.text = capacity.toString()
        categoryInput.text = vehicleType
        statusInput.text = status

        bookBtn.setOnClickListener {
            Toast.makeText(this, "Booking request sent!", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, BookingForm::class.java))
            finish()
        }
    }
}
