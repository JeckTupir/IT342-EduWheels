package com.example.eduwheels.user

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.*
import com.example.eduwheels.R
import kotlinx.coroutines.*
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class Register : Activity() {

    private val existingUsernames = mutableListOf<String>()
    private val existingEmails = mutableListOf<String>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val firstName = findViewById<EditText>(R.id.firstName)
        val lastName = findViewById<EditText>(R.id.lastName)
        val repass = findViewById<EditText>(R.id.repassword)
        val schoolID = findViewById<EditText>(R.id.schoolId)
        val username = findViewById<EditText>(R.id.username)
        val password = findViewById<EditText>(R.id.password)
        val email = findViewById<EditText>(R.id.email)
        val roleSpinner = findViewById<Spinner>(R.id.roleSpinner)

        val registerButton = findViewById<Button>(R.id.registerButton)
        val loginLink = findViewById<TextView>(R.id.loginRedirectText)

        // Populate roles (you can customize this list)
        val roles = listOf("Student", "Teacher")
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, roles)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        roleSpinner.adapter = adapter

        registerButton.isEnabled = false

        val fields = listOf(firstName, lastName, repass, schoolID, username, password, email)

        fun validateFields() {
            registerButton.isEnabled = fields.all { it.text.toString().isNotBlank() }
        }

        fields.forEach {
            it.addTextChangedListener(object : TextWatcher {
                override fun afterTextChanged(s: Editable?) = validateFields()
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            })
        }

        registerButton.setOnClickListener {
            val uname = username.text.toString()
            val mail = email.text.toString()
            val selectedRole = roleSpinner.selectedItem.toString()

            when {
                existingUsernames.contains(uname) -> {
                    Toast.makeText(this, "Username already taken", Toast.LENGTH_SHORT).show()
                }
                existingEmails.contains(mail) -> {
                    Toast.makeText(this, "Email already registered", Toast.LENGTH_SHORT).show()
                }
                password.text.toString() != repass.text.toString() -> {
                    Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                }
                else -> {
                    saveUserToDB(
                        uname,
                        password.text.toString(),
                        firstName.text.toString(),
                        lastName.text.toString(),
                        schoolID.text.toString(),
                        mail,
                        selectedRole
                    )
                }
            }
        }

        loginLink.setOnClickListener {
            startActivity(Intent(this, LogIn::class.java))
            finish()
        }

        fetchExistingUsers()
    }

    private fun fetchExistingUsers() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = URL("https://it342-eduwheels.onrender.com/users")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"

                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                    val response = connection.inputStream.bufferedReader().readText()
                    val usersArray = JSONArray(response)

                    for (i in 0 until usersArray.length()) {
                        val user = usersArray.getJSONObject(i)
                        existingUsernames.add(user.getString("username"))
                        existingEmails.add(user.getString("email"))
                    }
                }

                connection.disconnect()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun saveUserToDB(
        username: String,
        password: String,
        firstName: String,
        lastName: String,
        schoolID: String,
        email: String,
        role: String
    ) {
        val userJson = JSONObject().apply {
            put("username", username)
            put("password", password)
            put("firstName", firstName)
            put("lastName", lastName)
            put("schoolid", schoolID)
            put("email", email)
            put("role", role)
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = URL("https://it342-eduwheels.onrender.com/users/signup")
                val connection = url.openConnection() as HttpURLConnection

                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.doOutput = true

                connection.outputStream.bufferedWriter().use { writer ->
                    writer.write(userJson.toString())
                }

                if (connection.responseCode == HttpURLConnection.HTTP_CREATED || connection.responseCode == HttpURLConnection.HTTP_OK) {
                    runOnUiThread {
                        Toast.makeText(this@Register, "Registered successfully!", Toast.LENGTH_SHORT).show()
                        val intent = Intent(this@Register, LogIn::class.java)
                        startActivity(intent)
                        finish()
                    }
                } else {
                    val error = connection.errorStream?.bufferedReader()?.readText()
                    runOnUiThread {
                        Toast.makeText(this@Register, "Failed to register: $error", Toast.LENGTH_LONG).show()
                    }
                }

                connection.disconnect()
            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread {
                    Toast.makeText(this@Register, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
