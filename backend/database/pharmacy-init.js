const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'opd-emr.db');

// Create database connection
const db = new sqlite3.Database(dbPath);

console.log('🏥 Initializing Pharmacy Module Database...');

// Read and execute the pharmacy schema
const fs = require('fs');
const schemaPath = path.join(__dirname, 'pharmacy-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.serialize(() => {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    
    // Execute schema
    db.exec(schema, (err) => {
        if (err) {
            console.error('❌ Error creating pharmacy schema:', err);
        } else {
            console.log('✅ Pharmacy schema created successfully');
            insertSampleData();
        }
    });
});

function insertSampleData() {
    console.log('📦 Inserting sample data...');
    
    // Sample suppliers
    const suppliers = [
        {
            name: 'ABC Pharmaceuticals Ltd',
            contact_person: 'John Smith',
            email: 'john@abcpharma.com',
            phone: '+91-9876543210',
            address: '123 Pharma Street, Mumbai, Maharashtra',
            gst_number: '27ABCDE1234F1Z5'
        },
        {
            name: 'XYZ Medical Supplies',
            contact_person: 'Sarah Johnson',
            email: 'sarah@xyzmedical.com',
            phone: '+91-9876543211',
            address: '456 Medical Avenue, Delhi, NCR',
            gst_number: '07FGHIJ5678K9L2'
        },
        {
            name: 'MediCare Solutions',
            contact_person: 'Mike Wilson',
            email: 'mike@medicare.com',
            phone: '+91-9876543212',
            address: '789 Healthcare Road, Bangalore, Karnataka',
            gst_number: '29MNOPQ9012R3S6'
        }
    ];

    suppliers.forEach(supplier => {
        db.run(`
            INSERT OR IGNORE INTO pharmacy_suppliers 
            (name, contact_person, email, phone, address, gst_number) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [supplier.name, supplier.contact_person, supplier.email, supplier.phone, supplier.address, supplier.gst_number]);
    });

    // Sample items
    const items = [
        {
            sku: 'MED001',
            name: 'Paracetamol 500mg',
            generic_name: 'Acetaminophen',
            brand: 'Crocin',
            unit: 'Tablet',
            item_type: 'Medicine',
            hsn_sac: '3004',
            mrp: 5.00,
            purchase_price: 3.50,
            selling_price: 4.50,
            min_stock: 100,
            reorder_level: 50,
            tax_rate: 5.00,
            is_prescription_required: false,
            barcode: '8901234567890'
        },
        {
            sku: 'MED002',
            name: 'Amoxicillin 500mg',
            generic_name: 'Amoxicillin',
            brand: 'Novamox',
            unit: 'Capsule',
            item_type: 'Medicine',
            hsn_sac: '3004',
            mrp: 8.00,
            purchase_price: 5.60,
            selling_price: 7.20,
            min_stock: 50,
            reorder_level: 25,
            tax_rate: 5.00,
            is_prescription_required: true,
            barcode: '8901234567891'
        },
        {
            sku: 'MED003',
            name: 'Omeprazole 20mg',
            generic_name: 'Omeprazole',
            brand: 'Omez',
            unit: 'Capsule',
            item_type: 'Medicine',
            hsn_sac: '3004',
            mrp: 12.00,
            purchase_price: 8.40,
            selling_price: 10.80,
            min_stock: 75,
            reorder_level: 40,
            tax_rate: 5.00,
            is_prescription_required: true,
            barcode: '8901234567892'
        },
        {
            sku: 'SUP001',
            name: 'Surgical Mask',
            generic_name: '3-Ply Surgical Mask',
            brand: 'MedSafe',
            unit: 'Piece',
            item_type: 'Medical Supplies',
            hsn_sac: '6307',
            mrp: 15.00,
            purchase_price: 10.50,
            selling_price: 13.50,
            min_stock: 200,
            reorder_level: 100,
            tax_rate: 5.00,
            is_prescription_required: false,
            barcode: '8901234567893'
        },
        {
            sku: 'SUP002',
            name: 'Digital Thermometer',
            generic_name: 'Infrared Thermometer',
            brand: 'TempCheck',
            unit: 'Piece',
            item_type: 'Equipment',
            hsn_sac: '9025',
            mrp: 800.00,
            purchase_price: 560.00,
            selling_price: 720.00,
            min_stock: 10,
            reorder_level: 5,
            tax_rate: 18.00,
            is_prescription_required: false,
            barcode: '8901234567894'
        }
    ];

    items.forEach(item => {
        db.run(`
            INSERT OR IGNORE INTO pharmacy_items 
            (sku, name, generic_name, brand, unit, item_type, hsn_sac, mrp, purchase_price, selling_price, min_stock, reorder_level, tax_rate, is_prescription_required, barcode) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [item.sku, item.name, item.generic_name, item.brand, item.unit, item.item_type, item.hsn_sac, item.mrp, item.purchase_price, item.selling_price, item.min_stock, item.reorder_level, item.tax_rate, item.is_prescription_required, item.barcode]);
    });

    // Sample batches
    const batches = [
        {
            item_sku: 'MED001',
            batch_no: 'BATCH001',
            manufacture_date: '2024-01-15',
            expiry_date: '2026-01-15',
            qty: 500,
            cost_price: 3.50,
            selling_price: 4.50,
            supplier_name: 'ABC Pharmaceuticals Ltd'
        },
        {
            item_sku: 'MED002',
            batch_no: 'BATCH002',
            manufacture_date: '2024-02-01',
            expiry_date: '2025-08-01',
            qty: 200,
            cost_price: 5.60,
            selling_price: 7.20,
            supplier_name: 'ABC Pharmaceuticals Ltd'
        },
        {
            item_sku: 'MED003',
            batch_no: 'BATCH003',
            manufacture_date: '2024-01-20',
            expiry_date: '2026-01-20',
            qty: 150,
            cost_price: 8.40,
            selling_price: 10.80,
            supplier_name: 'XYZ Medical Supplies'
        },
        {
            item_sku: 'SUP001',
            batch_no: 'BATCH004',
            manufacture_date: '2024-03-01',
            expiry_date: '2027-03-01',
            qty: 1000,
            cost_price: 10.50,
            selling_price: 13.50,
            supplier_name: 'MediCare Solutions'
        }
    ];

    // Insert batches with proper foreign key relationships
    batches.forEach(batch => {
        db.get('SELECT item_id FROM pharmacy_items WHERE sku = ?', [batch.item_sku], (err, item) => {
            if (item) {
                db.get('SELECT supplier_id FROM pharmacy_suppliers WHERE name = ?', [batch.supplier_name], (err, supplier) => {
                    if (supplier) {
                        db.run(`
                            INSERT OR IGNORE INTO pharmacy_batches 
                            (item_id, batch_no, manufacture_date, expiry_date, qty, cost_price, selling_price, supplier_id) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `, [item.item_id, batch.batch_no, batch.manufacture_date, batch.expiry_date, batch.qty, batch.cost_price, batch.selling_price, supplier.supplier_id]);
                    }
                });
            }
        });
    });

    console.log('✅ Sample data inserted successfully');
    console.log('🏥 Pharmacy Module Database initialization completed!');
    
    // Close database connection
    db.close();
}
