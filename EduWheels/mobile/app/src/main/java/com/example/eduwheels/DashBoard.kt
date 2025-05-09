package com.example.eduwheels

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import com.example.eduwheels.base.BaseActivity
import com.example.eduwheels.booking.BookingForm
import com.example.eduwheels.user.LogIn
import com.example.eduwheels.util.SessionManager
import com.example.eduwheels.vehicle.Vehicles

class DashBoard : BaseActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)


        setContentLayout(R.layout.activity_dash_board) // 👈 inject your page-specific layout here

        val btnDashboard = findViewById<Button>(R.id.btndashboard)
        btnDashboard.setOnClickListener {
            startActivity(Intent(this, BookingForm::class.java))
        }

        val btnViewVehicles = findViewById<Button>(R.id.btnViewVehicles)
        btnViewVehicles.setOnClickListener {
            startActivity(Intent(this, Vehicles::class.java))
        }
    }
}
