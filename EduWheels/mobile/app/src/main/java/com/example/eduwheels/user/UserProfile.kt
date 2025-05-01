package com.example.eduwheels.user

import android.os.Bundle
import android.util.Log
import android.widget.*
import com.example.eduwheels.R
import com.example.eduwheels.api.RetrofitService
import com.example.eduwheels.base.BaseActivity
import com.example.eduwheels.models.User
import com.example.eduwheels.util.SessionManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit

class UserProfile : BaseActivity() {

    private lateinit var retrofitService: RetrofitService
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentLayout(R.layout.activity_user_profile)

        val firstNameField = findViewById<EditText>(R.id.firstNameInput)
        val lastNameField = findViewById<EditText>(R.id.lastNameInput)
        val schoolIdField = findViewById<EditText>(R.id.schoolIdInput)
        val usernameField = findViewById<EditText>(R.id.usernameInput)
        val oldPasswordField = findViewById<EditText>(R.id.oldPasswordInput)
        val newPasswordField = findViewById<EditText>(R.id.newPasswordInput)
        val reenterPasswordField = findViewById<EditText>(R.id.reenterPasswordInput)
        val updateButton = findViewById<Button>(R.id.btnUpdateProfile)

        sessionManager = SessionManager(this)
        val userId = sessionManager.getUserId()

        if (userId == -1L) {
            Toast.makeText(this, "No User ID found. Please login again.", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        Log.d("UserProfile", "Session User ID: $userId")

        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .build()

        retrofitService = Retrofit.Builder()
            .baseUrl("http://192.168.74.208:8080/")
            .addConverterFactory(GsonConverterFactory.create())
            .client(client)
            .build()
            .create(RetrofitService::class.java)

        // 🔍 Fetch and display user data
        retrofitService.getUserBySchoolId(userId.toString())
            .enqueue(object : Callback<User> {
                override fun onResponse(call: Call<User>, response: Response<User>) {
                    if (response.isSuccessful) {
                        response.body()?.let { user ->
                            firstNameField.setText(user.firstName)
                            lastNameField.setText(user.lastName)
                            schoolIdField.setText(user.schoolid)
                            usernameField.setText(user.username)
                            oldPasswordField.setText("")
                            newPasswordField.setText("")
                            reenterPasswordField.setText("")
                        }
                    } else {
                        Toast.makeText(this@UserProfile, "Failed to load profile", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<User>, t: Throwable) {
                    Toast.makeText(this@UserProfile, "Failed to load user data", Toast.LENGTH_SHORT).show()
                }
            })

        // 🔁 Handle profile update
        updateButton.setOnClickListener {
            val oldPass = oldPasswordField.text.toString().trim()
            val newPass = newPasswordField.text.toString().trim()
            val rePass = reenterPasswordField.text.toString().trim()

            if (oldPass.isBlank() || newPass.isBlank() || rePass.isBlank()) {
                Toast.makeText(this, "Please complete all password fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (newPass != rePass) {
                Toast.makeText(this, "New passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            retrofitService.getUserBySchoolId(userId.toString())
                .enqueue(object : Callback<User> {
                    override fun onResponse(call: Call<User>, response: Response<User>) {
                        val user = response.body()
                        if (user != null && user.password == oldPass) {
                            val updatedUser = user.copy(
                                firstName = firstNameField.text.toString(),
                                lastName = lastNameField.text.toString(),
                                username = usernameField.text.toString(),
                                password = newPass
                            )

                            retrofitService.updateUser(user.userid.toString(), updatedUser)
                                .enqueue(object : Callback<User> {
                                    override fun onResponse(call: Call<User>, response: Response<User>) {
                                        Toast.makeText(this@UserProfile, "Profile updated successfully!", Toast.LENGTH_SHORT).show()
                                        oldPasswordField.setText("")
                                        newPasswordField.setText("")
                                        reenterPasswordField.setText("")
                                    }

                                    override fun onFailure(call: Call<User>, t: Throwable) {
                                        Toast.makeText(this@UserProfile, "Failed to update profile", Toast.LENGTH_SHORT).show()
                                    }
                                })
                        } else {
                            Toast.makeText(this@UserProfile, "Old password incorrect", Toast.LENGTH_SHORT).show()
                        }
                    }

                    override fun onFailure(call: Call<User>, t: Throwable) {
                        Toast.makeText(this@UserProfile, "Failed to fetch user", Toast.LENGTH_SHORT).show()
                    }
                })
        }
    }
}
