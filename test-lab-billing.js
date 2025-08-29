import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testLabPrescription = {
  patientId: 1,
  doctorId: 1, // This maps to the database ID, not doctorId field
  prescriptionDate: new Date().toISOString().split('T')[0],
  diagnosis: 'Diabetes screening',
  symptoms: 'Increased thirst, frequent urination',
  notes: 'Routine checkup',
  priority: 'routine',
  tests: [
    {
      testId: 4,
      testName: 'Liver Function Test (LFT)',
      testCode: 'LFT',
      category: 'Biochemistry',
      subcategory: 'Liver',
      price: 150.00,
      instructions: 'Fasting for 8-12 hours required'
    },
    {
      testId: 5,
      testName: 'Kidney Function Test (KFT)',
      testCode: 'KFT',
      category: 'Biochemistry',
      subcategory: 'Kidney',
      price: 300.00,
      instructions: 'No fasting required'
    }
  ]
};

const testBill = {
  prescriptionId: 1,
  patientId: 1,
  billDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  discount: 50.00,
  tax: 0,
  notes: 'Patient discount applied',
  collectedBy: 'Billing Staff'
};

async function testLabBillingAPI() {
  console.log('🧪 Testing Lab Test Billing API...\n');

  try {
    // Test 1: Create Lab Prescription
    console.log('1️⃣ Creating lab prescription...');
    const prescriptionResponse = await fetch(`${BASE_URL}/lab-billing/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testLabPrescription)
    });

    if (prescriptionResponse.ok) {
      const prescriptionData = await prescriptionResponse.json();
      console.log('✅ Lab prescription created successfully');
      console.log('   Prescription ID:', prescriptionData.prescription.prescriptionId);
      console.log('   Tests:', prescriptionData.prescription.prescriptionItems.length);
    } else {
      const error = await prescriptionResponse.json();
      console.log('❌ Failed to create prescription:', error.error);
      return;
    }

    // Test 2: Get Unbilled Prescriptions
    console.log('\n2️⃣ Fetching unbilled prescriptions...');
    const unbilledResponse = await fetch(`${BASE_URL}/lab-billing/prescriptions/unbilled`);
    
    if (unbilledResponse.ok) {
      const unbilledData = await unbilledResponse.json();
      console.log('✅ Unbilled prescriptions fetched');
      console.log('   Count:', unbilledData.prescriptions.length);
    } else {
      console.log('❌ Failed to fetch unbilled prescriptions');
    }

    // Test 3: Create Lab Bill
    console.log('\n3️⃣ Creating lab bill...');
    const billResponse = await fetch(`${BASE_URL}/lab-billing/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testBill)
    });

    if (billResponse.ok) {
      const billData = await billResponse.json();
      console.log('✅ Lab bill created successfully');
      console.log('   Bill ID:', billData.bill.billId);
      console.log('   Total Amount:', billData.bill.total);
    } else {
      const error = await billResponse.json();
      console.log('❌ Failed to create bill:', error.error);
      return;
    }

    // Test 4: Get Lab Bills
    console.log('\n4️⃣ Fetching lab bills...');
    const billsResponse = await fetch(`${BASE_URL}/lab-billing/bills`);
    
    if (billsResponse.ok) {
      const billsData = await billsResponse.json();
      console.log('✅ Lab bills fetched');
      console.log('   Count:', billsData.bills.length);
    } else {
      console.log('❌ Failed to fetch lab bills');
    }

    // Test 5: Update Payment Status
    console.log('\n5️⃣ Updating payment status...');
    const paymentResponse = await fetch(`${BASE_URL}/lab-billing/bills/1/payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        collectedBy: 'Billing Staff',
        notes: 'Payment received in full'
      })
    });

    if (paymentResponse.ok) {
      const paymentData = await paymentResponse.json();
      console.log('✅ Payment status updated successfully');
      console.log('   New Status:', paymentData.bill.paymentStatus);
    } else {
      const error = await paymentResponse.json();
      console.log('❌ Failed to update payment status:', error.error);
    }

    // Test 6: Get Statistics
    console.log('\n6️⃣ Fetching lab billing statistics...');
    const statsResponse = await fetch(`${BASE_URL}/lab-billing/stats`);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Statistics fetched');
      console.log('   Total Prescriptions:', statsData.prescriptions.total);
      console.log('   Unbilled:', statsData.prescriptions.unbilled);
      console.log('   Total Bills:', statsData.bills.total);
      console.log('   Total Revenue:', statsData.bills.totalRevenue);
    } else {
      console.log('❌ Failed to fetch statistics');
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the tests
testLabBillingAPI().catch(console.error);
