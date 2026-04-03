# Zorvyn API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base Information](#base-information)
3. [Authentication](#authentication)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Rate Limiting](#rate-limiting)
6. [Error Handling](#error-handling)
7. [Authentication Endpoints](#authentication-endpoints)
8. [Dashboard Endpoints](#dashboard-endpoints)
9. [Financial Endpoints](#financial-endpoints)
10. [Response Examples](#response-examples)

---

## Overview

Zorvyn is a comprehensive financial management API designed to help users and administrators track income, expenses, and financial trends. The API provides authentication, role-based access control, and complete financial data management capabilities.

### Key Features
- User authentication with JWT tokens
- Role-based access control (Admin, Analyst, Viewer)
- Financial transaction tracking (Income & Expenses)
- Dashboard with financial summaries
- Advanced filtering and search capabilities
- Rate limiting for API protection
- Cookie-based session management

---

## Demo Accounts

The following demo accounts are available for testing different user roles:

### Admin Account
- **Username:** bharani
- **Email:** bharani@gmail.com
- **Password:** 12345678
- **Role:** admin
- **Status:** active
- **User ID:** 69cf477599bbbffe9668c51f

### Analyst Account
- **Username:** ashok
- **Email:** ashok@gmail.com
- **Password:** 12345678
- **Role:** analyst
- **Status:** active
- **User ID:** 69cf486899bbbffe9668c522

### Viewer Account
- **Username:** guru
- **Email:** guru@gmail.com
- **Password:** 12345678
- **Role:** viewer
- **Status:** active
- **User ID:** 69cf487399bbbffe9668c525

**Note:** These are demo accounts for testing only.

---

## Base Information

### Base URL
```
http://localhost:8000 (or PORT specified in environment)
```

### API Endpoints Structure
```
/auth          - Authentication endpoints
/api           - Financial data endpoints
/dashboard     - Dashboard summary endpoints
/              - Server health check
```

### Server Health Check
**Endpoint:** `GET /`

**Description:** Verify that the server is running and operational.

**Response:**
```json
{
  "success": "Server is working..."
}
```

---

## Authentication

### JWT Authentication
The API uses JWT (JSON Web Tokens) for authentication. Tokens are:
- Generated during login with 1-hour expiration
- Stored in HTTP-only cookies
- Required for all protected endpoints
- Included in request headers or cookies

### Token Structure
The JWT token contains the following claims:
```json
{
  "id": "user_id_from_database",
  "email": "user_email",
  "role": "admin|analyst|viewer",
  "status": "user_status"
}
```

### Token Expiration
- **Duration:** 1 Day
- **Renewal:** User must log in again
- **Storage:** HTTP-only cookie with secure and sameSite flags

### Using the Token

Include the token in requests in one of these ways:

**Option 1: Cookie (Automatic)**
```
Cookie: token=<jwt_token>
```

**Option 2: Authorization Header**
```
Authorization: Bearer <jwt_token>
```

---

## User Roles & Permissions

### Available Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **admin** | Full system access | Create, read, update, delete financial data; View all data; Access dashboard |
| **analyst** | Financial analysis access | Read financial data; Filter and search; Access dashboard; Cannot create/modify/delete |
| **viewer** | Read-only access | Read their own financial data; Filter and search; Access dashboard; Cannot create/modify/delete |

### Permission Matrix

| Action | Admin | Analyst | Viewer |
|--------|-------|---------|--------|
| Register User | ✓ | ✓ | ✓ |
| Login | ✓ | ✓ | ✓ |
| View All Financial Data | ✓ | ✓ | ✗ (own data only) |
| Create Financial Entry | ✓ | ✗ | ✗ |
| Update Financial Entry | ✓ (all) | ✗ | ✗ |
| Delete Financial Entry | ✓ (all) | ✗ | ✗ |
| Access Dashboard | ✓ | ✓ | ✗ |
| Filter Records | ✓ | ✓ | ✓ (own data) |
| Search Records | ✓ | ✓ | ✓ (own data) |

---

## Rate Limiting

The API implements three different rate limiting strategies:

### 1. Login Limiter
**Applied to:** `/auth/register`, `/auth/login`
- **Limit:** Prevents brute force attacks
- **Purpose:** Restrict authentication attempts
- **Action:** Request rejected with 429 status if limit exceeded

### 2. API Limiter
**Applied to:** All financial endpoints
- **Limit:** Prevents abuse of data endpoints
- **Purpose:** Protect API resources
- **Action:** Request rejected with 429 status if limit exceeded

### 3. Dashboard Limiter
**Applied to:** `/dashboard/summary`
- **Limit:** Prevents excessive dashboard queries
- **Purpose:** Optimize database performance
- **Action:** Request rejected with 429 status if limit exceeded

### Rate Limit Response
```json
{
  "error": "Too many requests, please try again later"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Type | Description |
|------|------|-------------|
| 200 | Success | Request successful, data returned |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or missing required fields |
| 403 | Forbidden | User lacks permission for this action |
| 404 | Not Found | Requested resource does not exist |
| 500 | Server Error | Internal server error occurred |
| 429 | Too Many Requests | Rate limit exceeded |

### Error Response Format
```json
{
  "error": "Descriptive error message",
  "success": false
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "All fields are required" | Missing username, email, or password | Provide all required fields |
| "Invalid email format" | Email doesn't match standard format | Use valid email (user@example.com) |
| "Password must be at least 6 characters long" | Password too short | Use password with 6+ characters |
| "Invalid role specified" | Role not in [admin, analyst, viewer] | Use valid role value |
| "User already exists with this email" | Email already registered | Use different email or login |
| "User not found" | No account with provided email | Check email or register |
| "Invalid password please try again" | Wrong password provided | Enter correct password |
| "Financial entry not found" | Entry ID doesn't exist | Verify entry ID |
| "You do not have permission to [action] this entry" | Insufficient permissions | Use authorized role or own data |

---

## Authentication Endpoints

### 1. Register User
**Endpoint:** `POST /auth/register`

**Description:** Create a new user account with specified role.

**Rate Limit:** Login Limiter

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required, valid email format)",
  "password": "string (required, minimum 6 characters)",
  "role": "string (optional, enum: admin|analyst|viewer, default: viewer)"
}
```

**Field Validation:**
- `username`: Any non-empty string
- `email`: Must match standard email format (user@domain.com)
- `password`: Minimum 6 characters
- `role`: Must be one of [admin, analyst, viewer]

**Success Response (201 Created):**
```json
{
  "success": "User registered successfully",
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "viewer",
    "password": "hashed_password",
    "status": "active",
    "createdAt": "2026-04-02T10:30:00Z",
    "updatedAt": "2026-04-02T10:30:00Z"
  }
}
```

**Error Responses:**
- 400: Missing required fields, invalid email, short password, invalid role, email already exists
- 500: Internal server error

---

### 2. Login User
**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive JWT token.

**Rate Limit:** Login Limiter

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200 OK):**
```json
{
  "success": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookie Set:**
The response includes an HTTP-only cookie:
```
Set-Cookie: token=<jwt_token>; HttpOnly; Secure; SameSite=strict; Max-Age=3600000
```

**Error Responses:**
- 400: Missing email or password, invalid password
- 404: User not found
- 500: Internal server error

**Token Expiration:** 1 hour (3600 seconds)

---

### 3. Logout User
**Endpoint:** `POST /auth/logout`

**Description:** End user session and clear authentication token.

**Authentication:** Not required

**Success Response (200 OK):**
```json
{
  "success": "User logged out successfully"
}
```

**Cookie Cleared:**
```
Set-Cookie: token=; HttpOnly; Secure; SameSite=strict; Max-Age=0
```

---

## Dashboard Endpoints

### 1. Get Dashboard Summary
**Endpoint:** `GET /dashboard/summary`

**Description:** Retrieve comprehensive financial overview including totals, trends, and recent activity.

**Rate Limit:** Dashboard Limiter

**Authentication:** Required

**Authorization:** admin, analyst

**Query Parameters:** None

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalIncome": 15000,
    "totalExpenses": 8500,
    "netBalance": 6500,
    "categoryWiseTotalsIncome": [
      {
        "_id": "salary",
        "total": 12000
      },
      {
        "_id": "investments",
        "total": 3000
      }
    ],
    "categoryWiseTotalsExpenses": [
      {
        "_id": "groceries",
        "total": 3000
      },
      {
        "_id": "utilities",
        "total": 2500
      }
    ],
    "monthlyTrends": [
      {
        "_id": {
          "month": 3,
          "year": 2026
        },
        "totalIncome": 15000,
        "totalExpenses": 8500
      },
      {
        "_id": {
          "month": 2,
          "year": 2026
        },
        "totalIncome": 14000,
        "totalExpenses": 7800
      }
    ],
    "recentActivityIncome": [
      {
        "_id": "entry_id",
        "userId": "user_id",
        "amount": 5000,
        "category": "salary",
        "type": "Income",
        "date": "2026-04-02T10:30:00Z",
        "notes": "Monthly salary",
        "createdAt": "2026-04-02T10:30:00Z"
      }
    ],
    "recentActivityExpenses": [
      {
        "_id": "entry_id",
        "userId": "user_id",
        "amount": 150,
        "category": "groceries",
        "type": "Expense",
        "date": "2026-04-02T09:15:00Z",
        "notes": "Weekly groceries",
        "createdAt": "2026-04-02T09:15:00Z"
      }
    ]
  }
}
```

**Error Responses:**
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 500: Internal server error

**Dashboard Data Includes:**
- Total income and expenses across all time
- Net balance calculation
- Category-wise breakdown for income and expenses
- 5 most recent income transactions
- 5 most recent expense transactions
- Monthly trends showing income vs expenses

---

## Financial Endpoints

### 1. Get All Financial Data
**Endpoint:** `GET /api/financial-data`

**Description:** Retrieve all active financial records for authenticated user (or all if admin).

**Rate Limit:** API Limiter

**Authentication:** Required

**Authorization:** admin, viewer, analyst

**Query Parameters:** None

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "entry_id",
      "userId": "user_id",
      "amount": 5000,
      "category": "salary",
      "type": "Income",
      "date": "2026-04-02",
      "notes": "Monthly salary",
      "status": "active",
      "createdAt": "2026-04-02T10:30:00Z",
      "updatedAt": "2026-04-02T10:30:00Z"
    },
    {
      "_id": "entry_id_2",
      "userId": "user_id",
      "amount": 150,
      "category": "groceries",
      "type": "Expense",
      "date": "2026-04-01",
      "notes": "Weekly shopping",
      "status": "active",
      "createdAt": "2026-04-01T15:45:00Z",
      "updatedAt": "2026-04-01T15:45:00Z"
    }
  ]
}
```

**Non-Admin Behavior:** Returns only user's own data

**Error Responses:**
- 401: Unauthorized
- 403: Forbidden
- 500: Internal server error

---

### 2. Get Single Financial Entry
**Endpoint:** `GET /api/financial-data/:id`

**Description:** Retrieve a specific financial entry by ID.

**Rate Limit:** API Limiter

**Authentication:** Required

**Authorization:** admin, viewer, analyst

**URL Parameters:**
- `id` (string, required): MongoDB ObjectId of financial entry

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "entry_id",
    "userId": "user_id",
    "amount": 5000,
    "category": "salary",
    "type": "Income",
    "date": "2026-04-02",
    "notes": "Monthly salary",
    "status": "active",
    "createdAt": "2026-04-02T10:30:00Z",
    "updatedAt": "2026-04-02T10:30:00Z"
  }
}
```

**Permission Rules:**
- Admin: Can access any entry
- Non-Admin: Can only access own entries

**Error Responses:**
- 401: Unauthorized
- 403: Forbidden (accessing another user's entry without admin role)
- 404: Entry not found
- 500: Internal server error

---

### 3. Create Financial Entry
**Endpoint:** `POST /api/create-report`

**Description:** Create a new financial record (income or expense).

**Rate Limit:** API Limiter

**Authentication:** Required

**Authorization:** admin

**Request Body:**
```json
{
  "amount": "number (required, must be positive)",
  "category": "string (required)",
  "date": "string (required, ISO date format: YYYY-MM-DD)",
  "notes": "string (optional)",
  "type": "string (required, enum: Income|Expense)"
}
```

**Field Details:**
- `amount`: Positive number representing transaction amount
- `category`: Any string, e.g., "salary", "groceries", "utilities"
- `date`: Valid date in YYYY-MM-DD format
- `notes`: Additional details (max length varies)
- `type`: Either "Income" or "Expense"

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "newly_created_entry_id",
    "userId": "authenticated_user_id",
    "amount": 5000,
    "category": "salary",
    "type": "Income",
    "date": "2026-04-02",
    "notes": "Monthly salary",
    "createdAt": "2026-04-02T11:00:00Z",
    "updatedAt": "2026-04-02T11:00:00Z"
  }
}
```

**Error Responses:**
- 400: Missing/invalid required fields
- 401: Unauthorized
- 403: Forbidden (non-admin user)
- 500: Internal server error

---

### 4. Update Financial Entry
**Endpoint:** `PUT /api/update-report/:id`

**Description:** Modify an existing financial entry.

**Rate Limit:** API Limiter

**Authentication:** Required

**Authorization:** admin (all entries), user (own entries - permission enforced server-side)

**URL Parameters:**
- `id` (string, required): MongoDB ObjectId of entry to update

**Request Body:**
```json
{
  "amount": "number (optional)",
  "category": "string (optional)",
  "date": "string (optional, ISO date format: YYYY-MM-DD)",
  "notes": "string (optional)",
  "type": "string (optional, enum: Income|Expense)"
}
```

**Partial Updates:** Send only fields you want to update. Omitted fields retain their current values.

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "entry_id",
    "userId": "user_id",
    "amount": 5500,
    "category": "salary",
    "type": "Income",
    "date": "2026-04-02",
    "notes": "Updated monthly salary",
    "createdAt": "2026-04-02T10:30:00Z",
    "updatedAt": "2026-04-02T12:00:00Z"
  }
}
```

**Permission Rules:**
- Admin: Can update any entry
- Non-Admin: Can only update own entries (policy enforced on server)

**Error Responses:**
- 401: Unauthorized
- 403: Forbidden (non-admin trying to update another user's entry)
- 404: Entry not found
- 500: Internal server error

---

### 5. Delete Financial Entry
**Endpoint:** `DELETE /api/delete-report/:id`

**Description:** Remove a financial entry from the database.

**Rate Limit:** API Limiter

**Authentication:** Required

**Authorization:** admin (all entries), user (own entries - permission enforced server-side)

**URL Parameters:**
- `id` (string, required): MongoDB ObjectId of entry to delete

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Financial entry deleted successfully"
}
```

**Permission Rules:**
- Admin: Can delete any entry
- Non-Admin: Can only delete own entries (policy enforced on server)

**Error Responses:**
- 401: Unauthorized
- 403: Forbidden (non-admin trying to delete another user's entry)
- 404: Entry not found
- 500: Internal server error

**Note:** Deletion is permanent. Ensure confirmation before requesting deletion.

---

### 6. Filter Records
**Endpoint:** `GET /api/filter-records`

**Description:** Filter financial records based on date, category, type, and notes with case-insensitive matching.

**Rate Limit:** API Limiter

**Authentication:** Required

**Authorization:** admin, viewer, analyst

**Query Parameters:**
```
?date=YYYY-MM-DD&category=string&type=string&notes=string
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string (YYYY-MM-DD) | No | Filter by specific date (returns all entries for that day) |
| `category` | string | No | Filter by category (exact match after trim) |
| `type` | string | No | Filter by transaction type (Income/Expense) |
| `notes` | string | No | Filter by notes (case-insensitive partial match) |

**Multiple Filters:** Combine any parameters. All must match (AND logic).

**Examples:**
```
/api/filter-records?date=2026-04-02
/api/filter-records?category=salary&type=Income
/api/filter-records?date=2026-04-02&category=groceries&type=Expense
/api/filter-records?notes=monthly
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "entry_id",
      "userId": "user_id",
      "amount": 150,
      "category": "groceries",
      "type": "Expense",
      "date": "2026-04-02",
      "notes": "Weekly groceries",
      "createAt": "2026-04-02T15:30:00Z",
      "updatedAt": "2026-04-02T15:30:00Z"
    }
  ]
}
```

**Non-Admin Behavior:** Automatically filters to show only user's own data

**Filter Behavior:**
- **Date:** Matches entire day (00:00:00 to 23:59:59)
- **Category:** Case-sensitive after whitespace trim
- **Type:** Case-sensitive
- **Notes:** Case-insensitive regex search
- **Empty Result:** Returns empty array if no matches

**Error Responses:**
- 400: Invalid date format
- 401: Unauthorized
- 403: Forbidden
- 500: Internal server error

---

### 7. Search Records
**Endpoint:** `GET /api/search-records`

**Description:** Search financial records by keyword and/or amount range.

**Rate Limit:** API Limiter

**Authentication:** Required

**Authorization:** admin, viewer, analyst

**Query Parameters:**
```
?keyword=string&minAmount=number&maxAmount=number
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | No | Search in category and notes (case-insensitive) |
| `minAmount` | number | No | Minimum transaction amount (inclusive) |
| `maxAmount` | number | No | Maximum transaction amount (inclusive) |

**Search Logic:**
- Keyword searches both `category` and `notes` fields (OR logic)
- Amount filters use range comparison (AND logic)
- All parameters are optional; can combine any

**Examples:**
```
/api/search-records?keyword=salary
/api/search-records?minAmount=100&maxAmount=500
/api/search-records?keyword=grocery&minAmount=50&maxAmount=200
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "entry_id",
      "userId": "user_id",
      "amount": 150,
      "category": "groceries",
      "type": "Expense",
      "date": "2026-04-02",
      "notes": "Weekly groceries",
      "createdAt": "2026-04-02T15:30:00Z",
      "updatedAt": "2026-04-02T15:30:00Z"
    },
    {
      "_id": "entry_id_2",
      "userId": "user_id",
      "amount": 200,
      "category": "grocery_delivery",
      "type": "Expense",
      "date": "2026-04-01",
      "notes": "Online grocery order",
      "createdAt": "2026-04-01T18:00:00Z",
      "updatedAt": "2026-04-01T18:00:00Z"
    }
  ]
}
```

**Non-Admin Behavior:** Automatically limits to user's own data

**Search Behavior:**
- **Keyword:** Case-insensitive regex match
- **Amount Range:** Inclusive on both ends
- **No Parameters:** Returns all user's records (admins) or own records
- **Empty Result:** Returns empty array if no matches

**Error Responses:**
- 401: Unauthorized
- 403: Forbidden
- 500: Internal server error

---

## Response Examples

### Success Response Pattern
```json
{
  "success": true,
  "data": { ... } or [ ... ]
}
```

### Error Response Pattern
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

### Single Entry Structure
```json
{
  "_id": "MongoDB ObjectId string",
  "userId": "MongoDB ObjectId of entry owner",
  "amount": 5000,
  "category": "string",
  "type": "Income|Expense",
  "date": "2026-04-02",
  "notes": "optional string description",
  "status": "active",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

### User Object Structure
```json
{
  "_id": "MongoDB ObjectId string",
  "username": "username",
  "email": "user@example.com",
  "password": "bcrypt hashed password",
  "role": "admin|analyst|viewer",
  "status": "active",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

---

## Complete Request/Response Examples

### Example 1: User Registration
**Request:**
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure_password_123",
    "role": "analyst"
  }'
```

**Response (201):**
```json
{
  "success": "User registered successfully",
  "user": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "analyst",
    "status": "active",
    "createdAt": "2026-04-02T10:30:00Z",
    "updatedAt": "2026-04-02T10:30:00Z"
  }
}
```

---

### Example 2: User Login
**Request:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure_password_123"
  }'
```

**Response (200):**
```json
{
  "success": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTFiMmMzZDRlNWY2Zzd..."
}
```

**Set-Cookie Header:**
```
token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=strict; Max-Age=3600000
```

---

### Example 3: Create Financial Entry
**Request:**
```bash
curl -X POST http://localhost:8000/api/create-report \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "amount": 5000,
    "category": "salary",
    "date": "2026-04-02",
    "notes": "Monthly salary",
    "type": "Income"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64b2c3d4e5f6g7h8i9j0k1l2",
    "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "amount": 5000,
    "category": "salary",
    "type": "Income",
    "date": "2026-04-02",
    "notes": "Monthly salary",
    "createdAt": "2026-04-02T11:00:00Z",
    "updatedAt": "2026-04-02T11:00:00Z"
  }
}
```

---

### Example 4: Get Dashboard Summary
**Request:**
```bash
curl -X GET http://localhost:8000/dashboard/summary \
  -H "Cookie: token=<jwt_token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalIncome": 15000,
    "totalExpenses": 8500,
    "netBalance": 6500,
    "categoryWiseTotalsIncome": [
      {
        "_id": "salary",
        "total": 15000
      }
    ],
    "categoryWiseTotalsExpenses": [
      {
        "_id": "groceries",
        "total": 3000
      },
      {
        "_id": "utilities",
        "total": 2500
      },
      {
        "_id": "entertainment",
        "total": 3000
      }
    ],
    "monthlyTrends": [
      {
        "_id": {
          "month": 4,
          "year": 2026
        },
        "totalIncome": 15000,
        "totalExpenses": 8500
      }
    ],
    "recentActivityIncome": [
      {
        "_id": "64b2c3d4e5f6g7h8i9j0k1l2",
        "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
        "amount": 5000,
        "category": "salary",
        "type": "Income",
        "date": "2026-04-02",
        "notes": "Monthly salary",
        "createdAt": "2026-04-02T11:00:00Z"
      },
      {
        "_id": "64b2c3d4e5f6g7h8i9j0k1l3",
        "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
        "amount": 10000,
        "category": "salary",
        "type": "Income",
        "date": "2026-03-02",
        "notes": "Monthly salary",
        "createdAt": "2026-03-02T11:00:00Z"
      }
    ],
    "recentActivityExpenses": [
      {
        "_id": "64b2c3d4e5f6g7h8i9j0k1l4",
        "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
        "amount": 150,
        "category": "groceries",
        "type": "Expense",
        "date": "2026-04-02",
        "notes": "Weekly groceries",
        "createdAt": "2026-04-02T15:30:00Z"
      }
    ]
  }
}
```

---

### Example 5: Filter Records
**Request:**
```bash
curl -X GET "http://localhost:8000/api/filter-records?date=2026-03-06&category=Shopping" \
  -H "Cookie: token=<jwt_token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64b2c3d4e5f6g7h8i9j0k1l4",
      "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
      "amount": 150,
      "category": "groceries",
      "type": "Expense",
      "date": "2026-04-02",
      "notes": "Weekly groceries",
      "createdAt": "2026-04-02T15:30:00Z",
      "updatedAt": "2026-04-02T15:30:00Z"
    }
  ]
}
```

---

### Example 6: Search Records
**Request:**
```bash
curl -X GET "http://localhost:8000/api/search-records?keyword=salary&minAmount=10000&maxAmount=50000" \
  -H "Cookie: token=<jwt_token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64b2c3d4e5f6g7h8i9j0k1l2",
      "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
      "amount": 5000,
      "category": "salary",
      "type": "Income",
      "date": "2026-04-02",
      "notes": "Monthly salary",
      "createdAt": "2026-04-02T11:00:00Z",
      "updatedAt": "2026-04-02T11:00:00Z"
    }
  ]
}
```

---

## Important Notes

### Security Considerations
1. **Token Storage:** Tokens are stored in HTTP-only cookies to prevent XSS attacks
2. **Password Security:** Passwords are hashed using bcrypt with salt (10 rounds)
3. **CORS Policy:** API accepts requests from all origins (`*`)
4. **Role Enforcement:** All endpoints validate user role before processing requests
5. **Data Isolation:** Non-admin users can only access their own financial data

### Data Format Standards
1. **Dates:** Use ISO format (YYYY-MM-DD) for date inputs
2. **Amounts:** Use numeric values (integers or decimals)
3. **Case Sensitivity:** Most fields are case-sensitive except in search operations
4. **Whitespace:** Leading/trailing whitespace is trimmed from strings

### Best Practices
1. Always include `Content-Type: application/json` header in requests
2. Store JWT token securely (browser will handle HTTP-only cookie)
3. Implement retry logic for rate-limited responses (429)
4. Validate input data before sending to API
5. Handle all possible error responses in client application
6. Use appropriate HTTP methods (GET for retrieval, POST for creation, PUT for updates, DELETE for removal)

### API Limitations
1. **Dashboard Access:** Only admin and analyst roles can access dashboard
2. **Financial Entry Creation:** Only admin users can create financial entries
3. **Data Visibility:** Non-admin users see only their own financial data
4. **Token Expiration:** Tokens expire after 1 hour; users must log in again
5. **Rate Limiting:** Excessive requests will be rejected with 429 status

---

## Author & Creator

**📝 Name:** Rayudu Bharani Satya Siva Durga Prasad

### Social & Professional Links
- 🔗 **LinkedIn:** [LinkedIn profile of Rayudu Bharani](https://www.linkedin.com/in/rayudu-bharani)
- 💻 **GitHub:** [GitHub profile of Rayudu Bharani](https://github.com/RayuduBharani)
- 🌐 **Portfolio:** [Rayudu Bharani portfolio website](https://rayudubharani.vercel.app)

---

## Version Information
- **API Version:** 1.0
- **Last Updated:** April 2, 2026
- **Node.js Environment:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT with HTTP-only Cookies

---

## Support & Documentation
For additional support or to report issues with the API:
1. Check the error messages in API responses
2. Verify your authentication token is valid
3. Ensure you have the required permissions for the endpoint
4. Confirm all required fields are provided
5. Check that data format matches specifications

