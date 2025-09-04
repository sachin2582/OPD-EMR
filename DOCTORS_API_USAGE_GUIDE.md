# Doctors REST API - Usage Guide

## 🚀 Getting Started

### Base URL
```
http://localhost:3001/api/doctors
```

### Authentication
Currently, the API doesn't require authentication. In production, you should add JWT tokens or API keys.

---

## 📋 API Endpoints Usage

### 1. Create a New Doctor
**POST** `/api/doctors`

#### Required Fields:
- `name` (string): Doctor's full name
- `specialization` (string): Medical specialty
- `contactNumber` (string): 10-digit phone number

#### Optional Fields:
- `email` (string): Valid email address
- `qualification` (string): Medical qualifications
- `experienceYears` (number): Years of experience
- `availability` (string): Working hours

#### Example Request:
```javascript
// Using fetch
const response = await fetch('http://localhost:3001/api/doctors', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "Dr. Sarah Johnson",
    specialization: "Cardiology",
    contactNumber: "9876543210",
    email: "sarah.johnson@hospital.com",
    qualification: "MD, DM Cardiology",
    experienceYears: 12,
    availability: "Mon-Fri 9AM-6PM"
  })
});

const result = await response.json();
console.log(result);
```

```javascript
// Using axios
const axios = require('axios');

const newDoctor = {
  name: "Dr. Sarah Johnson",
  specialization: "Cardiology",
  contactNumber: "9876543210",
  email: "sarah.johnson@hospital.com",
  qualification: "MD, DM Cardiology",
  experienceYears: 12,
  availability: "Mon-Fri 9AM-6PM"
};

const response = await axios.post('http://localhost:3001/api/doctors', newDoctor);
console.log(response.data);
```

#### Example Response:
```json
{
  "success": true,
  "message": "Doctor created successfully",
  "doctor": {
    "id": 4,
    "doctorId": "DOC-400588-RNB",
    "name": "Dr. Sarah Johnson",
    "specialization": "Cardiology",
    "phone": "9876543210",
    "email": "sarah.johnson@hospital.com",
    "qualification": "MD, DM Cardiology",
    "experienceYears": 12,
    "availability": "Mon-Fri 9AM-6PM",
    "isActive": 1,
    "createdAt": "2025-09-04T07:03:20.000Z",
    "updatedAt": "2025-09-04T07:03:20.000Z"
  }
}
```

---

### 2. Get All Doctors
**GET** `/api/doctors`

#### Query Parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search by name, specialization, or qualification
- `specialization` (string): Filter by specialization
- `isActive` (boolean): Filter by active status

#### Example Requests:
```javascript
// Get all doctors
const response = await fetch('http://localhost:3001/api/doctors');
const data = await response.json();

// Get doctors with pagination
const response = await fetch('http://localhost:3001/api/doctors?page=1&limit=10');
const data = await response.json();

// Search doctors
const response = await fetch('http://localhost:3001/api/doctors?search=cardiology');
const data = await response.json();

// Filter by specialization
const response = await fetch('http://localhost:3001/api/doctors?specialization=Cardiology');
const data = await response.json();

// Get only active doctors
const response = await fetch('http://localhost:3001/api/doctors?isActive=true');
const data = await response.json();
```

#### Example Response:
```json
{
  "success": true,
  "doctors": [
    {
      "id": 1,
      "doctorId": "DOC-123456-ABC",
      "name": "Dr. John Smith",
      "specialization": "General Physician",
      "phone": "9876543210",
      "email": "john.smith@hospital.com",
      "qualification": "MBBS, MD",
      "experienceYears": 8,
      "availability": "Mon-Fri 9AM-5PM",
      "isActive": 1,
      "createdAt": "2025-09-04T06:00:00.000Z",
      "updatedAt": "2025-09-04T06:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "total": 1,
    "limit": 20
  }
}
```

---

### 3. Get Doctor by ID
**GET** `/api/doctors/:id`

#### Parameters:
- `id`: Doctor ID (numeric) or doctorId (string)

#### Example Requests:
```javascript
// Get by numeric ID
const response = await fetch('http://localhost:3001/api/doctors/1');
const data = await response.json();

// Get by doctorId string
const response = await fetch('http://localhost:3001/api/doctors/DOC-123456-ABC');
const data = await response.json();
```

#### Example Response:
```json
{
  "success": true,
  "doctor": {
    "id": 1,
    "doctorId": "DOC-123456-ABC",
    "name": "Dr. John Smith",
    "specialization": "General Physician",
    "phone": "9876543210",
    "email": "john.smith@hospital.com",
    "qualification": "MBBS, MD",
    "experienceYears": 8,
    "availability": "Mon-Fri 9AM-5PM",
    "isActive": 1,
    "createdAt": "2025-09-04T06:00:00.000Z",
    "updatedAt": "2025-09-04T06:00:00.000Z"
  }
}
```

---

### 4. Update Doctor
**PUT** `/api/doctors/:id`

#### Parameters:
- `id`: Doctor ID (numeric) or doctorId (string)

#### Body: Partial doctor object with fields to update

#### Example Request:
```javascript
const updateData = {
  name: "Dr. John Smith Jr.",
  experienceYears: 9,
  availability: "Mon-Fri 8AM-6PM"
};

const response = await fetch('http://localhost:3001/api/doctors/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(updateData)
});

const result = await response.json();
```

#### Example Response:
```json
{
  "success": true,
  "message": "Doctor updated successfully",
  "doctor": {
    "id": 1,
    "doctorId": "DOC-123456-ABC",
    "name": "Dr. John Smith Jr.",
    "specialization": "General Physician",
    "phone": "9876543210",
    "email": "john.smith@hospital.com",
    "qualification": "MBBS, MD",
    "experienceYears": 9,
    "availability": "Mon-Fri 8AM-6PM",
    "isActive": 1,
    "createdAt": "2025-09-04T06:00:00.000Z",
    "updatedAt": "2025-09-04T07:15:30.000Z"
  }
}
```

---

### 5. Delete Doctor (Soft Delete)
**DELETE** `/api/doctors/:id`

#### Parameters:
- `id`: Doctor ID (numeric) or doctorId (string)

#### Example Request:
```javascript
const response = await fetch('http://localhost:3001/api/doctors/1', {
  method: 'DELETE'
});

const result = await response.json();
```

#### Example Response:
```json
{
  "success": true,
  "message": "Doctor deleted successfully",
  "doctor": {
    "id": 1,
    "doctorId": "DOC-123456-ABC",
    "name": "Dr. John Smith Jr.",
    "specialization": "General Physician",
    "phone": "9876543210",
    "email": "john.smith@hospital.com",
    "qualification": "MBBS, MD",
    "experienceYears": 9,
    "availability": "Mon-Fri 8AM-6PM",
    "isActive": 0,
    "createdAt": "2025-09-04T06:00:00.000Z",
    "updatedAt": "2025-09-04T07:20:15.000Z"
  }
}
```

---

## 🔧 Additional Endpoints

### 6. Get Specializations List
**GET** `/api/doctors/specializations/list`

#### Example Request:
```javascript
const response = await fetch('http://localhost:3001/api/doctors/specializations/list');
const data = await response.json();
```

#### Example Response:
```json
{
  "success": true,
  "specializations": [
    {
      "name": "Cardiology",
      "count": 2
    },
    {
      "name": "General Physician",
      "count": 3
    },
    {
      "name": "Dermatology",
      "count": 1
    }
  ]
}
```

### 7. Get Statistics Overview
**GET** `/api/doctors/stats/overview`

#### Example Request:
```javascript
const response = await fetch('http://localhost:3001/api/doctors/stats/overview');
const data = await response.json();
```

#### Example Response:
```json
{
  "success": true,
  "total": 6,
  "active": 5,
  "inactive": 1,
  "totalSpecializations": 3,
  "specializations": [
    {
      "name": "General Physician",
      "count": 3
    },
    {
      "name": "Cardiology",
      "count": 2
    },
    {
      "name": "Dermatology",
      "count": 1
    }
  ]
}
```

---

## ❌ Error Handling

### Common Error Responses:

#### 400 Bad Request (Validation Error):
```json
{
  "error": "Missing required fields",
  "message": "The following fields are required: name, specialization, contactNumber"
}
```

#### 400 Bad Request (Invalid Data):
```json
{
  "error": "Invalid contact number",
  "message": "Contact number must be exactly 10 digits"
}
```

#### 404 Not Found:
```json
{
  "error": "Doctor not found",
  "message": "No doctor found with the provided ID"
}
```

#### 500 Internal Server Error:
```json
{
  "error": "Failed to create doctor",
  "message": "An internal server error occurred"
}
```

---

## 🧪 Testing the API

### Using cURL:
```bash
# Create a doctor
curl -X POST http://localhost:3001/api/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test Doctor",
    "specialization": "Test Specialty",
    "contactNumber": "9876543210",
    "email": "test@test.com"
  }'

# Get all doctors
curl http://localhost:3001/api/doctors

# Get doctor by ID
curl http://localhost:3001/api/doctors/1

# Update doctor
curl -X PUT http://localhost:3001/api/doctors/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Dr. Updated Name"}'

# Delete doctor
curl -X DELETE http://localhost:3001/api/doctors/1
```

### Using Postman:
1. Import the collection or create requests manually
2. Set base URL: `http://localhost:3001/api/doctors`
3. Use the examples above for request bodies

---

## 🔗 Frontend Integration Examples

### React Component Example:
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/doctors');
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDoctor = async (doctorData) => {
    try {
      const response = await axios.post('http://localhost:3001/api/doctors', doctorData);
      setDoctors([...doctors, response.data.doctor]);
      return response.data;
    } catch (error) {
      console.error('Error creating doctor:', error);
      throw error;
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Doctors List</h2>
      {doctors.map(doctor => (
        <div key={doctor.id}>
          <h3>{doctor.name}</h3>
          <p>Specialization: {doctor.specialization}</p>
          <p>Phone: {doctor.phone}</p>
          <p>Email: {doctor.email}</p>
        </div>
      ))}
    </div>
  );
};

export default DoctorsList;
```

---

## 🚀 Production Considerations

1. **Authentication**: Add JWT tokens or API keys
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Input Sanitization**: Add more robust input validation
4. **Logging**: Add comprehensive logging for monitoring
5. **CORS**: Configure CORS for frontend integration
6. **HTTPS**: Use HTTPS in production
7. **Database Indexing**: Ensure proper database indexes for performance

---

## 📞 Support

If you encounter any issues:
1. Check the server logs for detailed error messages
2. Verify the database connection
3. Ensure all required fields are provided
4. Check the API endpoint URLs and HTTP methods

The API is fully functional and ready for integration with your frontend application!
