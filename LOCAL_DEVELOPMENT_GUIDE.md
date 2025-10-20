# EduWheels Local Development Setup

This document outlines all the changes made to configure the EduWheels project to run locally using the `application-local.properties` configuration.

## 📋 Summary of Changes

### 1. Backend (Spring Boot) Configuration
**Location:** `EduWheels/src/main/resources/`

- ✅ **application.properties** - Already configured with `spring.profiles.active=local`
- ✅ **application-local.properties** - Contains local database and OAuth2 configuration
  - Database: `jdbc:mysql://localhost:3306/dbeduwheels`
  - Username: `root`
  - Password: `26Password`
  - Google OAuth2 redirect: `http://localhost:8080/login/oauth2/code/google`

### 2. Mobile App (Android) Configuration
**Files Modified:**
- ✅ `mobile/app/src/main/java/com/example/eduwheels/user/LogIn.kt`
- ✅ `mobile/app/src/main/java/com/example/eduwheels/user/Register.kt`
- ✅ `mobile/app/src/main/java/com/example/eduwheels/user/UserProfile.kt`
- ✅ `mobile/app/src/main/java/com/example/eduwheels/vehicle/Vehicles.kt`

**Changes Made:**
- Changed all API URLs from `http://192.168.74.208:8080` to `http://10.0.2.2:8080`
- `10.0.2.2` is the special Android emulator address to access the host machine's localhost

**File Created:**
- ✅ `mobile/local.properties` - Contains SDK path and API configuration

### 3. Frontend (React) Configuration
**Files Modified:**
- ✅ `frontend/src/pages/LoginPage/LoginPage.jsx`
- ✅ `frontend/src/pages/SignUpPage/SignUpPage.jsx`
- ✅ `frontend/src/pages/SignUpPage/CompleteProfilePage.jsx`
- ✅ `frontend/src/pages/Handler/OAuthCallbackHandler.jsx`
- ✅ `frontend/src/pages/ProfilePage/Profile.jsx`

**Changes Made:**
- Changed `API_BASE_URL` from `https://it342-eduwheels.onrender.com` to `http://localhost:8080`
- Production URLs are commented out for easy switching

## 🚀 How to Run the Project Locally

### Prerequisites
1. **MySQL Server** running on `localhost:3306`
2. **Node.js** (v16 or higher) and npm
3. **Java JDK** (version 11 or higher)
4. **Android Studio** (for mobile app)
5. **Maven** (for backend)

### Step 1: Setup MySQL Database
```sql
-- Create database
CREATE DATABASE dbeduwheels;

-- Verify connection with credentials in application-local.properties:
-- Username: root
-- Password: 26Password
```

### Step 2: Start the Backend (Spring Boot)
```bash
cd EduWheels/EduWheels

# Using Maven
./mvnw spring-boot:run

# Or using Maven Wrapper on Windows
mvnw.cmd spring-boot:run

# The backend will start on http://localhost:8080
```

**Verify Backend:**
- Open browser: `http://localhost:8080`
- Check Swagger UI (if configured): `http://localhost:8080/swagger-ui.html`

### Step 3: Start the Frontend (React)
```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Frontend will start on http://localhost:3000
```

**Verify Frontend:**
- Open browser: `http://localhost:3000`

### Step 4: Run the Mobile App (Android)

#### Option A: Using Android Emulator (Recommended)
1. Open Android Studio
2. Open the `EduWheels/mobile` folder as a project
3. Start an Android emulator (API 24 or higher)
4. Click **Run** or press `Shift + F10`
5. The app will connect to backend at `http://10.0.2.2:8080`

#### Option B: Using Physical Device
1. Find your computer's local IP address:
   - **Windows:** Open Command Prompt → `ipconfig`
   - **Mac/Linux:** Open Terminal → `ifconfig`
   - Look for IPv4 Address (e.g., `192.168.1.100`)

2. Update the IP in all mobile files:
   - `LogIn.kt`: Change `http://10.0.2.2:8080` to `http://192.168.1.XXX:8080`
   - `Register.kt`: Change `http://10.0.2.2:8080` to `http://192.168.1.XXX:8080`
   - `UserProfile.kt`: Change `http://10.0.2.2:8080` to `http://192.168.1.XXX:8080`
   - `Vehicles.kt`: Change `http://10.0.2.2:8080` to `http://192.168.1.XXX:8080`

3. Enable USB Debugging on your device
4. Connect device via USB
5. Run the app from Android Studio

## 🔧 Configuration Files Reference

### Backend - application-local.properties
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/dbeduwheels
spring.datasource.username=root
spring.datasource.password=26Password

# OAuth2
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8080/login/oauth2/code/google
```

### Mobile - local.properties
```properties
sdk.dir=C:\\Users\\jecke\\AppData\\Local\\Android\\Sdk
api.base.url=http://10.0.2.2:8080
```

### Frontend - API Configuration
```javascript
// Local development
const API_BASE_URL = "http://localhost:8080";

// Production (commented out)
// const API_BASE_URL = "https://it342-eduwheels.onrender.com";
```

## 🔄 Switching Between Local and Production

### Backend
The backend automatically uses the profile set in `application.properties`:
```properties
spring.profiles.active=local  # For local development
# spring.profiles.active=prod  # For production
```

### Frontend
Uncomment/comment the appropriate API_BASE_URL in each file:
```javascript
// For local development
const API_BASE_URL = "http://localhost:8080";

// For production
// const API_BASE_URL = "https://it342-eduwheels.onrender.com";
```

### Mobile
Update the URLs in:
- `LogIn.kt`
- `Register.kt`
- `UserProfile.kt`
- `Vehicles.kt`

## 📝 Common Issues and Solutions

### Issue: Backend won't start
**Solution:** Check if MySQL is running and credentials are correct in `application-local.properties`

### Issue: Mobile app can't connect to backend
**Solution:** 
- Emulator: Ensure backend is running and you're using `10.0.2.2`
- Physical device: Ensure both device and computer are on the same WiFi network

### Issue: Frontend CORS errors
**Solution:** The backend's `application.properties` already includes CORS configuration for `http://localhost:3000`

### Issue: Google OAuth not working locally
**Solution:** Make sure your Google OAuth credentials in `application-local.properties` are configured for `http://localhost:8080` in Google Cloud Console

## 📦 Project Structure
```
EduWheels/
├── EduWheels/              # Backend (Spring Boot)
│   ├── src/
│   │   └── main/
│   │       └── resources/
│   │           ├── application.properties
│   │           ├── application-local.properties  ✅
│   │           └── application-prod.properties
│   └── mobile/             # Android App
│       ├── local.properties  ✅
│       └── app/
│           └── src/
├── frontend/               # React Frontend
│   └── src/
│       └── pages/          # Modified API URLs ✅
└── LOCAL_DEVELOPMENT_GUIDE.md  ✅ (This file)
```

## ✅ Checklist for Local Development

- [ ] MySQL database created and running
- [ ] Backend started on port 8080
- [ ] Frontend started on port 3000
- [ ] Mobile app connected (emulator or physical device)
- [ ] All services can communicate with each other

## 🎯 Testing the Setup

1. **Backend:** Visit `http://localhost:8080/users` - should return empty array or user list
2. **Frontend:** Visit `http://localhost:3000` - landing page should load
3. **Mobile:** Open app - landing screen should appear
4. **Integration:** Try registering a new user from frontend or mobile app

---

**Note:** Remember to switch back to production URLs before deploying!
