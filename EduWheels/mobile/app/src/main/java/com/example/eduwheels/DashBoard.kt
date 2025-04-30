package com.example.eduwheels

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.AdapterView
import android.widget.Button
import android.widget.ImageView
import android.widget.PopupMenu
import android.widget.Spinner
import android.widget.Toast
import com.example.eduwheels.user.LogIn
import com.example.eduwheels.user.UserProfile
import com.example.eduwheels.util.SessionManager
import com.example.eduwheels.vehicle.Vehicles

class DashBoard : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dash_board)

        val menuIcon = findViewById<ImageView>(R.id.headerMenu)

        menuIcon.setOnClickListener { view ->
            val popup = PopupMenu(this, view)
            popup.menuInflater.inflate(R.menu.dropdown_menu, popup.menu)

            popup.setOnMenuItemClickListener { item ->
                when (item.itemId) {
                    R.id.menu_profile -> {
                        val intent = Intent(this, UserProfile::class.java)
                        startActivity(intent)
                        true
                    }
                    R.id.menu_vehicle -> {
                        // startActivity(Intent(this, VehicleActivity::class.java))
                        true
                    }
                    R.id.menu_contact -> {
                        // Navigate to Contact
                        true
                    }
                    R.id.menu_about -> {
                        // Navigate to About Us
                        true
                    }
                    R.id.menu_help -> {
                        // Show help
                        true
                    }

                    R.id.menu_logout -> {
                        val sessionManager = SessionManager(this)
                        sessionManager.clearSession()

                        Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show()
                        val intent = Intent(this, LogIn::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                        true
                    }
                    else -> false
                }
            }

            popup.show()
        }

        val btnDashboard = findViewById<Button>(R.id.btndashboard)

        btnDashboard.setOnClickListener {
            // Replace LoginActivity with your actual target Activity
            val intent = Intent(this, Vehicles::class.java)
            startActivity(intent)
        }


    }
}
