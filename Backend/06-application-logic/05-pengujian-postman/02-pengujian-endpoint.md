# 02. Panduan Pengujian Endpoint di Postman

Berikut adalah langkah-langkah manual dan contoh payload untuk melakukan pengujian CRUD API (`Users`) di Postman.

---

## ⚙️ Environment Variables (Rekomendasi)

Di Postman, buat Environment baru bernama `Local Development` dan tambahkan variabel:
- `base_url`: `http://localhost:3000`

---

## 1. GET /users (Mendapatkan Semua User)

- **Method**: `GET`
- **URL**: `{{base_url}}/users`
- **Headers**:
  - `Accept`: `application/json`

### Contoh Response (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "c1f7b8a2-3b4e-4f12-9c3d-1e2f3a4b5c6d",
      "username": "john_doe",
      "is_active": true,
      "last_login": null,
      "created_at": "2026-09-07T08:00:00.000Z",
      "updated_at": "2026-09-07T08:00:00.000Z"
    }
  ]
}
```

---

## 2. POST /users (Membuat User Baru)

- **Method**: `POST`
- **URL**: `{{base_url}}/users`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (`raw` -> `JSON`):
```json
{
  "role_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "username": "fikri_admin",
  "password": "passwordSuperRahasia123",
  "is_active": true
}
```

### Contoh Response Sukses (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "message": "User created successfully",
  "data": {
    "id": "e4a3b2c1-8d7e-6f5a-4b3c-2d1e0f9a8b7c",
    "username": "fikri_admin",
    "is_active": true,
    "last_login": null,
    "created_at": "2026-09-07T08:15:00.000Z"
  }
}
```

### Contoh Response Error Validasi Zod (400 Bad Request):
```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "String must contain at least 8 character(s)"
    }
  ]
}
```

---

## 3. GET /users/:id (Detail User)

- **Method**: `GET`
- **URL**: `{{base_url}}/users/e4a3b2c1-8d7e-6f5a-4b3c-2d1e0f9a8b7c`

### Contoh Response Error (404 Not Found):
```json
{
  "status": "error",
  "code": 404,
  "message": "User not found"
}
```

---

## 4. PATCH /users/:id (Update User)

- **Method**: `PATCH`
- **URL**: `{{base_url}}/users/e4a3b2c1-8d7e-6f5a-4b3c-2d1e0f9a8b7c`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (`raw` -> `JSON`):
```json
{
  "is_active": false,
  "last_login": "2026-09-07T08:20:00.000Z"
}
```

---

## 5. DELETE /users/:id (Hapus User)

- **Method**: `DELETE`
- **URL**: `{{base_url}}/users/e4a3b2c1-8d7e-6f5a-4b3c-2d1e0f9a8b7c`

### Contoh Response Sukses (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "User deleted successfully",
  "data": {
    "success": true,
    "id": "e4a3b2c1-8d7e-6f5a-4b3c-2d1e0f9a8b7c"
  }
}
```
