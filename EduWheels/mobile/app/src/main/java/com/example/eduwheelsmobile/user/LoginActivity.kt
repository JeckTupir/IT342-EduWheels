package com.example.eduwheelsmobile.user

import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.eduwheelsmobile.MainActivity
import com.example.eduwheelsmobile.R
import com.example.eduwheelsmobile.api.RetrofitService
import com.example.eduwheelsmobile.model.LoginRequest
import com.example.eduwheels.model.User
import retrofit2.*
import retrofit2.converter.gson.GsonConverterFactory

class LoginActivity : AppCompatActivity() {

    private lateinit var retrofitService: RetrofitService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val emailInput = findViewById<EditText>(R.id.emailInput)
        val passwordInput = findViewById<EditText>(R.id.passwordInput)
        val loginBtn = findViewById<Button>(R.id.loginButton)
        val goToRegister = findViewById<TextView>(R.id.goToRegister)

        retrofitService = Retrofit.Builder()
            .baseUrl("http://10.0.2.2:8080/") // For Android emulator
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(RetrofitService::class.java)

        loginBtn.setOnClickListener {
            val email = emailInput.text.toString()
            val pass = passwordInput.text.toString()

            val loginRequest = LoginRequest(email, pass)

            val call: Call<User> = retrofitService.loginUser(loginRequest)

            call.enqueue(object : Callback<User> {
                override fun onResponse(call: Call<User>, response: Response<User>) {
                    val user = response.body()
                    if (user != null) {
                        val intent = Intent(this@LoginActivity, MainActivity::class.java)
                        intent.putExtra("username", user.username)
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@LoginActivity, "Invalid credentials", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<User>, t: Throwable) {
                    Toast.makeText(this@LoginActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
        }

        goToRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }
}
