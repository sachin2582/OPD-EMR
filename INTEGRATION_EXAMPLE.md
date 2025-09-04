# Doctors API Integration Example

## 🚀 How to Integrate the Doctors API into Your OPD-EMR System

### 1. Add the Doctors Management Component to Your App

Update your `src/App.js` to include the new Doctors Management component:

```javascript
// Add this import at the top
import DoctorsManagement from './components/DoctorsManagement';
import './components/DoctorsManagement.css';

// Add this route in your routing section
<Route path="/doctors" element={<DoctorsManagement />} />
```

### 2. Add Navigation Link

In your navigation component, add a link to the doctors management:

```javascript
<Link to="/doctors" className="nav-link">
  🏥 Doctors Management
</Link>
```

### 3. Update Your API Configuration

Make sure your `src/config/api.js` is properly configured:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export { api };
```

### 4. Example Usage in Other Components

#### In Appointment Scheduler:
```javascript
import { api } from '../config/api';

// Load doctors for appointment booking
const loadDoctors = async () => {
  try {
    const response = await api.get('/doctors?isActive=true');
    setDoctors(response.data.doctors);
  } catch (error) {
    console.error('Failed to load doctors:', error);
  }
};

// Get doctor details for appointment
const getDoctorDetails = async (doctorId) => {
  try {
    const response = await api.get(`/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get doctor details:', error);
    return null;
  }
};
```

#### In Dashboard:
```javascript
import { api } from '../config/api';

// Load doctor statistics for dashboard
const loadDoctorStats = async () => {
  try {
    const response = await api.get('/doctors/stats/overview');
    setStats(response.data);
  } catch (error) {
    console.error('Failed to load doctor stats:', error);
  }
};
```

### 5. Complete Integration Example

Here's a complete example of how to integrate the Doctors API:

```javascript
// src/components/AppointmentScheduler.js
import React, { useState, useEffect } from 'react';
import { api } from '../config/api';

const AppointmentScheduler = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/doctors?isActive=true');
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error('Failed to load doctors:', error);
      alert('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = async (doctorId) => {
    try {
      const response = await api.get(`/doctors/${doctorId}`);
      setSelectedDoctor(response.data);
    } catch (error) {
      console.error('Failed to get doctor details:', error);
    }
  };

  if (loading) {
    return <div>Loading doctors...</div>;
  }

  return (
    <div className="appointment-scheduler">
      <h2>Schedule Appointment</h2>
      
      <div className="doctor-selection">
        <label>Select Doctor:</label>
        <select onChange={(e) => handleDoctorSelect(e.target.value)}>
          <option value="">Choose a doctor...</option>
          {doctors.map(doctor => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} - {doctor.specialization}
            </option>
          ))}
        </select>
      </div>

      {selectedDoctor && (
        <div className="doctor-info">
          <h3>Doctor Information</h3>
          <p><strong>Name:</strong> {selectedDoctor.name}</p>
          <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>
          <p><strong>Availability:</strong> {selectedDoctor.availability}</p>
          <p><strong>Contact:</strong> {selectedDoctor.phone}</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentScheduler;
```

### 6. Testing the Integration

1. **Start your backend server:**
   ```bash
   cd backend
   node server.js
   ```

2. **Start your frontend:**
   ```bash
   npm start
   ```

3. **Navigate to the doctors management page:**
   - Go to `http://localhost:3000/doctors`
   - You should see the doctors management interface

4. **Test the functionality:**
   - Add a new doctor
   - Search and filter doctors
   - Edit doctor information
   - View statistics

### 7. API Endpoints Summary

| Method | Endpoint | Description | Use Case |
|--------|----------|-------------|----------|
| `GET` | `/api/doctors` | List all doctors | Display doctors list |
| `GET` | `/api/doctors?search=query` | Search doctors | Search functionality |
| `GET` | `/api/doctors?specialization=Cardiology` | Filter by specialization | Filter dropdown |
| `GET` | `/api/doctors?isActive=true` | Get active doctors | Appointment booking |
| `GET` | `/api/doctors/:id` | Get doctor details | Doctor profile |
| `POST` | `/api/doctors` | Create new doctor | Add doctor form |
| `PUT` | `/api/doctors/:id` | Update doctor | Edit doctor form |
| `DELETE` | `/api/doctors/:id` | Delete doctor | Remove doctor |
| `GET` | `/api/doctors/specializations/list` | Get specializations | Dropdown options |
| `GET` | `/api/doctors/stats/overview` | Get statistics | Dashboard stats |

### 8. Error Handling Best Practices

```javascript
// Always wrap API calls in try-catch blocks
try {
  const response = await api.get('/doctors');
  // Handle success
} catch (error) {
  // Handle different types of errors
  if (error.response) {
    // Server responded with error status
    console.error('Server Error:', error.response.data);
    alert(`Error: ${error.response.data.error}`);
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.message);
    alert('Network error. Please check your connection.');
  } else {
    // Other error
    console.error('Error:', error.message);
    alert('An unexpected error occurred.');
  }
}
```

### 9. Production Considerations

1. **Environment Variables:**
   ```javascript
   // Use environment variables for API base URL
   const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
   ```

2. **Authentication:**
   ```javascript
   // Add authentication headers
   api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
   ```

3. **Error Boundaries:**
   ```javascript
   // Wrap components in error boundaries
   <ErrorBoundary>
     <DoctorsManagement />
   </ErrorBoundary>
   ```

### 10. Next Steps

1. **Integrate with existing components:**
   - Update appointment scheduler to use real doctor data
   - Add doctor selection to patient forms
   - Update dashboard with doctor statistics

2. **Add more features:**
   - Doctor availability calendar
   - Appointment history per doctor
   - Doctor performance metrics

3. **Enhance UI/UX:**
   - Add loading states
   - Implement pagination
   - Add confirmation dialogs

The Doctors API is now fully integrated and ready to use in your OPD-EMR system! 🎉
