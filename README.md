# 🏥 OPD-EMR - Professional Healthcare Management System

A modern, enterprise-grade Electronic Medical Record (EMR) system designed for outpatient departments and healthcare facilities. Built with React.js frontend and Node.js backend, featuring a professional design inspired by industry-leading EMR systems like Epic, Cerner, and Allscripts.

![OPD-EMR Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React Version](https://img.shields.io/badge/React-18.2.0-blue)
![Node Version](https://img.shields.io/badge/Node-18.0+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ **Professional Features**

### 🎨 **Enterprise-Grade Design System**
- **Professional Color Palette**: Medical-grade color scheme with accessibility compliance
- **Modern Typography**: Inter font family with proper hierarchy and readability
- **Responsive Layout**: Mobile-first design with professional breakpoints
- **Consistent Components**: Unified design language across all screens
- **Professional Animations**: Subtle, purposeful transitions and micro-interactions

### 🏥 **Core Healthcare Modules**
- **Patient Management**: Comprehensive patient registration and records
- **Doctor Dashboard**: Professional consultation interface
- **E-Prescriptions**: Digital prescription management
- **Billing System**: Professional invoice generation
- **Medical Records**: Secure patient data storage
- **Appointment Scheduling**: Integrated calendar system

### 🔒 **Security & Compliance**
- **JWT Authentication**: Secure user authentication
- **Role-Based Access**: Doctor, Admin, and Staff permissions
- **Data Encryption**: Secure data transmission and storage
- **Audit Trails**: Complete activity logging
- **HIPAA Compliance**: Healthcare data protection standards

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18.0+ 
- npm 8.0+
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/opd-emr.git
   cd opd-emr
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Initialize Database**
   ```bash
   npm run init-db
   ```

5. **Start Backend Server**
   ```bash
   npm run dev
   ```

6. **Start Frontend Application**
   ```bash
   # In a new terminal, from the root directory
   npm start
   ```

7. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Default Login Credentials
- **Username**: admin@opd-emr.com
- **Password**: admin123

## 🏗️ **System Architecture**

### Frontend (React.js)
```
src/
├── components/          # Reusable UI components
│   ├── Dashboard.js     # Main dashboard interface
│   ├── PatientForm.js   # Patient registration form
│   ├── PatientList.js   # Patient management interface
│   ├── DoctorDashboard.js # Doctor consultation interface
│   ├── EPrescription.js # E-prescription system
│   ├── Billing.js       # Billing and invoicing
│   └── Navbar.js        # Professional navigation
├── index.css            # Professional design system
└── App.js               # Main application component
```

### Backend (Node.js + Express)
```
backend/
├── routes/              # API endpoints
│   ├── patients.js      # Patient management API
│   ├── doctors.js       # Doctor management API
│   ├── prescriptions.js # Prescription API
│   ├── billing.js       # Billing API
│   └── auth.js          # Authentication API
├── database/            # Database management
│   └── database.js      # SQLite setup and helpers
├── server.js            # Express server configuration
└── package.json         # Dependencies and scripts
```

## 🎨 **Professional Design System**

### Color Palette
- **Primary Blue**: #1e40af (Professional healthcare blue)
- **Medical Green**: #059669 (Success and health indicators)
- **Medical Red**: #dc2626 (Alerts and warnings)
- **Neutral Grays**: Professional, accessible grayscale system

### Typography
- **Primary Font**: Inter (Modern, readable, professional)
- **Monospace**: JetBrains Mono (Code and technical data)
- **Hierarchy**: Consistent heading scale (xs to 4xl)

### Components
- **Professional Cards**: Clean, elevated design with proper shadows
- **Modern Buttons**: Consistent button system with hover states
- **Form Elements**: Professional input styling with validation
- **Data Tables**: Clean, readable table design
- **Status Indicators**: Professional status badges and indicators

## 📱 **Responsive Design**

### Breakpoints
- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

### Mobile-First Approach
- Touch-friendly interface elements
- Optimized navigation for mobile devices
- Responsive data tables and forms
- Professional mobile layouts

## 🔧 **Development**

### Available Scripts

#### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

#### Backend
```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm run init-db    # Initialize database
npm run reset-db   # Reset database
npm run migrate-ids # Migrate patient IDs to sequential format
```

### Database Management
```bash
# Initialize fresh database
npm run init-db

# Reset database (clear all data)
npm run reset-db

# Migrate patient IDs to sequential format
npm run migrate-ids
```

## 🗄️ **Database Schema**

### Core Tables
- **patients**: Patient information and medical records
- **doctors**: Doctor profiles and credentials
- **prescriptions**: E-prescriptions and medications
- **billing**: Patient billing and payments
- **appointments**: Scheduling and consultations
- **medical_records**: Comprehensive patient history

### Key Features
- **Sequential Patient IDs**: Professional numbering system (1, 2, 3...)
- **Foreign Key Relationships**: Data integrity and consistency
- **Audit Fields**: Created/updated timestamps
- **Soft Deletes**: Data preservation and recovery

## 🔌 **API Endpoints**

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - User profile

### Patients
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Soft delete patient

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/daily-patients` - Daily patient list
- `GET /api/doctors/stats` - Doctor statistics

### Prescriptions
- `GET /api/prescriptions` - List prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/:id` - Get prescription details

### Billing
- `GET /api/billing` - List all bills
- `POST /api/billing` - Create new bill
- `PUT /api/billing/:id` - Update bill status

## 🧪 **Testing**

### Frontend Testing
```bash
npm test                    # Run all tests
npm run test:coverage      # Run tests with coverage
npm run test:watch         # Run tests in watch mode
```

### Backend Testing
```bash
# Test patient ID system
npm run test-ids

# Test database connectivity
npm run init-db
```

## 🚀 **Deployment**

### Production Build
```bash
# Frontend
npm run build
npm run serve

# Backend
npm start
```

### Environment Variables
```bash
# Backend (.env)
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://yourdomain.com
```

### Docker Support
```bash
# Build and run with Docker
docker-compose up -d
```

## 📊 **Performance & Optimization**

### Frontend
- **Code Splitting**: Lazy loading for better performance
- **Optimized Bundles**: Webpack optimization
- **Image Optimization**: Responsive images and lazy loading
- **Caching**: Browser caching strategies

### Backend
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Rate Limiting**: API abuse prevention
- **Compression**: Response compression for faster loading

## 🔒 **Security Features**

### Authentication & Authorization
- **JWT Tokens**: Secure session management
- **Password Hashing**: bcrypt encryption
- **Role-Based Access**: Granular permissions
- **Session Management**: Secure logout and token refresh

### Data Protection
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **CORS Configuration**: Controlled cross-origin access

### Security Headers
- **Helmet.js**: Security middleware
- **Rate Limiting**: API abuse prevention
- **Request Validation**: Input sanitization
- **Audit Logging**: Complete activity tracking

## 🌟 **Professional Features**

### User Experience
- **Intuitive Navigation**: Professional navigation structure
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Fast loading and smooth interactions

### Healthcare Specific
- **Medical Terminology**: Professional healthcare language
- **Data Validation**: Medical data integrity
- **Print Support**: Professional document printing
- **Export Capabilities**: Data export in multiple formats

### Enterprise Features
- **Multi-User Support**: Role-based access control
- **Audit Trails**: Complete activity logging
- **Backup & Recovery**: Data protection strategies
- **Scalability**: Designed for growth

## 🤝 **Contributing**

### Development Guidelines
1. **Code Style**: Follow ESLint configuration
2. **Component Design**: Use professional design system
3. **Testing**: Write tests for new features
4. **Documentation**: Update documentation for changes
5. **Accessibility**: Ensure WCAG compliance

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Make professional-quality changes
4. Test thoroughly
5. Submit pull request with detailed description

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### Documentation
- [User Guide](docs/user-guide.md)
- [API Reference](docs/api-reference.md)
- [Development Guide](docs/development.md)

### Issues & Support
- **GitHub Issues**: Report bugs and feature requests
- **Email Support**: support@opd-emr.com
- **Documentation**: Comprehensive guides and tutorials

### Community
- **Discussions**: GitHub Discussions
- **Contributing**: Development guidelines
- **Code of Conduct**: Community standards

## 🏆 **Professional Standards**

This system is designed to meet enterprise healthcare software standards:

- **HIPAA Compliance**: Healthcare data protection
- **WCAG 2.1 AA**: Accessibility standards
- **ISO 27001**: Information security management
- **FDA Guidelines**: Medical software compliance
- **Professional UI/UX**: Industry-leading design patterns

---

**Built with ❤️ for the healthcare community**

*OPD-EMR - Professional Healthcare Management Made Simple*
