package com.example.eduwheels

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import com.example.eduwheels.user.LogIn

class Landing : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_landing)

        val btnGetStarted = findViewById<Button>(R.id.btnBookNow)

        btnGetStarted.setOnClickListener {
            // Replace LoginActivity with your actual target Activity
            val intent = Intent(this, LogIn::class.java)
            startActivity(intent)
        }
    }
}
