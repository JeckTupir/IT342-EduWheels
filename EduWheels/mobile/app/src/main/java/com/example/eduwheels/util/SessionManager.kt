package com.example.eduwheels.util

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("user_session", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_USER_ID = "userId"          // 🛠 NEW
        private const val KEY_SCHOOL_ID = "schoolId"
        private const val KEY_EMAIL = "email"
        private const val KEY_NAME = "name"
        private const val KEY_TOKEN = "token"
    }

    fun saveUserSession(userId: Long, schoolId: String, email: String, name: String, token: String) {
        prefs.edit()
            .putLong(KEY_USER_ID, userId)     // 🛠 Save userId
            .putString(KEY_SCHOOL_ID, schoolId)
            .putString(KEY_EMAIL, email)
            .putString(KEY_NAME, name)
            .putString(KEY_TOKEN, token)
            .apply()
    }

    fun getUserId(): Long = prefs.getLong(KEY_USER_ID, -1)
    fun getSchoolId(): String? = prefs.getString(KEY_SCHOOL_ID, null)
    fun getEmail(): String? = prefs.getString(KEY_EMAIL, null)
    fun getName(): String? = prefs.getString(KEY_NAME, null)
    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun clearSession() {
        prefs.edit().clear().apply()
    }
}
