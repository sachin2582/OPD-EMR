# 🏥 Pharmacy Module - OPD-EMR System

## Overview
The Pharmacy Module is a comprehensive inventory and sales management system integrated with the OPD-EMR platform. It provides complete pharmaceutical management capabilities including inventory control, batch management, sales processing, and prescription fulfillment.

## 🚀 Features

### Core Functionality
- **Item Master Management**: Complete catalog of medicines, medical supplies, and equipment
- **Batch Management**: Track pharmaceutical batches with expiry dates and FEFO allocation
- **Stock Ledger**: Immutable audit trail of all stock movements
- **Purchase Management**: Supplier management, purchase orders, and GRN processing
- **Sales & Billing**: Prescription fulfillment, walk-in sales, and invoice generation
- **Returns Management**: Sales returns and supplier returns with batch-level handling
- **Stock Adjustments**: Manual adjustments with approval workflows
- **Role-based Access Control**: Fine-grained permissions for different user types

### Advanced Features
- **FEFO/FIFO Stock Allocation**: First-expiring-first-out by default, configurable FIFO
- **Expiry Warnings**: Automated alerts for near-expiry items
- **Barcode Support**: POS scanning capabilities for quick item lookup
- **Prescription Integration**: Seamless workflow from e-prescription to pharmacy order
- **Idempotent Operations**: Safe retry mechanisms for critical operations
- **Comprehensive Reporting**: Stock, sales, financial, and expiry reports

## 🗄️ Database Schema

### Core Tables
- `pharmacy_items`: Item master with SKU, pricing, and specifications
- `pharmacy_batches`: Batch management with expiry dates and quantities
- `pharmacy_suppliers`: Supplier information and contact details
- `pharmacy_stock_movements`: Immutable stock ledger with audit trail
- `pharmacy_invoices`: Sales invoices with prescription linking
- `pharmacy_purchase_orders`: Purchase order management
- `pharmacy_grn`: Goods received notes for stock receipts

### Key Relationships
- Items → Batches (one-to-many)
- Batches → Stock Movements (one-to-many)
- Invoices → Prescriptions (optional linking)
- Purchase Orders → GRN (one-to-many)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- SQLite3 database
- OPD-EMR backend server running

### 1. Database Setup
```bash
# Navigate to backend directory
cd backend

# Run pharmacy schema initialization
node database/pharmacy-init.js
```

### 2. Backend Integration
The pharmacy routes are automatically included in the main server:
```javascript
// Already configured in server.js
app.use('/api/pharmacy', pharmacyRoutes);
```

### 3. Frontend Components
The pharmacy components are located in:
```
src/components/pharmacy/
├── PharmacyDashboard.js      # Main dashboard
├── PharmacyDashboard.css     # Dashboard styles
├── Inventory/                # Inventory management
├── Sales/                   # Sales and billing
├── Purchases/               # Purchase management
└── Reports/                 # Reporting components
```

## 📱 API Endpoints

### Items Management
- `GET /api/pharmacy/items` - List all items with filters
- `GET /api/pharmacy/items/:id` - Get item details
- `POST /api/pharmacy/items` - Create new item
- `PUT /api/pharmacy/items/:id` - Update item
- `DELETE /api/pharmacy/items/:id` - Soft delete item

### Batch Management
- `GET /api/pharmacy/items/:id/batches` - Get batches for item
- `POST /api/pharmacy/batches` - Create new batch

### Suppliers
- `GET /api/pharmacy/suppliers` - List all suppliers
- `POST /api/pharmacy/suppliers` - Create new supplier

### Stock Movements
- `GET /api/pharmacy/items/:id/stock-movements` - Get stock history

### Prescription Integration
- `GET /api/pharmacy/prescription/items` - Get available items for prescription
- `POST /api/pharmacy/prescription/orders` - Create pharmacy order from prescription

### Dashboard & Reports
- `GET /api/pharmacy/dashboard` - Get dashboard statistics
- `GET /api/pharmacy/reports/low-stock` - Low stock report
- `GET /api/pharmacy/reports/expiry` - Expiry report

## 🔐 User Roles & Permissions

### Role Hierarchy
1. **Admin**: Full system access
2. **Pharmacist**: Inventory management, prescription processing, invoice creation
3. **Cashier**: Sales processing, returns, invoice viewing
4. **Storekeeper**: Stock management, GRN processing, adjustments
5. **Accountant**: Financial reports and data access
6. **Auditor**: Read-only access to all data

### Permission Matrix
```
Role          | Create | Edit | Delete | Adjust | Return | Export
--------------|--------|------|--------|--------|--------|--------
Admin         |   ✓    |  ✓   |   ✓    |   ✓    |   ✓    |   ✓
Pharmacist    |   ✓    |  ✓   |   ✗    |   ✓    |   ✓    |   ✓
Cashier       |   ✓    |  ✗   |   ✗    |   ✗    |   ✓    |   ✗
Storekeeper   |   ✓    |  ✓   |   ✗    |   ✓    |   ✗    |   ✗
Accountant    |   ✗    |  ✗   |   ✗    |   ✗    |   ✗    |   ✓
Auditor       |   ✗    |  ✗   |   ✗    |   ✗    |   ✗    |   ✓
```

## 💊 Prescription Integration Workflow

### 1. Doctor Creates E-Prescription
- Doctor prescribes medications in EPrescription component
- Prescription saved to database with unique ID

### 2. Pharmacy Order Creation
- Frontend calls `/api/pharmacy/prescription/orders`
- System checks stock availability for prescribed items
- Creates pharmacy invoice with prescription linking
- Allocates stock using FEFO algorithm
- Updates batch quantities and creates stock movements

### 3. Patient Pickup
- Patient presents prescription at pharmacy
- Pharmacist processes order and dispenses medications
- Invoice marked as completed

### 4. Stock Updates
- Real-time stock level updates
- Automatic low stock alerts
- Expiry warnings for batches

## 📊 Reporting & Analytics

### Available Reports
- **Stock Reports**: Current stock levels, low stock alerts
- **Sales Reports**: Daily/monthly sales, top-selling items
- **Financial Reports**: Revenue, profit margins, tax summaries
- **Expiry Reports**: Items expiring soon, batch expiry tracking
- **Reorder Reports**: Items below reorder levels
- **Audit Reports**: Complete transaction history and stock movements

### Report Features
- Export to CSV/PDF
- Date range filtering
- Real-time data updates
- Scheduled report generation
- Email notifications for critical alerts

## 🔧 Configuration

### Environment Variables
```bash
# Database configuration
PHARMACY_DB_PATH=./opd-emr.db

# Stock alert thresholds
LOW_STOCK_THRESHOLD=10
EXPIRY_WARNING_DAYS=30

# FEFO/FIFO preference
STOCK_ALLOCATION_METHOD=FEFO
```

### System Settings
- **Stock Allocation**: FEFO (default) or FIFO
- **Expiry Warning Days**: Configurable warning period
- **Low Stock Thresholds**: Per-item reorder levels
- **Tax Rates**: Configurable GST/VAT rates
- **Approval Workflows**: Manager approval for adjustments

## 🚨 Alerts & Notifications

### Automatic Alerts
- **Low Stock**: Items below reorder level
- **Expiry Warnings**: Batches expiring soon
- **Negative Stock**: Attempted sales with insufficient stock
- **Batch Expiry**: Expired batches requiring write-off

### Alert Channels
- Dashboard notifications
- Email alerts (configurable)
- SMS notifications (optional)
- In-app popup alerts

## 📱 Frontend Components

### Main Dashboard
- Overview statistics
- Quick action buttons
- Recent activity feed
- Alert notifications
- Module navigation

### Inventory Management
- Item catalog with search/filter
- Batch management interface
- Stock level monitoring
- Add/edit item forms

### Sales Interface
- Quick sale form
- Prescription processing
- Invoice generation
- Returns management

### Purchase Management
- Supplier management
- Purchase order creation
- GRN processing
- Stock receipt workflow

## 🧪 Testing

### Unit Tests
```bash
# Run pharmacy module tests
npm test -- --grep "pharmacy"
```

### Integration Tests
```bash
# Test prescription integration
npm run test:integration:pharmacy
```

### Test Coverage
- Stock allocation algorithms (FEFO/FIFO)
- Prescription workflow
- Stock movement calculations
- User permission validation

## 🚀 Deployment

### Production Checklist
- [ ] Database migrations completed
- [ ] User roles configured
- [ ] Backup procedures in place
- [ ] Monitoring and alerting configured
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] Logging and audit trails enabled

### Performance Optimization
- Database indexing on frequently queried fields
- Query optimization for large datasets
- Caching for static data (suppliers, item types)
- Pagination for large result sets
- Background job processing for reports

## 🔒 Security Features

### Data Protection
- Role-based access control
- Audit logging for all operations
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Compliance
- HIPAA-compliant data handling
- Audit trail maintenance
- Secure user authentication
- Data encryption at rest
- Regular security audits

## 📞 Support & Maintenance

### Troubleshooting
- Check database connectivity
- Verify user permissions
- Review error logs
- Test API endpoints
- Validate data integrity

### Maintenance Tasks
- Regular database backups
- Log rotation and cleanup
- Performance monitoring
- Security updates
- User access reviews

## 🔮 Future Enhancements

### Planned Features
- **Mobile App**: Pharmacy staff mobile interface
- **Advanced Analytics**: Machine learning for demand forecasting
- **Integration APIs**: Third-party pharmacy system integration
- **Multi-location Support**: Branch pharmacy management
- **Advanced Reporting**: Custom report builder
- **Automated Reordering**: AI-powered inventory optimization

### Technology Upgrades
- Real-time notifications (WebSocket)
- Advanced search (Elasticsearch)
- Document management (file uploads)
- API versioning
- GraphQL support

## 📚 Additional Resources

### Documentation
- [API Reference](./API_REFERENCE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [User Manual](./USER_MANUAL.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)

### Support
- **Technical Issues**: Create GitHub issue
- **Feature Requests**: Submit enhancement proposal
- **Documentation**: Submit pull request
- **Community**: Join discussion forum

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainer**: OPD-EMR Development Team  
**License**: MIT License
