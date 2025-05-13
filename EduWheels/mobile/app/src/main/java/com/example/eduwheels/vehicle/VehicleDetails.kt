package com.example.eduwheels.vehicle

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import com.bumptech.glide.Glide
import com.example.eduwheels.R
import com.example.eduwheels.base.BaseActivity
import com.example.eduwheels.booking.BookingForm

class VehicleDetails : BaseActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentLayout(R.layout.activity_vehicle_details)

        val brandInput = findViewById<TextView>(R.id.brandInput)
        val unitNameInput = findViewById<TextView>(R.id.unitNameInput)
        val capacityInput = findViewById<TextView>(R.id.capacityInput)
        val categoryInput = findViewById<TextView>(R.id.categoryInput)
        val statusInput = findViewById<TextView>(R.id.statusInput)
        val bookBtn = findViewById<Button>(R.id.bookNowBtn)
        val vehicleImage = findViewById<ImageView>(R.id.vehicleImage)

        // 🚀 Get data from Intent
        val vehicleType = intent.getStringExtra("vehicleType") ?: ""
        val vehicleName = intent.getStringExtra("vehicleName") ?: ""
        val capacity = intent.getIntExtra("capacity", 0)
        val plateNumber = intent.getStringExtra("plateNumber") ?: ""
        val status = intent.getStringExtra("status") ?: ""
        val photoPath = intent.getStringExtra("photoPath")

        brandInput.text = plateNumber
        unitNameInput.text = vehicleName
        capacityInput.text = capacity.toString()
        categoryInput.text = vehicleType
        statusInput.text = status

        if (!photoPath.isNullOrBlank()) {
            val imageUrl = "https://it342-eduwheels.onrender.com/api/vehicles/uploads/$photoPath"
            Glide.with(this)
                .load(imageUrl)
                .placeholder(R.drawable.bus)
                .into(vehicleImage)
        } else {
            vehicleImage.setImageResource(R.drawable.bus)
        }

        bookBtn.setOnClickListener {
            startActivity(Intent(this, BookingForm::class.java))
            finish()
        }
    }
}
