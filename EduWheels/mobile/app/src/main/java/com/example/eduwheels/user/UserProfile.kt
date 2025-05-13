package com.example.eduwheels.user

import android.os.Bundle
import android.widget.*
import com.example.eduwheels.R
import com.example.eduwheels.api.RetrofitService
import com.example.eduwheels.base.BaseActivity
import com.example.eduwheels.models.User
import com.example.eduwheels.util.SessionManager
//import com.google.android.gms.common.api.Response
import okhttp3.*
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.*
import retrofit2.Call
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.Response
import retrofit2.Callback




class UserProfile : BaseActivity() {

    private lateinit var retrofitService: RetrofitService
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentLayout(R.layout.activity_user_profile)

        // UI elements
        val firstNameField = findViewById<EditText>(R.id.firstNameInput)
        val lastNameField = findViewById<EditText>(R.id.lastNameInput)
        val schoolIdField = findViewById<EditText>(R.id.schoolIdInput)
        val usernameField = findViewById<EditText>(R.id.usernameInput)
        val roleField = findViewById<EditText>(R.id.roleInput)
        val currentPasswordField = findViewById<EditText>(R.id.currentPasswordInput)
        val newPasswordField = findViewById<EditText>(R.id.newPasswordInput)
        val reenterPasswordField = findViewById<EditText>(R.id.reenterPasswordInput)
        val updateButton = findViewById<Button>(R.id.btnUpdateProfile)

        // Setup session and network
        sessionManager = SessionManager(this)
        val user = sessionManager.getUser()
        val token = sessionManager.getToken()

        val client = OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .addInterceptor { chain ->
                val requestBuilder = chain.request().newBuilder()
                if (!token.isNullOrEmpty()) {
                    requestBuilder.addHeader("Authorization", "Bearer $token")
                }
                chain.proceed(requestBuilder.build())
            }
            .build()

        retrofitService = Retrofit.Builder()
            .baseUrl("https://it342-eduwheels.onrender.com/")
            .addConverterFactory(GsonConverterFactory.create())
            .client(client)
            .build()
            .create(RetrofitService::class.java)

        // Prefill fields
        firstNameField.setText(user.firstName)
        lastNameField.setText(user.lastName)
        schoolIdField.setText(user.schoolid)
        schoolIdField.isEnabled = false

        usernameField.setText(user.username)
        roleField.setText(user.role)
        roleField.isEnabled = false

        updateButton.setOnClickListener {
            val currentPass = currentPasswordField.text.toString().trim()
            val newPass = newPasswordField.text.toString().trim()
            val rePass = reenterPasswordField.text.toString().trim()

            if (currentPass.isBlank() || newPass.isBlank() || rePass.isBlank()) {
                Toast.makeText(this, "Please fill in all password fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (newPass != rePass) {
                Toast.makeText(this, "New passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Build updated user
            val updateRequest = UpdateProfileRequest(
                firstName = firstNameField.text.toString(),
                lastName = lastNameField.text.toString(),
                username = usernameField.text.toString(),
                currentPassword = currentPass,
                newPassword = newPass
            )

            retrofitService.updateUser(user.id, updateRequest).enqueue(object : Callback<User> {
                override fun onResponse(call: Call<User>, response: Response<User>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@UserProfile, "Profile updated!", Toast.LENGTH_SHORT).show()
                        currentPasswordField.setText("")
                        newPasswordField.setText("")
                        reenterPasswordField.setText("")
                    } else {
                        Toast.makeText(this@UserProfile, "Update failed: ${response.code()} - ${response.message()}", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<User>, t: Throwable) {
                    Toast.makeText(this@UserProfile, "Failed to update profile: ${t.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            })

        }
    }
}
