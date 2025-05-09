package com.example.eduwheels.user

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.widget.*
import com.example.eduwheels.DashBoard
import com.example.eduwheels.R
import com.example.eduwheels.api.RetrofitClient
import com.example.eduwheels.api.RetrofitService
import com.example.eduwheels.util.SessionManager
import com.google.android.gms.auth.api.identity.BeginSignInRequest
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.auth.api.identity.SignInClient
import kotlinx.coroutines.*
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.net.HttpURLConnection
import java.net.URL

class LogIn : Activity() {

    private lateinit var oneTapClient: SignInClient
    private lateinit var signInRequest: BeginSignInRequest
    private val REQ_ONE_TAP = 2

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val sessionManager = SessionManager(this)

        if (sessionManager.isLoggedIn()) {
            val token = sessionManager.getToken()
            val authHeader = "Bearer $token"

            val retrofitService = RetrofitClient.getInstance().create(RetrofitService::class.java)

            retrofitService.getCurrentUser(authHeader)
                .enqueue(object : Callback<Map<String, @JvmSuppressWildcards Any>> {
                    override fun onResponse(
                        call: Call<Map<String, @JvmSuppressWildcards Any>>,
                        response: Response<Map<String, @JvmSuppressWildcards Any>>
                    ) {
                        if (response.isSuccessful && response.body() != null) {
                            sessionManager.saveUserFromResponse(response.body()!!, token!!)
                            startActivity(Intent(this@LogIn, DashBoard::class.java))
                            finish()
                        } else {
                            Log.e("LoginCheck", "Invalid token or failed to fetch user")
                            sessionManager.clearSession()
                        }
                    }

                    override fun onFailure(
                        call: Call<Map<String, @JvmSuppressWildcards Any>>,
                        t: Throwable
                    ) {
                        Log.e("LoginCheck", "Error fetching user from /me: ${t.message}")
                        sessionManager.clearSession()
                    }
                })
        }

        setContentView(R.layout.activity_log_in)

        val schoolIdField = findViewById<EditText>(R.id.schoolId)
        val passwordField = findViewById<EditText>(R.id.password)
        val loginButton = findViewById<Button>(R.id.loginButton)
        val signUpText = findViewById<TextView>(R.id.signUpLink)
        val googleIcon = findViewById<ImageView>(R.id.googleIcon)

        loginButton.setOnClickListener {
            val id = schoolIdField.text.toString()
            val pass = passwordField.text.toString()
            loginUser(id, pass)
        }

        signUpText.setOnClickListener {
            startActivity(Intent(this, Register::class.java))
        }

        oneTapClient = Identity.getSignInClient(this)
        signInRequest = BeginSignInRequest.builder()
            .setGoogleIdTokenRequestOptions(
                BeginSignInRequest.GoogleIdTokenRequestOptions.builder()
                    .setSupported(true)
                    .setServerClientId("748786111030-q73gs93772ehif2t2ald2v2se7gqsfrd.apps.googleusercontent.com")
                    .setFilterByAuthorizedAccounts(false)
                    .build()
            ).build()

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

        if (requestCode == REQ_ONE_TAP && resultCode == RESULT_OK) {
            try {
                val credential = oneTapClient.getSignInCredentialFromIntent(data)
                val idToken = credential.googleIdToken
                if (idToken != null) {
                    handleGoogleLogin(idToken)
                } else {
                    Toast.makeText(this, "No ID token!", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this, "Google login error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun loginUser(schoolId: String, password: String) {
        val loginJson = JSONObject().apply {
            put("schoolid", schoolId)
            put("password", password)
        }

        CoroutineScope(Dispatchers.IO).launch {
            var connection: HttpURLConnection? = null
            try {
                val url = URL("http://192.168.42.144:8080/users/login")
                connection = (url.openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    setRequestProperty("Content-Type", "application/json")
                    doOutput = true
                }

                connection.outputStream.bufferedWriter().use {
                    it.write(loginJson.toString())
                }

                val responseCode = connection.responseCode
                val responseText = if (responseCode == HttpURLConnection.HTTP_OK) {
                    connection.inputStream.bufferedReader().readText()
                } else {
                    connection.errorStream?.bufferedReader()?.readText() ?: "No error body"
                }

                Log.d("LoginResponse", "Code: $responseCode\nBody: $responseText")

                runOnUiThread {
                    if (responseCode == HttpURLConnection.HTTP_OK) {
                        try {
                            val responseJson = JSONObject(responseText)

                            if (!responseJson.has("user") || !responseJson.has("token")) {
                                Toast.makeText(this@LogIn, "Invalid response format", Toast.LENGTH_LONG).show()
                                return@runOnUiThread
                            }

                            val userJson = responseJson.getJSONObject("user")
                            val token = responseJson.getString("token")

                            val sessionManager = SessionManager(this@LogIn)
                            sessionManager.saveUserSession(
                                userId = userJson.optLong("id", -1),
                                schoolId = userJson.optString("schoolid", ""),
                                email = userJson.optString("email", ""),
                                name = "${userJson.optString("firstName", "")} ${userJson.optString("lastName", "")}",
                                firstName = userJson.optString("firstName", ""),
                                lastName = userJson.optString("lastName", ""),
                                token = token,
                                role = userJson.optString("role", "")
                            )

                            Toast.makeText(this@LogIn, "Welcome ${userJson.optString("firstName", "")}!", Toast.LENGTH_SHORT).show()

                            Handler(Looper.getMainLooper()).postDelayed({
                                val intent = Intent(this@LogIn, DashBoard::class.java)
                                intent.putExtra("user_id", userJson.optLong("id", -1))
                                intent.putExtra("schoolid", userJson.optString("schoolid", ""))
                                intent.putExtra("email", userJson.optString("email", ""))
                                intent.putExtra("username", userJson.optString("username", ""))
                                intent.putExtra("firstName", userJson.optString("firstName", ""))
                                intent.putExtra("lastName", userJson.optString("lastName", ""))
                                intent.putExtra("role", userJson.optString("role", ""))
                                intent.putExtra("token", token)

                                startActivity(intent)
                                finish()
                            }, 200)


                        } catch (e: Exception) {
                            Log.e("LoginParsing", "Parsing error: ${e.message}")
                            Toast.makeText(this@LogIn, "Error reading user info", Toast.LENGTH_LONG).show()
                        }
                    } else {
                        Toast.makeText(this@LogIn, "Login failed: $responseText", Toast.LENGTH_LONG).show()
                    }
                }

            } catch (e: Exception) {
                runOnUiThread {
                    Toast.makeText(this@LogIn, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            } finally {
                connection?.disconnect()
            }
        }
    }


    private fun handleGoogleLogin(idToken: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = URL("http://192.168.42.144:8080/users/oauth2/google/login")
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
                            userId = userJson.getLong("id"),
                            schoolId = userJson.getString("schoolid"),
                            email = userJson.getString("email"),
                            name = "${userJson.getString("firstName")} ${userJson.getString("lastName")}",
                            firstName = userJson.getString("firstName"),
                            lastName = userJson.getString("lastName"),
                            token = token,
                            role = userJson.getString("role")
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
                runOnUiThread {
                    Toast.makeText(this@LogIn, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
