# 🏥 Robust OPD-EMR Lab Tests System

A production-ready laboratory test management system with robust SQLite handling, multi-user support, and automatic error recovery.

## 🚀 Quick Start

### 1. Start the System
```bash
# Windows
start-robust-system.bat

# Manual start
cd backend && node server.js
# In another terminal
npm start
```

### 2. Update Lab Test Prices
```bash
node update-prices-robust.js
```

### 3. Test the System
```bash
node test-robust-system.js
```

## 🔧 Key Features

### ✅ Robust Database Handling
- **SQLite Retry Logic**: Automatically retries on `SQLITE_BUSY` errors
- **Connection Pooling**: Efficient database connection management
- **Transaction Support**: Safe multi-test order creation
- **WAL Mode**: Better concurrency for multi-user environments

### ✅ Multi-User Support
- **Database Locking Prevention**: Handles concurrent access gracefully
- **Automatic Retry**: Exponential backoff for busy database scenarios
- **Connection Timeout**: 30-second timeout for database operations
- **Proper Statement Finalization**: Prevents resource leaks

### ✅ Frontend Resilience
- **Retry Logic**: Automatic retry on network/server errors
- **Error Recovery**: User-friendly error messages with retry options
- **Loading States**: Clear feedback during operations
- **Duplicate Prevention**: Prevents duplicate test selections

### ✅ Error Handling
- **Comprehensive Error Messages**: Clear, actionable error descriptions
- **Graceful Degradation**: System continues working even with partial failures
- **User-Friendly Alerts**: Toast notifications for user actions
- **Logging**: Detailed console logging for debugging

## 📁 File Structure

```
backend/
├── utils/
│   └── database.js              # Robust database manager with retry logic
├── services/
│   └── labTestsService.js       # Lab tests business logic
└── routes/
    └── lab-tests-robust.js      # Robust API endpoints

src/
├── services/
│   └── labTestsService.js       # Frontend service with retry logic
├── hooks/
│   └── useLabTests.js          # React hook for lab tests
└── components/
    └── LabTestSelector.js       # Robust lab test selection component
```

## 🔄 How It Works

### Backend Flow
1. **Database Connection**: Uses `DatabaseManager` with retry logic
2. **Service Layer**: `LabTestsService` handles business logic
3. **API Routes**: Robust endpoints with error handling
4. **Transaction Support**: Safe multi-test order creation

### Frontend Flow
1. **Service Layer**: `labTestsService` with retry logic
2. **React Hook**: `useLabTests` manages state and retries
3. **UI Component**: `LabTestSelector` with error handling
4. **Real-time Updates**: Immediate UI feedback

### Error Recovery
1. **Database Busy**: Automatic retry with exponential backoff
2. **Network Errors**: Retry with increasing delays
3. **Server Errors**: Graceful degradation with user feedback
4. **Validation Errors**: Clear error messages

## 🛠️ API Endpoints

### Lab Tests
- `GET /api/lab-tests/tests?all=true` - Get all lab tests
- `GET /api/lab-tests/categories` - Get test categories
- `POST /api/lab-tests/orders` - Create lab test order
- `PUT /api/lab-tests/prices` - Update all prices
- `GET /api/lab-tests/health` - Health check

### Error Responses
```json
{
  "error": "Database is temporarily busy. Please try again in a moment.",
  "retryAfter": 2,
  "operation": "fetch lab tests"
}
```

## 🔧 Configuration

### Environment Variables
```bash
REACT_APP_API_BASE_URL=http://localhost:3001
PORT=3001
```

### Database Settings
- **WAL Mode**: Enabled for better concurrency
- **Busy Timeout**: 30 seconds
- **Foreign Keys**: Enabled
- **Synchronous Mode**: NORMAL for performance

## 🧪 Testing

### Run System Tests
```bash
node test-robust-system.js
```

### Test Scenarios
1. ✅ Health check and connectivity
2. ✅ Lab tests retrieval with retry
3. ✅ Search functionality
4. ✅ Category filtering
5. ✅ Price updates
6. ✅ Order creation with transactions
7. ✅ Multi-user concurrent access

## 🚨 Troubleshooting

### Common Issues

#### "Database is locked" Error
- **Cause**: Multiple processes accessing database
- **Solution**: System automatically retries with backoff
- **Prevention**: Proper connection management

#### "Failed to fetch" Error
- **Cause**: Network or server issues
- **Solution**: Automatic retry with exponential backoff
- **Prevention**: Robust error handling

#### "SQLITE_BUSY" Error
- **Cause**: Database busy with other operations
- **Solution**: Retry logic with increasing delays
- **Prevention**: WAL mode and proper locking

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## 📊 Performance

### Database Operations
- **Connection Timeout**: 30 seconds
- **Retry Attempts**: 3-5 attempts
- **Retry Delay**: 100ms to 5 seconds (exponential backoff)
- **Transaction Support**: Full ACID compliance

### Frontend Operations
- **Retry Logic**: 3 attempts with backoff
- **Error Recovery**: Automatic retry on recoverable errors
- **User Feedback**: Real-time loading states and error messages

## 🔒 Security

### Database Security
- **Parameterized Queries**: Prevents SQL injection
- **Connection Pooling**: Limits concurrent connections
- **Transaction Isolation**: Proper data consistency

### API Security
- **Rate Limiting**: Prevents abuse
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Comprehensive data validation

## 🎯 Multi-User Support

### Concurrent Access
- **WAL Mode**: Multiple readers, single writer
- **Retry Logic**: Handles database busy scenarios
- **Connection Management**: Proper resource cleanup

### Data Consistency
- **Transactions**: Atomic operations
- **Locking**: Proper database locking
- **Error Handling**: Graceful conflict resolution

## 📈 Monitoring

### Health Checks
- **Database Status**: Connection and query health
- **API Status**: Endpoint availability
- **Error Rates**: Track and monitor failures

### Logging
- **Console Logs**: Detailed operation logs
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Operation timing

## 🚀 Deployment

### Production Setup
1. Set environment variables
2. Configure database path
3. Set up monitoring
4. Configure logging
5. Test multi-user scenarios

### Docker Support
```dockerfile
# Backend
FROM node:18
WORKDIR /app
COPY backend/ .
RUN npm install
EXPOSE 3001
CMD ["node", "server.js"]

# Frontend
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 License

This project is part of the OPD-EMR system and follows the same licensing terms.

## 🤝 Contributing

1. Follow the robust error handling patterns
2. Add comprehensive error messages
3. Include retry logic for database operations
4. Test multi-user scenarios
5. Update documentation

---

**🎉 The system is now production-ready with robust SQLite handling, multi-user support, and automatic error recovery!**
