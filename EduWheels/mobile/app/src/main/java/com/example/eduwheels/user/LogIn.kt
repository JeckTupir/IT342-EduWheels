package com.example.eduwheels.user

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.*
import com.example.eduwheels.DashBoard
import com.example.eduwheels.R
import com.example.eduwheels.util.SessionManager
import com.google.android.gms.auth.api.identity.BeginSignInRequest
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.auth.api.identity.SignInClient
import kotlinx.coroutines.*
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class LogIn : Activity() {

    private lateinit var oneTapClient: SignInClient
    private lateinit var signInRequest: BeginSignInRequest
    private val REQ_ONE_TAP = 2

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_log_in)

        val schoolIdField = findViewById<EditText>(R.id.schoolId)
        val passwordField = findViewById<EditText>(R.id.password)
        val loginButton = findViewById<Button>(R.id.loginButton)
        val signUpText = findViewById<TextView>(R.id.signUpLink)
        val googleIcon = findViewById<ImageView>(R.id.googleIcon)

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

        oneTapClient = Identity.getSignInClient(this)
        signInRequest = BeginSignInRequest.builder()
            .setGoogleIdTokenRequestOptions(
                BeginSignInRequest.GoogleIdTokenRequestOptions.builder()
                    .setSupported(true)
                    .setServerClientId("748786111030-q73gs93772ehif2t2ald2v2se7gqsfrd.apps.googleusercontent.com") // Your correct client ID
                    .setFilterByAuthorizedAccounts(false)
                    .build()
            )
            .build()

        googleIcon.setOnClickListener {
            oneTapClient.beginSignIn(signInRequest)
                .addOnSuccessListener { result ->
                    startIntentSenderForResult(
                        result.pendingIntent.intentSender, REQ_ONE_TAP,
                        null, 0, 0, 0, null
                    )
                }
                .addOnFailureListener { e ->
                    Toast.makeText(this, "Google sign-in failed: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == REQ_ONE_TAP && resultCode == RESULT_OK && data != null) {
            val credential = oneTapClient.getSignInCredentialFromIntent(data)
            val idToken = credential.googleIdToken

            if (idToken != null) {
                handleGoogleLogin(idToken)
            } else {
                Toast.makeText(this, "No ID token found!", Toast.LENGTH_SHORT).show()
            }
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
                        val responseJson = JSONObject(responseBody)
                        val token = responseJson.getString("token")
                        val userJson = responseJson.getJSONObject("user")

                        val sessionManager = SessionManager(this@LogIn)
                        sessionManager.saveUserSession(
                            userId = userJson.getLong("id"),             // 🛠 FIXED!
                            schoolId = userJson.getString("schoolid"),
                            email = userJson.getString("email"),
                            name = userJson.getString("name"),
                            token = token
                        )


                        Toast.makeText(this@LogIn, "Login successful!", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@LogIn, DashBoard::class.java))
                        finish()
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

    private fun handleGoogleLogin(idToken: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = URL("http://192.168.74.208:8080/users/oauth2/google/login")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.doOutput = true

                val tokenJson = JSONObject().apply {
                    put("idToken", idToken)
                }

                connection.outputStream.bufferedWriter().use {
                    it.write(tokenJson.toString())
                }

                val responseCode = connection.responseCode
                val responseBody = connection.inputStream.bufferedReader().readText()

                runOnUiThread {
                    if (responseCode == HttpURLConnection.HTTP_OK) {
                        val responseJson = JSONObject(responseBody)
                        val token = responseJson.getString("token")
                        val userJson = responseJson.getJSONObject("user")

                        val sessionManager = SessionManager(this@LogIn)
                        sessionManager.saveUserSession(
                            userId = userJson.getLong("id"),             // 🛠 FIXED!
                            schoolId = userJson.getString("schoolid"),
                            email = userJson.getString("email"),
                            name = userJson.getString("name"),
                            token = token
                        )


                        Toast.makeText(this@LogIn, "Google login successful!", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@LogIn, DashBoard::class.java))
                        finish()
                    } else {
                        Toast.makeText(this@LogIn, "Google login failed: $responseBody", Toast.LENGTH_LONG).show()
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
