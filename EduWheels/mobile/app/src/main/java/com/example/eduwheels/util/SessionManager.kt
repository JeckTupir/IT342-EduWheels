package com.example.eduwheels.util

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.example.eduwheels.models.User

class SessionManager(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("user_session", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_SCHOOL_ID = "schoolid"
        private const val KEY_USER_ID = "userId"
        private const val KEY_EMAIL = "email"
        private const val KEY_NAME = "name"
        private const val KEY_TOKEN = "token"
        private const val KEY_ROLE = "role"
        private const val KEY_FIRST_NAME = "firstName"
        private const val KEY_LAST_NAME = "lastName"
        private const val KEY_LOGGED_IN = "loggedIn"

    }

    fun saveUserSession(
        userId: Long,
        schoolId: String,
        email: String,
        name: String,
        firstName: String,
        lastName: String,
        token: String,
        role: String
    ) {
        prefs.edit()
            .putLong(KEY_USER_ID, userId)
            .putString(KEY_SCHOOL_ID, schoolId)
            .putString(KEY_EMAIL, email)
            .putString(KEY_NAME, name)
            .putString(KEY_FIRST_NAME, firstName)
            .putString(KEY_LAST_NAME, lastName)
            .putString(KEY_TOKEN, token)
            .putString(KEY_ROLE, role)
            .putBoolean(KEY_LOGGED_IN, true) // ✅ Save login status
            .commit()  // ← forces synchronous write

    }


    // 💡 New method to save user directly from /me API response
    fun saveUserFromResponse(userMap: Map<String, Any>, token: String) {
        val userId = (userMap["id"] as? Double)?.toLong() ?: -1
        val schoolId = userMap["schoolId"] as? String ?: ""
        val email = userMap["email"] as? String ?: ""
        val name = userMap["username"] as? String ?: ""
        val firstName = userMap["firstName"] as? String ?: ""
        val lastName = userMap["lastName"] as? String ?: ""
        val role = userMap["role"] as? String ?: ""

        saveUserSession(
            userId,
            schoolId,
            email,
            name,
            firstName,
            lastName,
            token,
            role
        )
    }


    fun getUserId(): Long = prefs.getLong(KEY_USER_ID, -1)
    fun getSchoolId(): String? = prefs.getString(KEY_SCHOOL_ID, null)
    fun getEmail(): String? = prefs.getString(KEY_EMAIL, null)
    fun getName(): String? = prefs.getString(KEY_NAME, null)
    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)
    fun getRole(): String? = prefs.getString(KEY_ROLE, null)
    fun getFirstName(): String = prefs.getString(KEY_FIRST_NAME, "") ?: ""
    fun getLastName(): String = prefs.getString(KEY_LAST_NAME, "") ?: ""

    fun isLoggedIn(): Boolean {
        val token = prefs.getString(KEY_TOKEN, null)
        Log.d("SessionManager", "Token = $token")
        return token != null
    }

    fun clearSession() {
        prefs.edit().clear().apply()
    }


    fun getUser(): User {
        return User(
            id = getUserId(),
            email = getEmail() ?: "",
            username = getName() ?: "",
            firstName = getFirstName(),
            lastName = getLastName(),
            role = getRole() ?: "",
            schoolid = getSchoolId() ?: "",
            password = "" // You typically don't store the password; use empty string or fetch it as needed
        )
    }

}
