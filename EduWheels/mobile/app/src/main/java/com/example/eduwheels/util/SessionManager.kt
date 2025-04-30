package com.example.eduwheels.util

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("user_session", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_SCHOOL_ID = "schoolid"
        private const val KEY_USER_ID = "userId"
        private const val KEY_EMAIL = "email"
        private const val KEY_NAME = "name"
    }

    fun saveUserSession(userId: Long, schoolId: String, email: String, name: String) {
        prefs.edit()
            .putLong(KEY_USER_ID, userId)
            .putString(KEY_SCHOOL_ID, schoolId)
            .putString(KEY_EMAIL, email)
            .putString(KEY_NAME, name)
            .apply()
    }

    fun getUserId(): Long = prefs.getLong(KEY_USER_ID, -1)
    fun getSchoolId(): String? = prefs.getString(KEY_SCHOOL_ID, null)
    fun getEmail(): String? = prefs.getString(KEY_EMAIL, null)
    fun getName(): String? = prefs.getString(KEY_NAME, null)

    fun clearSession() {
        prefs.edit().clear().apply()
    }

    fun saveUserSession(userId: Long, schoolId: String, email: String, name: String, token: String) {
        prefs.edit()
            .putLong("userId", userId)
            .putString("schoolid", schoolId)
            .putString("email", email)
            .putString("name", name)
            .putString("token", token)
            .apply()
    }

}
