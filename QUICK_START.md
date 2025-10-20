# 🚀 EduWheels - Quick Start Guide

## Start All Services

### 1. Start MySQL
Ensure MySQL is running on `localhost:3306` with database `dbeduwheels`

### 2. Start Backend (Terminal 1)
```bash
cd EduWheels/EduWheels
./mvnw spring-boot:run
# or on Windows: mvnw.cmd spring-boot:run
```
✅ Backend running at: http://localhost:8080

### 3. Start Frontend (Terminal 2)
```bash
cd frontend
npm install    # First time only
npm run dev
```
✅ Frontend running at: http://localhost:3000

### 4. Run Mobile App
- Open `EduWheels/mobile` in Android Studio
- Start emulator or connect physical device
- Click Run (Shift + F10)

✅ Mobile app connects to: http://10.0.2.2:8080 (emulator)

## 📍 URLs Changed

### Backend ✅
- Already configured via `spring.profiles.active=local`
- Uses `application-local.properties` automatically

### Mobile App ✅
- **LogIn.kt**: `http://192.168.74.208:8080` → `http://10.0.2.2:8080`
- **Register.kt**: `http://192.168.74.208:8080` → `http://10.0.2.2:8080`
- **UserProfile.kt**: `http://192.168.74.208:8080` → `http://10.0.2.2:8080`
- **Vehicles.kt**: `http://192.168.74.208:8080` → `http://10.0.2.2:8080`

### Frontend ✅
- **LoginPage.jsx**: `https://it342-eduwheels.onrender.com` → `http://localhost:8080`
- **SignUpPage.jsx**: `https://it342-eduwheels.onrender.com` → `http://localhost:8080`
- **CompleteProfilePage.jsx**: `https://it342-eduwheels.onrender.com` → `http://localhost:8080`
- **OAuthCallbackHandler.jsx**: `https://it342-eduwheels.onrender.com` → `http://localhost:8080`
- **Profile.jsx**: `https://it342-eduwheels.onrender.com` → `http://localhost:8080`

## 🔑 Database Credentials
```
Host: localhost
Port: 3306
Database: dbeduwheels
Username: root
Password: 26Password
```

## 🎯 Quick Test
1. Open http://localhost:3000 in browser
2. Click "Sign Up" and create an account
3. Login with the new account
4. Open mobile app and login with same credentials

## 📱 For Physical Device Testing
Find your IP address:
- **Windows**: `ipconfig` in Command Prompt
- **Mac/Linux**: `ifconfig` in Terminal

Then update mobile app URLs from `10.0.2.2` to your IP (e.g., `192.168.1.100`)

## 📂 Files Created/Modified
```
✅ EduWheels/mobile/local.properties (NEW)
✅ EduWheels/LOCAL_DEVELOPMENT_GUIDE.md (NEW)
✅ EduWheels/QUICK_START.md (NEW - this file)
✅ Modified: 5 mobile .kt files
✅ Modified: 5 frontend .jsx files
✅ Existing: application-local.properties (already configured)
```

---
**Need help?** Check `LOCAL_DEVELOPMENT_GUIDE.md` for detailed instructions!
