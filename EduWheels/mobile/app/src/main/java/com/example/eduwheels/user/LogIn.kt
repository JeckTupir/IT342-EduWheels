package com.example.eduwheels.user

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.*
import com.example.eduwheels.DashBoard
import com.example.eduwheels.R
import com.example.eduwheels.util.SessionManager
import kotlinx.coroutines.*
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class LogIn : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_log_in)

        val schoolIdField = findViewById<EditText>(R.id.schoolId)
        val passwordField = findViewById<EditText>(R.id.password)
        val loginButton = findViewById<Button>(R.id.loginButton)
        val signUpText = findViewById<TextView>(R.id.signUpLink)

        loginButton.setOnClickListener {
            val schoolId = schoolIdField.text.toString().trim()
            val password = passwordField.text.toString().trim()

            if (schoolId.isBlank() || password.isBlank()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            } else {
                loginUser(schoolId, password)
            }
        }

        signUpText.setOnClickListener {
            startActivity(Intent(this, Register::class.java))
        }
    }

    private fun loginUser(schoolId: String, password: String) {
        val loginJson = JSONObject().apply {
            put("schoolid", schoolId)
            put("password", password)
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = URL("http://192.168.74.208:8080/users/login")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.doOutput = true

                connection.outputStream.bufferedWriter().use {
                    it.write(loginJson.toString())
                }

                val responseCode = connection.responseCode
                val responseBody = connection.inputStream.bufferedReader().readText()

                runOnUiThread {
                    if (responseCode == HttpURLConnection.HTTP_OK) {
                        try {
                            val responseJson = JSONObject(responseBody)

                            // NEW: get "token" and "user"
                            val token = responseJson.getString("token")
                            val userJson = responseJson.getJSONObject("user")

                            val sessionManager = SessionManager(this@LogIn)

                            sessionManager.saveUserSession(
                                userId = userJson.getLong("id"),
                                schoolId = userJson.getString("schoolid"),
                                email = userJson.getString("email"),
                                name = userJson.getString("name"),
                                token = token // Save the JWT token
                            )

                            Toast.makeText(this@LogIn, "Login successful!", Toast.LENGTH_SHORT).show()
                            startActivity(Intent(this@LogIn, DashBoard::class.java))
                            finish()

                        } catch (e: Exception) {
                            Toast.makeText(this@LogIn, "Parsing error: ${e.message}", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        Toast.makeText(this@LogIn, "Login failed: $responseBody", Toast.LENGTH_LONG).show()
                    }
                }

                connection.disconnect()
            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread {
                    Toast.makeText(this@LogIn, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
