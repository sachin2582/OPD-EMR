-- Pharmacy Module Database Schema
-- OPD-EMR Pharmacy Management System

-- Items Master Table
CREATE TABLE IF NOT EXISTS pharmacy_items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    brand VARCHAR(255),
    unit VARCHAR(50) NOT NULL,
    item_type VARCHAR(100) NOT NULL, -- Medicine, Medical Supplies, Equipment
    hsn_sac VARCHAR(20),
    mrp DECIMAL(10,2) NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    min_stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0.00, -- GST %
    is_prescription_required BOOLEAN DEFAULT FALSE,
    barcode VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS pharmacy_suppliers (
    supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    gst_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batch Management Table
CREATE TABLE IF NOT EXISTS pharmacy_batches (
    batch_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    batch_no VARCHAR(100) NOT NULL,
    manufacture_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    qty INTEGER NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    supplier_id INTEGER,
    purchase_order_id INTEGER,
    grn_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES pharmacy_items(item_id),
    FOREIGN KEY (supplier_id) REFERENCES pharmacy_suppliers(supplier_id)
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS pharmacy_purchase_orders (
    po_id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery DATE,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, partial, completed, cancelled
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES pharmacy_suppliers(supplier_id)
);

-- Purchase Order Items Table
CREATE TABLE IF NOT EXISTS pharmacy_po_items (
    po_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (po_id) REFERENCES pharmacy_purchase_orders(po_id),
    FOREIGN KEY (item_id) REFERENCES pharmacy_items(item_id)
);

-- GRN (Goods Received Note) Table
CREATE TABLE IF NOT EXISTS pharmacy_grn (
    grn_id INTEGER PRIMARY KEY AUTOINCREMENT,
    grn_number VARCHAR(50) UNIQUE NOT NULL,
    po_id INTEGER,
    supplier_id INTEGER NOT NULL,
    receipt_date DATE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    notes TEXT,
    received_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES pharmacy_purchase_orders(po_id),
    FOREIGN KEY (supplier_id) REFERENCES pharmacy_suppliers(supplier_id)
);

-- GRN Items Table
CREATE TABLE IF NOT EXISTS pharmacy_grn_items (
    grn_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    grn_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    batch_no VARCHAR(100) NOT NULL,
    manufacture_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    qty INTEGER NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (grn_id) REFERENCES pharmacy_grn(grn_id),
    FOREIGN KEY (item_id) REFERENCES pharmacy_items(item_id)
);

-- Stock Ledger Table (Immutable)
CREATE TABLE IF NOT EXISTS pharmacy_stock_movements (
    movement_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    batch_id INTEGER,
    change_qty INTEGER NOT NULL, -- Positive for increase, negative for decrease
    reason VARCHAR(100) NOT NULL, -- purchase, sale, sales_return, manual_adjust, expiry_writeoff
    reference_id INTEGER, -- po_id, grn_id, invoice_id, etc.
    reference_type VARCHAR(50), -- 'purchase_order', 'grn', 'invoice', 'return', 'adjustment'
    balance_qty INTEGER NOT NULL, -- Running balance after this movement
    user_id INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (item_id) REFERENCES pharmacy_items(item_id),
    FOREIGN KEY (batch_id) REFERENCES pharmacy_batches(batch_id)
);

-- Pharmacy Invoices Table
CREATE TABLE IF NOT EXISTS pharmacy_invoices (
    invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    patient_id INTEGER, -- Nullable for walk-in sales
    prescriber_id INTEGER, -- Doctor who prescribed (if prescription-based)
    prescription_id INTEGER, -- Link to e-prescription
    invoice_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- cash, card, online
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, cancelled
    idempotency_key VARCHAR(100) UNIQUE, -- For idempotent operations
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pharmacy Invoice Items Table
CREATE TABLE IF NOT EXISTS pharmacy_invoice_items (
    invoice_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    batch_id INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES pharmacy_invoices(invoice_id),
    FOREIGN KEY (item_id) REFERENCES pharmacy_items(item_id),
    FOREIGN KEY (batch_id) REFERENCES pharmacy_batches(batch_id)
);

-- Sales Returns Table
CREATE TABLE IF NOT EXISTS pharmacy_sales_returns (
    return_id INTEGER PRIMARY KEY AUTOINCREMENT,
    return_number VARCHAR(50) UNIQUE NOT NULL,
    original_invoice_id INTEGER NOT NULL,
    return_date DATE NOT NULL,
    reason TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, processed
    processed_by INTEGER,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (original_invoice_id) REFERENCES pharmacy_invoices(invoice_id)
);

-- Sales Return Items Table
CREATE TABLE IF NOT EXISTS pharmacy_return_items (
    return_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    return_id INTEGER NOT NULL,
    original_invoice_item_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    batch_id INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (return_id) REFERENCES pharmacy_sales_returns(return_id),
    FOREIGN KEY (original_invoice_item_id) REFERENCES pharmacy_invoice_items(invoice_item_id),
    FOREIGN KEY (item_id) REFERENCES pharmacy_items(item_id),
    FOREIGN KEY (batch_id) REFERENCES pharmacy_batches(batch_id)
);

-- Stock Adjustments Table
CREATE TABLE IF NOT EXISTS pharmacy_stock_adjustments (
    adjustment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    adjustment_number VARCHAR(50) UNIQUE NOT NULL,
    item_id INTEGER NOT NULL,
    batch_id INTEGER,
    adjustment_type VARCHAR(50) NOT NULL, -- increase, decrease
    qty INTEGER NOT NULL,
    reason TEXT NOT NULL,
    cost_price DECIMAL(10,2),
    requires_approval BOOLEAN DEFAULT FALSE,
    approved_by INTEGER,
    approved_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES pharmacy_items(item_id),
    FOREIGN KEY (batch_id) REFERENCES pharmacy_batches(batch_id)
);

-- User Roles Table
CREATE TABLE IF NOT EXISTS pharmacy_user_roles (
    role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions TEXT, -- JSON string of permissions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Role Assignments Table
CREATE TABLE IF NOT EXISTS pharmacy_user_role_assignments (
    assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER NOT NULL,
    FOREIGN KEY (role_id) REFERENCES pharmacy_user_roles(role_id)
);

-- Insert default roles
INSERT OR IGNORE INTO pharmacy_user_roles (role_name, description, permissions) VALUES
('admin', 'Full system access', '["*"]'),
('pharmacist', 'Can manage inventory, process prescriptions, create invoices', '["inventory:read","inventory:write","prescriptions:process","invoices:create","invoices:read"]'),
('cashier', 'Can process sales and returns', '["sales:process","returns:process","invoices:read"]'),
('storekeeper', 'Can manage stock, GRN, adjustments', '["inventory:read","inventory:write","grn:process","adjustments:create"]'),
('accountant', 'Can view reports and financial data', '["reports:read","financial:read"]'),
('auditor', 'Read-only access to all data', '["*:read"]');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pharmacy_items_sku ON pharmacy_items(sku);
CREATE INDEX IF NOT EXISTS idx_pharmacy_items_barcode ON pharmacy_items(barcode);
CREATE INDEX IF NOT EXISTS idx_pharmacy_batches_item_id ON pharmacy_batches(item_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_batches_expiry ON pharmacy_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_pharmacy_stock_movements_item_id ON pharmacy_stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_stock_movements_timestamp ON pharmacy_stock_movements(timestamp);
CREATE INDEX IF NOT EXISTS idx_pharmacy_invoices_patient_id ON pharmacy_invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_invoices_prescription_id ON pharmacy_invoices(prescription_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_invoices_idempotency ON pharmacy_invoices(idempotency_key);
