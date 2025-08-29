# OPD-EMR Backend Server

A comprehensive backend server for the OPD-EMR (Outpatient Department - Electronic Medical Records) system built with Node.js, Express, and SQLite.

## 🚀 Features

- **Patient Management**: Complete CRUD operations for patient records
- **E-Prescriptions**: Digital prescription creation and management
- **Billing System**: Patient billing and payment tracking
- **Doctor Management**: Doctor profiles and daily patient lists
- **Authentication**: JWT-based secure authentication
- **Database**: SQLite database with automatic table creation
- **API**: RESTful API with comprehensive endpoints
- **Security**: Rate limiting, CORS, and input validation

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT + bcryptjs
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Built-in request validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 4. Initialize database (optional - auto-created on first run)
```bash
npm run init-db
```

## 🌐 Server Configuration

- **Port**: 5000 (configurable via PORT environment variable)
- **Base URL**: `http://localhost:5000`
- **API Base**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/health`

## 📊 Database Schema

The system automatically creates the following tables:

### Patients Table
- Basic patient information (name, age, gender, contact details)
- Medical history, allergies, family history
- Vital signs and chief complaints
- Timestamps for creation and updates

### Doctors Table
- Doctor profiles with specialization and license
- Department and contact information
- Active/inactive status management

### Prescriptions Table
- E-prescription details with medications
- Patient and doctor relationships
- Diagnosis, symptoms, and treatment instructions
- Status tracking (active, completed, cancelled)

### Billing Table
- Patient billing information
- Service details and pricing
- Payment status and method tracking
- Revenue calculations and reporting

### Appointments Table
- Patient appointment scheduling
- Doctor availability and status
- Appointment types and notes

### Medical Records Table
- General medical record storage
- Flexible record type system
- Doctor and patient associations

## 🔐 Authentication

### Login Endpoints
- **Doctor Login**: `/api/auth/login` (userType: 'doctor')
- **Admin Login**: `/api/auth/login` (userType: 'admin')

### Default Credentials
- **Admin**: username: `admin`, password: `admin123`
- **Doctors**: Use email/license + password

### JWT Token
- Valid for 24 hours
- Include in Authorization header: `Bearer <token>`

## 📡 API Endpoints

### Authentication
```
POST /api/auth/login          - User login
POST /api/auth/register       - Doctor registration
POST /api/auth/logout         - User logout
GET  /api/auth/profile        - Get user profile
PUT  /api/auth/profile        - Update user profile
POST /api/auth/change-password - Change password
GET  /api/auth/verify         - Verify token
GET  /api/auth/system-stats   - System statistics (admin only)
```

### Patients
```
GET    /api/patients                    - List all patients
GET    /api/patients/:id                - Get patient by ID
POST   /api/patients                    - Create new patient
PUT    /api/patients/:id                - Update patient
DELETE /api/patients/:id                - Delete patient
GET    /api/patients/stats/overview     - Patient statistics
GET    /api/patients/lookup/phone/:phone - Find patient by phone
```

### Prescriptions
```
GET    /api/prescriptions                    - List all prescriptions
GET    /api/prescriptions/:id                - Get prescription by ID
POST   /api/prescriptions                    - Create new prescription
PUT    /api/prescriptions/:id                - Update prescription
DELETE /api/prescriptions/:id                - Delete prescription
GET    /api/prescriptions/patient/:patientId - Get patient prescriptions
GET    /api/prescriptions/doctor/:doctorId   - Get doctor prescriptions
GET    /api/prescriptions/stats/overview     - Prescription statistics
```

### Billing
```
GET    /api/billing                    - List all bills
GET    /api/billing/:id                - Get bill by ID
POST   /api/billing                    - Create new bill
PUT    /api/billing/:id                - Update bill
DELETE /api/billing/:id                - Delete bill
PUT    /api/billing/:id/payment        - Update payment status
GET    /api/billing/patient/:patientId - Get patient bills
GET    /api/billing/stats/overview     - Billing statistics
GET    /api/billing/stats/revenue      - Revenue reports
```

### Doctors
```
GET    /api/doctors                    - List all doctors
GET    /api/doctors/:id                - Get doctor by ID
POST   /api/doctors                    - Create new doctor
PUT    /api/doctors/:id                - Update doctor
DELETE /api/doctors/:id                - Delete doctor
GET    /api/doctors/:id/daily-patients - Get doctor's daily patients
GET    /api/doctors/:id/patient-stats  - Get doctor's patient statistics
GET    /api/doctors/:id/recent-activity - Get doctor's recent activity
GET    /api/doctors/stats/overview     - Doctor statistics
```

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable origins
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds

## 📝 Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
```

## 🧪 Testing the API

### Using cURL

#### 1. Health Check
```bash
curl http://localhost:5000/health
```

#### 2. Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","userType":"admin"}'
```

#### 3. Create Patient
```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "age": 33,
    "gender": "Male",
    "phone": "+1234567890",
    "address": "123 Main St"
  }'
```

### Using Postman

1. Import the API endpoints
2. Set base URL: `http://localhost:5000/api`
3. Use the authentication token in Authorization header

## 📊 Sample Data

The system comes with sample data:
- Default doctor: Dr. Sarah Johnson (General Physician)
- Sample patients and prescriptions can be added via API

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "error": {
    "message": "Error description",
    "stack": "Error stack trace (development only)"
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🔧 Development

### Project Structure
```
backend/
├── database/
│   └── database.js          # Database configuration and helpers
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── patients.js          # Patient management routes
│   ├── prescriptions.js     # Prescription routes
│   ├── billing.js           # Billing routes
│   └── doctors.js           # Doctor management routes
├── uploads/                 # File uploads directory
├── package.json             # Dependencies and scripts
├── server.js                # Main server file
└── README.md                # This file
```

### Adding New Routes

1. Create route file in `routes/` directory
2. Import in `server.js`
3. Add middleware and error handling
4. Update this README with new endpoints

### Database Modifications

1. Update table creation in `database/database.js`
2. Add new indexes if needed
3. Update related route files
4. Test with sample data

## 🚀 Production Deployment

### Environment Setup
```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=your-production-secret-key
```

### Security Considerations
- Use strong JWT secret
- Enable HTTPS
- Configure proper CORS origins
- Set up rate limiting
- Use environment variables for sensitive data
- Regular security updates

### Performance Optimization
- Database indexing
- Query optimization
- Connection pooling (for larger databases)
- Caching strategies
- Load balancing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper testing
4. Update documentation
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review error logs
- Test with sample data
- Verify database connectivity

## 🔄 Updates

- **v1.0.0**: Initial release with core functionality
- Patient management
- E-prescription system
- Billing management
- Doctor dashboard
- Authentication system
