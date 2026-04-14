# 🚀 UniSmart API Integration & Testing Guide

This document provides the exact JSON payloads and expected responses for testing the UniSmart backend. Base URL: `https://unismart-backend-one.vercel.app`

---

## 1. 🔐 Authentication Scenarios
**Endpoint:** `POST /api/login`

### 🟢 Scenario 1: Admin Login (Success)
**Request Body:**
```json
{
  "universityId": "admin01",
  "password": "admin@2026"
}
```
**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "role": "admin",
    "name": "System Administrator",
    "token": "fake-admin-jwt-token"
  },
  "message": "Admin login successful"
}
```

### 🟢 Scenario 2: Student Login (Success)
**Request Body:**
```json
{
  "universityId": "2026001",
  "password": "123"
}
```
**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "role": "student",
    "studentData": {
      "name": "Abanoub Amir",
      "gpa": 3.4,
      "department": "Computer Science"
    },
    "token": "fake-student-jwt-token"
  },
  "message": "Student login successful"
}
```

### 🔴 Scenario 3: Failed Login (Wrong Credentials)
**Request Body:**
```json
{
  "universityId": "2026001",
  "password": "wrongpassword"
}
```
**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid university ID or password",
  "errorCode": "INVALID_CREDENTIALS"
}
```

---

## 2. 🎓 Student Portal Scenarios (Post-Login)

### 📊 Dashboard Data
**Endpoint:** `POST /api/dashboard`
**Request Body:**
```json
{
  "universityId": "2026001"
}
```
**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "gpa": 3.4,
    "availableHours": 21,
    "passedHours": 65,
    "registeredCoursesCount": 2,
    "registeredCoursesDetails": [
      {
        "code": "SE311",
        "courseName": "Software Engineering",
        "hours": 3,
        "professor": "TBA",
        "action": "Delete"
      }
    ]
  },
  "message": "Dashboard fetched successfully"
}
```

### 🟢 Successful Registration (Meets all rules)
**Endpoint:** `POST /api/register-course`
**Request Body:**
```json
{
  "universityId": "2026101",
  "requestedCourses": ["CS111", "BS111"]
}
```
**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": ["CS111", "BS111"],
  "message": "Courses registered successfully"
}
```

### 🔴 Failed Registration (Rules & Edge Cases)
**Endpoint:** `POST /api/register-course`

**1. PREREQUISITE_MISSING** (Attempting CS211 without CS111)
```json
// Response (400 Bad Request)
{
  "success": false,
  "message": "Cannot register for Structured Programming. You must pass CS111 first.",
  "errorCode": "PREREQUISITE_MISSING"
}
```

**2. LEVEL_LOCKED** (Level 1 Student attempting Level 4 Course)
```json
// Response (400 Bad Request)
{
  "success": false,
  "message": "Registration failed: Data Science (CS414) requires Level 4, but you are currently Level 1.",
  "errorCode": "LEVEL_LOCKED"
}
```

---

## 3. ⚙️ Admin Control Center Scenarios

> [!IMPORTANT]
> **Header Requirement:** All `/api/admin/*` routes strictly require the following header:
> `x-user-role: admin`

### 📈 Admin Dashboard Stats
**Endpoint:** `POST /api/admin/stats`
*(Requires Header)*
**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalStudents": 4,
    "totalCourses": 15,
    "activeRegistrations": 8,
    "departmentsCount": 1,
    "recentRegistrations": []
  },
  "message": "Admin stats fetched successfully"
}
```

### ➕ Add a New Student (CRUD Payload)
**Endpoint:** `POST /api/admin/students`
*(Requires Header)*
**Request Body:**
```json
{
  "studentId": "2026888",
  "password": "123",
  "name": "New Test Student",
  "email": "test@university.edu",
  "gpa": 0,
  "passedHours": 0,
  "department": "Computer Science",
  "academicHistory": []
}
```

### 🔄 Update Student GPA (CRUD Payload)
**Endpoint:** `PUT /api/admin/students/2026001`
*(Requires Header)*
**Request Body:**
```json
{
  "gpa": 3.9,
  "passedHours": 75
}
```

### ❌ Delete a Course (CRUD Payload)
**Endpoint:** `DELETE /api/admin/courses/BS111`
*(Requires Header)*
**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "message": "Course removed"
}
```
