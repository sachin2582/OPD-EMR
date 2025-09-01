// Local Database using localStorage - Works completely offline
class LocalDatabase {
  constructor() {
    this.initializeDatabase();
  }

  initializeDatabase() {
    // Initialize default data if not exists
    if (!localStorage.getItem('opd_emr_patients')) {
      localStorage.setItem('opd_emr_patients', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('opd_emr_pharmacy_items')) {
      localStorage.setItem('opd_emr_pharmacy_items', JSON.stringify([
        {
          item_id: 1,
          sku: 'MED001',
          name: 'Paracetamol 500mg',
          generic_name: 'Acetaminophen',
          brand: 'Generic',
          unit: 'Tablet',
          item_type: 'Medicine',
          hsn_sac: '30049099',
          mrp: 5.00,
          purchase_price: 4.00,
          selling_price: 4.50,
          current_stock: 100,
          min_stock: 20,
          reorder_level: 30,
          tax_rate: 5.00,
          is_prescription_required: false,
          barcode: '1234567890123',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          item_id: 2,
          sku: 'MED002',
          name: 'Amoxicillin 500mg',
          generic_name: 'Amoxicillin',
          brand: 'Generic',
          unit: 'Capsule',
          item_type: 'Medicine',
          hsn_sac: '30041010',
          mrp: 8.00,
          purchase_price: 6.00,
          selling_price: 7.00,
          current_stock: 50,
          min_stock: 15,
          reorder_level: 25,
          tax_rate: 5.00,
          is_prescription_required: true,
          barcode: '1234567890124',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]));
    }
    
    if (!localStorage.getItem('opd_emr_suppliers')) {
      localStorage.setItem('opd_emr_suppliers', JSON.stringify([
        {
          supplier_id: 1,
          name: 'ABC Pharmaceuticals',
          contact_person: 'John Smith',
          email: 'john@abcpharma.com',
          phone: '1234567890',
          address: '123 Pharma Street, Medical City',
          gst_number: 'GST123456789',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ]));
    }
  }

  // Patient Management
  getPatients() {
    return JSON.parse(localStorage.getItem('opd_emr_patients') || '[]');
  }

  addPatient(patient) {
    const patients = this.getPatients();
    const newPatient = {
      ...patient,
      id: Date.now(),
      patientId: 'P' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    patients.push(newPatient);
    localStorage.setItem('opd_emr_patients', JSON.stringify(patients));
    return newPatient;
  }

  updatePatient(id, updates) {
    const patients = this.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index !== -1) {
      patients[index] = { ...patients[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('opd_emr_patients', JSON.stringify(patients));
      return patients[index];
    }
    return null;
  }

  deletePatient(id) {
    const patients = this.getPatients();
    const filtered = patients.filter(p => p.id !== id);
    localStorage.setItem('opd_emr_patients', JSON.stringify(filtered));
    return true;
  }

  // Pharmacy Item Management
  getPharmacyItems() {
    return JSON.parse(localStorage.getItem('opd_emr_pharmacy_items') || '[]');
  }

  addPharmacyItem(item) {
    const items = this.getPharmacyItems();
    const newItem = {
      ...item,
      item_id: Date.now(),
      sku: item.sku || 'SKU' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      current_stock: item.current_stock || 0
    };
    items.push(newItem);
    localStorage.setItem('opd_emr_pharmacy_items', JSON.stringify(items));
    return newItem;
  }

  updatePharmacyItem(id, updates) {
    const items = this.getPharmacyItems();
    const index = items.findIndex(item => item.item_id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem('opd_emr_pharmacy_items', JSON.stringify(items));
      return items[index];
    }
    return null;
  }

  deletePharmacyItem(id) {
    const items = this.getPharmacyItems();
    const filtered = items.filter(item => item.item_id !== id);
    localStorage.setItem('opd_emr_pharmacy_items', JSON.stringify(filtered));
    return true;
  }

  // Supplier Management
  getSuppliers() {
    return JSON.parse(localStorage.getItem('opd_emr_suppliers') || '[]');
  }

  addSupplier(supplier) {
    const suppliers = this.getSuppliers();
    const newSupplier = {
      ...supplier,
      supplier_id: Date.now(),
      created_at: new Date().toISOString()
    };
    suppliers.push(newSupplier);
    localStorage.setItem('opd_emr_suppliers', JSON.stringify(suppliers));
    return newSupplier;
  }

  updateSupplier(id, updates) {
    const suppliers = this.getSuppliers();
    const index = suppliers.findIndex(s => s.supplier_id === id);
    if (index !== -1) {
      suppliers[index] = { ...suppliers[index], ...updates };
      localStorage.setItem('opd_emr_suppliers', JSON.stringify(suppliers));
      return suppliers[index];
    }
    return null;
  }

  deleteSupplier(id) {
    const suppliers = this.getSuppliers();
    const filtered = suppliers.filter(s => s.supplier_id !== id);
    localStorage.setItem('opd_emr_suppliers', JSON.stringify(filtered));
    return true;
  }

  // Stock Management
  adjustStock(itemId, quantity, type = 'add', reason = 'Manual adjustment') {
    const items = this.getPharmacyItems();
    const index = items.findIndex(item => item.item_id === itemId);
    
    if (index !== -1) {
      const currentStock = items[index].current_stock || 0;
      let newStock;
      
      if (type === 'add') {
        newStock = currentStock + quantity;
      } else if (type === 'subtract') {
        newStock = Math.max(0, currentStock - quantity);
      } else if (type === 'set') {
        newStock = quantity;
      }
      
      items[index].current_stock = newStock;
      items[index].updated_at = new Date().toISOString();
      
      localStorage.setItem('opd_emr_pharmacy_items', JSON.stringify(items));
      
      // Log stock movement
      this.logStockMovement(itemId, quantity, type, reason, newStock);
      
      return items[index];
    }
    return null;
  }

  logStockMovement(itemId, quantity, type, reason, newStock) {
    const movements = JSON.parse(localStorage.getItem('opd_emr_stock_movements') || '[]');
    movements.push({
      id: Date.now(),
      item_id: itemId,
      quantity,
      type,
      reason,
      new_stock: newStock,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('opd_emr_stock_movements', JSON.stringify(movements));
  }

  // Search and Filter
  searchItems(query) {
    const items = this.getPharmacyItems();
    const lowerQuery = query.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.sku.toLowerCase().includes(lowerQuery) ||
      item.generic_name?.toLowerCase().includes(lowerQuery)
    );
  }

  // Export data
  exportData() {
    return {
      patients: this.getPatients(),
      pharmacy_items: this.getPharmacyItems(),
      suppliers: this.getSuppliers(),
      export_date: new Date().toISOString()
    };
  }

  // Import data
  importData(data) {
    if (data.patients) {
      localStorage.setItem('opd_emr_patients', JSON.stringify(data.patients));
    }
    if (data.pharmacy_items) {
      localStorage.setItem('opd_emr_pharmacy_items', JSON.stringify(data.pharmacy_items));
    }
    if (data.suppliers) {
      localStorage.setItem('opd_emr_suppliers', JSON.stringify(data.suppliers));
    }
    return true;
  }
}

// Create and export singleton instance
const localDB = new LocalDatabase();
export default localDB;
