const LabTestsService = require('./backend/services/labTestsService');

async function updateLabTestPrices() {
  console.log('🔧 Updating all lab test prices to 200...');
  
  const labTestsService = new LabTestsService();
  
  try {
    // Initialize the service
    await labTestsService.initialize();
    console.log('✅ Lab Tests Service initialized');
    
    // Update all prices to 200
    const result = await labTestsService.updateLabTestPrices(200);
    
    if (result.success) {
      console.log('🎉 Price update completed successfully!');
      console.log(`✅ Updated ${result.updatedCount} lab test prices to 200`);
      console.log(`📊 Total tests in database: ${result.totalTests}`);
      console.log(`📈 Successfully updated: ${result.updatedTests} tests`);
      console.log(`💰 New price: ₹${result.newPrice}`);
    } else {
      console.error('❌ Price update failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during price update:', error.message);
  } finally {
    // Close the service
    await labTestsService.close();
    console.log('🔒 Service closed');
  }
}

// Run the update
updateLabTestPrices();
