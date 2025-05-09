package com.example.eduwheels.base

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.ImageView
import android.widget.PopupMenu
import android.widget.TextView
import android.widget.Toast
import com.example.eduwheels.R
import com.example.eduwheels.user.LogIn
import com.example.eduwheels.user.UserProfile
import com.example.eduwheels.util.SessionManager
import com.example.eduwheels.vehicle.Vehicles

open class BaseActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_base)

        val sessionManager = SessionManager(this)
        val firstName = sessionManager.getFirstName()
        val lastName = sessionManager.getLastName()

        val headerUserName = findViewById<TextView>(R.id.headerUserName)
        if (firstName.isNotEmpty() || lastName.isNotEmpty()) {
            headerUserName.text = "Hello, $firstName $lastName"
        } else {
            headerUserName.text = "Hello, User"
        }

        val menuIcon = findViewById<ImageView>(R.id.headerMenu)
        menuIcon.setOnClickListener { view ->
            val popup = PopupMenu(this, view)
            popup.menuInflater.inflate(R.menu.dropdown_menu, popup.menu)

            popup.setOnMenuItemClickListener { item ->
                when (item.itemId) {
                    R.id.menu_profile -> {
                        startActivity(Intent(this, UserProfile::class.java))
                        true
                    }
                    R.id.menu_vehicle -> {
                        startActivity(Intent(this, Vehicles::class.java))
                        true
                    }
                    R.id.menu_contact -> {
                        Toast.makeText(this, "Contact us clicked", Toast.LENGTH_SHORT).show()
                        true
                    }
                    R.id.menu_about -> {
                        Toast.makeText(this, "About us clicked", Toast.LENGTH_SHORT).show()
                        true
                    }
                    R.id.menu_help -> {
                        Toast.makeText(this, "Need help clicked", Toast.LENGTH_SHORT).show()
                        true
                    }
                    R.id.menu_logout -> {
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
    }

    protected fun setContentLayout(layoutResId: Int) {
        val contentFrame = findViewById<android.widget.FrameLayout>(R.id.contentFrame)
        layoutInflater.inflate(layoutResId, contentFrame, true)
    }
}
