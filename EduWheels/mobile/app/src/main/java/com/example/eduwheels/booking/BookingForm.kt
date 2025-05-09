package com.example.eduwheels.booking

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.example.eduwheels.R
import com.example.eduwheels.base.BaseActivity
import org.json.JSONObject
import java.io.DataOutputStream
import java.net.HttpURLConnection
import java.net.URL

class BookingForm : BaseActivity() {

    private lateinit var etPickup: EditText
    private lateinit var etDropoff: EditText
    private lateinit var etPassengerCount: EditText
    private lateinit var etBookingDate: EditText
    private lateinit var etReturnDate: EditText
    private lateinit var etStatus: EditText
    private lateinit var etUsername: EditText
    private lateinit var btnBook: Button
    private lateinit var tvResponse: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_booking_form)

        etPickup = findViewById(R.id.etPickup)
        etDropoff = findViewById(R.id.etDropoff)
        etPassengerCount = findViewById(R.id.etPassengerCount)
        etBookingDate = findViewById(R.id.etBookingDate)
        etReturnDate = findViewById(R.id.etReturnDate)
        etStatus = EditText(this).apply { setText("Pending") } // Set default status
        etUsername = EditText(this) // This can be pre-filled from session if needed
        btnBook = findViewById(R.id.btnBook)
        tvResponse = findViewById(R.id.tvResponse)

        btnBook.setOnClickListener {
            createBooking()
        }
    }

    private fun createBooking() {
        val pickup = etPickup.text.toString().trim()
        val dropoff = etDropoff.text.toString().trim()
        val passengerCount = etPassengerCount.text.toString().trim()
        val bookingDate = etBookingDate.text.toString().trim()
        val returnDate = etReturnDate.text.toString().trim()
        val status = etStatus.text.toString().ifEmpty { "Pending" }
        val username = etUsername.text.toString().trim()

        Thread {
            try {
                val url = URL("http://10.0.2.2:8080/api/bookings")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json; utf-8")
                connection.setRequestProperty("Accept", "application/json")
                connection.doOutput = true

                val jsonInput = JSONObject().apply {
                    put("pickup", pickup)
                    put("dropoff", dropoff)
                    put("passengerCount", passengerCount.toIntOrNull() ?: 0)
                    put("bookingDate", bookingDate)
                    put("returnDate", returnDate)
                    put("status", status)
                    put("username", username)
                }

                val outputStream = DataOutputStream(connection.outputStream)
                outputStream.writeBytes(jsonInput.toString())
                outputStream.flush()
                outputStream.close()

                val responseCode = connection.responseCode
                val inputStream = if (responseCode in 200..299) {
                    connection.inputStream
                } else {
                    connection.errorStream
                }

                val response = inputStream.bufferedReader().use { it.readText() }

                runOnUiThread {
                    tvResponse.text = "Server Response ($responseCode): $response"
                }

            } catch (e: Exception) {
                e.printStackTrace()
                runOnUiThread {
                    tvResponse.text = "Error: ${e.message}"
                }
            }
        }.start()
    }
}
