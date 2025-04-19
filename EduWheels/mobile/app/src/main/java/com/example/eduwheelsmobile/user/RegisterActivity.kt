package com.example.eduwheelsmobile.user

import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.example.eduwheelsmobile.MainActivity
import com.example.eduwheels.model.User
import com.example.eduwheelsmobile.R
import com.example.eduwheelsmobile.api.RetrofitService
import retrofit2.*
import retrofit2.converter.gson.GsonConverterFactory


class RegisterActivity : AppCompatActivity() {

    private lateinit var retrofitService: RetrofitService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val emailInput = findViewById<EditText>(R.id.emailInput)
        val passInput = findViewById<EditText>(R.id.passwordInput)
        val registerBtn = findViewById<Button>(R.id.registerButton)

        retrofitService = Retrofit.Builder()
            .baseUrl("http://10.0.2.2:8080/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(RetrofitService::class.java)

        registerBtn.setOnClickListener {
            val schoolId = findViewById<EditText>(R.id.schoolIdInput).text.toString()
            val firstName = findViewById<EditText>(R.id.firstNameInput).text.toString()
            val lastName = findViewById<EditText>(R.id.lastNameInput).text.toString()
            val username = findViewById<EditText>(R.id.usernameInput).text.toString()
            val email = emailInput.text.toString()
            val password = passInput.text.toString()

            val user = User(
                schoolid = schoolId,
                firstName = firstName,
                lastName = lastName,
                username = username,
                email = email,
                password = password
            )

            retrofitService.registerUser(user).enqueue(object : Callback<User> {
                override fun onResponse(call: Call<User>, response: Response<User>) {
                    Toast.makeText(this@RegisterActivity, "Registered!", Toast.LENGTH_SHORT).show()
                    startActivity(Intent(this@RegisterActivity, LoginActivity::class.java))
                    finish()
                }

                override fun onFailure(call: Call<User>, t: Throwable) {
                    Toast.makeText(this@RegisterActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
        }
    }

}
