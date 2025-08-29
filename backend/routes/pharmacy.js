const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Database path
const dbPath = path.join(__dirname, '..', 'opd-emr.db');

// Helper function to get database connection
function getDb() {
    return new sqlite3.Database(dbPath);
}

// Helper function to generate unique numbers
function generateUniqueNumber(prefix, table, column) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.get(`SELECT MAX(CAST(SUBSTR(${column}, ${prefix.length + 1}) AS INTEGER)) as max_num FROM ${table}`, (err, row) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                const nextNum = (row.max_num || 0) + 1;
                resolve(`${prefix}${nextNum.toString().padStart(6, '0')}`);
            }
        });
    });
}

// ==================== ITEMS MANAGEMENT ====================

// Get all items with optional filters
router.get('/items', (req, res) => {
    const { search, type, prescription_required, low_stock } = req.query;
    const db = getDb();
    
    let query = `
        SELECT i.*, 
               COALESCE(SUM(b.qty), 0) as current_stock,
               COUNT(DISTINCT b.batch_id) as batch_count
        FROM pharmacy_items i
        LEFT JOIN pharmacy_batches b ON i.item_id = b.item_id AND b.is_active = 1
        WHERE i.is_active = 1
    `;
    
    const params = [];
    
    if (search) {
        query += ` AND (i.name LIKE ? OR i.sku LIKE ? OR i.generic_name LIKE ? OR i.barcode LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (type) {
        query += ` AND i.item_type = ?`;
        params.push(type);
    }
    
    if (prescription_required !== undefined) {
        query += ` AND i.is_prescription_required = ?`;
        params.push(prescription_required === 'true');
    }
    
    query += ` GROUP BY i.item_id ORDER BY i.name`;
    
    db.all(query, params, (err, rows) => {
        db.close();
        if (err) {
            console.error('Error fetching items:', err);
            res.status(500).json({ error: 'Failed to fetch items' });
        } else {
            // Filter for low stock if requested
            let filteredRows = rows;
            if (low_stock === 'true') {
                filteredRows = rows.filter(item => item.current_stock <= item.reorder_level);
            }
            res.json(filteredRows);
        }
    });
});

// Get item by ID
router.get('/items/:id', (req, res) => {
    const { id } = req.params;
    const db = getDb();
    
    const query = `
        SELECT i.*, 
               COALESCE(SUM(b.qty), 0) as current_stock,
               COUNT(DISTINCT b.batch_id) as batch_count
        FROM pharmacy_items i
        LEFT JOIN pharmacy_batches b ON i.item_id = b.item_id AND b.is_active = 1
        WHERE i.item_id = ? AND i.is_active = 1
        GROUP BY i.item_id
    `;
    
    db.get(query, [id], (err, row) => {
        db.close();
        if (err) {
            console.error('Error fetching item:', err);
            res.status(500).json({ error: 'Failed to fetch item' });
        } else if (!row) {
            res.status(404).json({ error: 'Item not found' });
        } else {
            res.json(row);
        }
    });
});

// Create new item
router.post('/items', (req, res) => {
    const {
        sku, name, generic_name, brand, unit, item_type, hsn_sac,
        mrp, purchase_price, selling_price, min_stock, reorder_level,
        tax_rate, is_prescription_required, barcode
    } = req.body;
    
    const db = getDb();
    
    const query = `
        INSERT INTO pharmacy_items 
        (sku, name, generic_name, brand, unit, item_type, hsn_sac, mrp, purchase_price, 
         selling_price, min_stock, reorder_level, tax_rate, is_prescription_required, barcode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [sku, name, generic_name, brand, unit, item_type, hsn_sac, mrp, 
                   purchase_price, selling_price, min_stock, reorder_level, tax_rate, 
                   is_prescription_required, barcode];
    
    db.run(query, params, function(err) {
        db.close();
        if (err) {
            console.error('Error creating item:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ error: 'SKU or barcode already exists' });
            } else {
                res.status(500).json({ error: 'Failed to create item' });
            }
        } else {
            res.status(201).json({ 
                message: 'Item created successfully', 
                item_id: this.lastID 
            });
        }
    });
});

// Update item
router.put('/items/:id', (req, res) => {
    const { id } = req.params;
    const updateFields = req.body;
    
    const db = getDb();
    
    // Build dynamic update query
    const fields = Object.keys(updateFields).filter(key => 
        key !== 'item_id' && key !== 'created_at'
    );
    
    if (fields.length === 0) {
        db.close();
        return res.status(400).json({ error: 'No fields to update' });
    }
    
    const query = `
        UPDATE pharmacy_items 
        SET ${fields.map(field => `${field} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE item_id = ?
    `;
    
    const params = [...fields.map(field => updateFields[field]), id];
    
    db.run(query, params, function(err) {
        db.close();
        if (err) {
            console.error('Error updating item:', err);
            res.status(500).json({ error: 'Failed to update item' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Item not found' });
        } else {
            res.json({ message: 'Item updated successfully' });
        }
    });
});

// Delete item (soft delete)
router.delete('/items/:id', (req, res) => {
    const { id } = req.params;
    const db = getDb();
    
    db.run('UPDATE pharmacy_items SET is_active = 0 WHERE item_id = ?', [id], function(err) {
        db.close();
        if (err) {
            console.error('Error deleting item:', err);
            res.status(500).json({ error: 'Failed to delete item' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Item not found' });
        } else {
            res.json({ message: 'Item deleted successfully' });
        }
    });
});

// ==================== BATCH MANAGEMENT ====================

// Get batches for an item
router.get('/items/:id/batches', (req, res) => {
    const { id } = req.params;
    const db = getDb();
    
    const query = `
        SELECT b.*, s.name as supplier_name
        FROM pharmacy_batches b
        LEFT JOIN pharmacy_suppliers s ON b.supplier_id = s.supplier_id
        WHERE b.item_id = ? AND b.is_active = 1
        ORDER BY b.expiry_date ASC
    `;
    
    db.all(query, [id], (err, rows) => {
        db.close();
        if (err) {
            console.error('Error fetching batches:', err);
            res.status(500).json({ error: 'Failed to fetch batches' });
        } else {
            res.json(rows);
        }
    });
});

// Create new batch
router.post('/batches', (req, res) => {
    const {
        item_id, batch_no, manufacture_date, expiry_date, qty,
        cost_price, selling_price, supplier_id, purchase_order_id, grn_id
    } = req.body;
    
    const db = getDb();
    
    const query = `
        INSERT INTO pharmacy_batches 
        (item_id, batch_no, manufacture_date, expiry_date, qty, cost_price, 
         selling_price, supplier_id, purchase_order_id, grn_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [item_id, batch_no, manufacture_date, expiry_date, qty,
                   cost_price, selling_price, supplier_id, purchase_order_id, grn_id];
    
    db.run(query, params, function(err) {
        if (err) {
            db.close();
            console.error('Error creating batch:', err);
            res.status(500).json({ error: 'Failed to create batch' });
        } else {
            // Create stock movement for this batch
            const movementQuery = `
                INSERT INTO pharmacy_stock_movements 
                (item_id, batch_id, change_qty, reason, reference_id, reference_type, balance_qty, user_id, notes)
                VALUES (?, ?, ?, 'purchase', ?, 'grn', ?, 1, ?)
            `;
            
            // Get current balance
            db.get('SELECT COALESCE(SUM(change_qty), 0) as balance FROM pharmacy_stock_movements WHERE item_id = ?', [item_id], (err, row) => {
                const currentBalance = row ? row.balance : 0;
                const newBalance = currentBalance + qty;
                
                db.run(movementQuery, [item_id, this.lastID, qty, grn_id, newBalance, 'Batch creation'], function(err) {
                    db.close();
                    if (err) {
                        console.error('Error creating stock movement:', err);
                        res.status(500).json({ error: 'Batch created but stock movement failed' });
                    } else {
                        res.status(201).json({ 
                            message: 'Batch created successfully', 
                            batch_id: this.lastID 
                        });
                    }
                });
            });
        }
    });
});

// ==================== SUPPLIERS ====================

// Get all suppliers
router.get('/suppliers', (req, res) => {
    const db = getDb();
    
    db.all('SELECT * FROM pharmacy_suppliers WHERE is_active = 1 ORDER BY name', (err, rows) => {
        db.close();
        if (err) {
            console.error('Error fetching suppliers:', err);
            res.status(500).json({ error: 'Failed to fetch suppliers' });
        } else {
            res.json(rows);
        }
    });
});

// Create supplier
router.post('/suppliers', (req, res) => {
    const { name, contact_person, email, phone, address, gst_number } = req.body;
    const db = getDb();
    
    const query = `
        INSERT INTO pharmacy_suppliers (name, contact_person, email, phone, address, gst_number)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [name, contact_person, email, phone, address, gst_number], function(err) {
        db.close();
        if (err) {
            console.error('Error creating supplier:', err);
            res.status(500).json({ error: 'Failed to create supplier' });
        } else {
            res.status(201).json({ 
                message: 'Supplier created successfully', 
                supplier_id: this.lastID 
            });
        }
    });
});

// ==================== STOCK MOVEMENTS ====================

// Get stock movements for an item
router.get('/items/:id/stock-movements', (req, res) => {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const db = getDb();
    
    const query = `
        SELECT sm.*, b.batch_no, u.name as user_name
        FROM pharmacy_stock_movements sm
        LEFT JOIN pharmacy_batches b ON sm.batch_id = b.batch_id
        LEFT JOIN users u ON sm.user_id = u.id
        WHERE sm.item_id = ?
        ORDER BY sm.timestamp DESC
        LIMIT ? OFFSET ?
    `;
    
    db.all(query, [id, parseInt(limit), parseInt(offset)], (err, rows) => {
        db.close();
        if (err) {
            console.error('Error fetching stock movements:', err);
            res.status(500).json({ error: 'Failed to fetch stock movements' });
        } else {
            res.json(rows);
        }
    });
});

// ==================== PRESCRIPTION INTEGRATION ====================

// Get items for prescription (check stock availability)
router.get('/prescription/items', (req, res) => {
    const { prescription_id } = req.query;
    const db = getDb();
    
    // This endpoint will be used to check stock availability for prescribed medications
    // and suggest alternatives if needed
    
    const query = `
        SELECT i.*, 
               COALESCE(SUM(b.qty), 0) as current_stock,
               MIN(b.expiry_date) as earliest_expiry
        FROM pharmacy_items i
        LEFT JOIN pharmacy_batches b ON i.item_id = b.item_id AND b.is_active = 1
        WHERE i.is_active = 1
        GROUP BY i.item_id
        HAVING current_stock > 0
        ORDER BY i.name
    `;
    
    db.all(query, (err, rows) => {
        db.close();
        if (err) {
            console.error('Error fetching prescription items:', err);
            res.status(500).json({ error: 'Failed to fetch items' });
        } else {
            res.json(rows);
        }
    });
});

// Create pharmacy order from prescription
router.post('/prescription/orders', (req, res) => {
    const { prescription_id, patient_id, items, prescriber_id } = req.body;
    const db = getDb();
    
    // Generate unique invoice number
    generateUniqueNumber('INV', 'pharmacy_invoices', 'invoice_no')
        .then(invoiceNo => {
            const idempotencyKey = uuidv4();
            
            // Start transaction
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                
                // Create invoice
                const invoiceQuery = `
                    INSERT INTO pharmacy_invoices 
                    (invoice_no, patient_id, prescriber_id, prescription_id, invoice_date, 
                     payment_method, subtotal, tax_amount, total_amount, idempotency_key, created_by)
                    VALUES (?, ?, ?, ?, DATE('now'), 'pending', ?, ?, ?, ?, ?)
                `;
                
                const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.qty), 0);
                const taxAmount = items.reduce((sum, item) => sum + (item.unit_price * item.qty * item.tax_rate / 100), 0);
                const totalAmount = subtotal + taxAmount;
                
                db.run(invoiceQuery, [invoiceNo, patient_id, prescriber_id, prescription_id, 
                                    subtotal, taxAmount, totalAmount, idempotencyKey, 1], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        db.close();
                        console.error('Error creating invoice:', err);
                        res.status(500).json({ error: 'Failed to create pharmacy order' });
                    } else {
                        const invoiceId = this.lastID;
                        
                        // Create invoice items and update stock
                        let itemsProcessed = 0;
                        let hasError = false;
                        
                        items.forEach((item, index) => {
                            // Find available batch (FEFO - First Expiring First Out)
                            const batchQuery = `
                                SELECT b.* FROM pharmacy_batches b
                                WHERE b.item_id = ? AND b.qty >= ? AND b.is_active = 1
                                ORDER BY b.expiry_date ASC
                                LIMIT 1
                            `;
                            
                            db.get(batchQuery, [item.item_id, item.qty], (err, batch) => {
                                if (err || !batch) {
                                    hasError = true;
                                    db.run('ROLLBACK');
                                    db.close();
                                    res.status(400).json({ error: `Insufficient stock for item ${item.name}` });
                                    return;
                                }
                                
                                // Create invoice item
                                const invoiceItemQuery = `
                                    INSERT INTO pharmacy_invoice_items 
                                    (invoice_id, item_id, batch_id, qty, unit_price, tax_rate, total_amount)
                                    VALUES (?, ?, ?, ?, ?, ?, ?)
                                `;
                                
                                const itemTotal = item.unit_price * item.qty;
                                
                                db.run(invoiceItemQuery, [invoiceId, item.item_id, batch.batch_id, 
                                                       item.qty, item.unit_price, item.tax_rate, itemTotal], function(err) {
                                    if (err) {
                                        hasError = true;
                                        db.run('ROLLBACK');
                                        db.close();
                                        res.status(500).json({ error: 'Failed to create invoice item' });
                                        return;
                                    }
                                    
                                    // Update batch quantity
                                    db.run('UPDATE pharmacy_batches SET qty = qty - ? WHERE batch_id = ?', 
                                           [item.qty, batch.batch_id], function(err) {
                                        if (err) {
                                            hasError = true;
                                            db.run('ROLLBACK');
                                            db.close();
                                            res.status(500).json({ error: 'Failed to update batch quantity' });
                                            return;
                                        }
                                        
                                        // Create stock movement
                                        const movementQuery = `
                                            INSERT INTO pharmacy_stock_movements 
                                            (item_id, batch_id, change_qty, reason, reference_id, reference_type, balance_qty, user_id, notes)
                                            VALUES (?, ?, ?, 'sale', ?, 'invoice', ?, 1, ?)
                                        `;
                                        
                                        // Get current balance
                                        db.get('SELECT COALESCE(SUM(change_qty), 0) as balance FROM pharmacy_stock_movements WHERE item_id = ?', 
                                               [item.item_id], (err, row) => {
                                            const currentBalance = row ? row.balance : 0;
                                            const newBalance = currentBalance - item.qty;
                                            
                                            db.run(movementQuery, [item.item_id, batch.batch_id, -item.qty, 
                                                                  invoiceId, newBalance, 'Prescription fulfillment'], function(err) {
                                                if (err) {
                                                    hasError = true;
                                                    db.run('ROLLBACK');
                                                    db.close();
                                                    res.status(500).json({ error: 'Failed to create stock movement' });
                                                    return;
                                                }
                                                
                                                itemsProcessed++;
                                                if (itemsProcessed === items.length && !hasError) {
                                                    db.run('COMMIT');
                                                    db.close();
                                                    res.status(201).json({ 
                                                        message: 'Pharmacy order created successfully',
                                                        invoice_id: invoiceId,
                                                        invoice_no: invoiceNo
                                                    });
                                                }
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    }
                });
            });
        })
        .catch(err => {
            console.error('Error generating invoice number:', err);
            res.status(500).json({ error: 'Failed to generate invoice number' });
        });
});

// ==================== DASHBOARD & REPORTS ====================

// Get pharmacy dashboard data
router.get('/dashboard', (req, res) => {
    const db = getDb();
    
    const queries = {
        totalItems: 'SELECT COUNT(*) as count FROM pharmacy_items WHERE is_active = 1',
        lowStockItems: `
            SELECT COUNT(*) as count FROM pharmacy_items i
            LEFT JOIN pharmacy_batches b ON i.item_id = b.item_id AND b.is_active = 1
            WHERE i.is_active = 1
            GROUP BY i.item_id
            HAVING COALESCE(SUM(b.qty), 0) <= i.reorder_level
        `,
        expiringItems: `
            SELECT COUNT(*) as count FROM pharmacy_batches 
            WHERE expiry_date <= DATE('now', '+30 days') AND is_active = 1
        `,
        totalValue: `
            SELECT COALESCE(SUM(b.qty * b.cost_price), 0) as value FROM pharmacy_batches b
            WHERE b.is_active = 1
        `
    };
    
    const results = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.get(queries[key], (err, row) => {
            if (err) {
                console.error(`Error in ${key} query:`, err);
                results[key] = 0;
            } else {
                results[key] = row.count || row.value || 0;
            }
            
            completed++;
            if (completed === Object.keys(queries).length) {
                db.close();
                res.json(results);
            }
        });
    });
});

// Get low stock report
router.get('/reports/low-stock', (req, res) => {
    const db = getDb();
    
    const query = `
        SELECT i.*, 
               COALESCE(SUM(b.qty), 0) as current_stock,
               i.reorder_level,
               (i.reorder_level - COALESCE(SUM(b.qty), 0)) as reorder_qty
        FROM pharmacy_items i
        LEFT JOIN pharmacy_batches b ON i.item_id = b.item_id AND b.is_active = 1
        WHERE i.is_active = 1
        GROUP BY i.item_id
        HAVING current_stock <= i.reorder_level
        ORDER BY (i.reorder_level - current_stock) DESC
    `;
    
    db.all(query, (err, rows) => {
        db.close();
        if (err) {
            console.error('Error fetching low stock report:', err);
            res.status(500).json({ error: 'Failed to fetch low stock report' });
        } else {
            res.json(rows);
        }
    });
});

// Get expiry report
router.get('/reports/expiry', (req, res) => {
    const { days = 30 } = req.query;
    const db = getDb();
    
    const query = `
        SELECT b.*, i.name as item_name, i.sku, s.name as supplier_name
        FROM pharmacy_batches b
        JOIN pharmacy_items i ON b.item_id = i.item_id
        LEFT JOIN pharmacy_suppliers s ON b.supplier_id = s.supplier_id
        WHERE b.expiry_date <= DATE('now', '+? days') AND b.is_active = 1 AND b.qty > 0
        ORDER BY b.expiry_date ASC
    `;
    
    db.all(query, [parseInt(days)], (err, rows) => {
        db.close();
        if (err) {
            console.error('Error fetching expiry report:', err);
            res.status(500).json({ error: 'Failed to fetch expiry report' });
        } else {
            res.json(rows);
        }
    });
});

module.exports = router;
