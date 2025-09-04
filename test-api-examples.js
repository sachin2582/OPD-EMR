const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/doctors';

async function demonstrateAPIUsage() {
  console.log('🚀 [DEMO] Doctors API Usage Examples\n');
  
  try {
    // Example 1: Create a new doctor
    console.log('📝 Example 1: Creating a new doctor...');
    const timestamp = Date.now();
    const newDoctor = {
      name: "Dr. Emily Watson",
      specialization: "Pediatrics",
      contactNumber: `9876543${timestamp.toString().slice(-3)}`,
      email: `emily.watson.${timestamp}@hospital.com`,
      qualification: "MBBS, MD Pediatrics",
      experienceYears: 8,
      availability: "Mon-Fri 9AM-5PM, Sat 9AM-1PM"
    };
    
    const createResponse = await axios.post(API_BASE, newDoctor);
    console.log('✅ Doctor created successfully!');
    console.log(`   Name: ${createResponse.data.doctor.name}`);
    console.log(`   ID: ${createResponse.data.doctor.id}`);
    console.log(`   Doctor ID: ${createResponse.data.doctor.doctorId}\n`);
    
    const doctorId = createResponse.data.doctor.id;
    
    // Example 2: Get all doctors
    console.log('📋 Example 2: Getting all doctors...');
    const allDoctorsResponse = await axios.get(API_BASE);
    console.log('✅ Retrieved all doctors!');
    console.log(`   Total doctors: ${allDoctorsResponse.data.pagination.total}`);
    console.log(`   Current page: ${allDoctorsResponse.data.pagination.currentPage}\n`);
    
    // Example 3: Search doctors
    console.log('🔍 Example 3: Searching doctors by name...');
    const searchResponse = await axios.get(`${API_BASE}?search=Emily`);
    console.log('✅ Search completed!');
    console.log(`   Found ${searchResponse.data.doctors.length} doctors matching "Emily"\n`);
    
    // Example 4: Get doctor by ID
    console.log('👤 Example 4: Getting doctor by ID...');
    const doctorResponse = await axios.get(`${API_BASE}/${doctorId}`);
    console.log('✅ Doctor details retrieved!');
    console.log(`   Name: ${doctorResponse.data.name}`);
    console.log(`   Specialization: ${doctorResponse.data.specialization}`);
    console.log(`   Experience: ${doctorResponse.data.experienceYears} years\n`);
    
    // Example 5: Update doctor
    console.log('✏️ Example 5: Updating doctor information...');
    const updateData = {
      experienceYears: 9,
      availability: "Mon-Fri 8AM-6PM, Sat 9AM-2PM"
    };
    
    const updateResponse = await axios.put(`${API_BASE}/${doctorId}`, updateData);
    console.log('✅ Doctor updated successfully!');
    console.log(`   New experience: ${updateResponse.data.doctor.experienceYears} years`);
    console.log(`   New availability: ${updateResponse.data.doctor.availability}\n`);
    
    // Example 6: Get specializations
    console.log('🏥 Example 6: Getting specializations list...');
    const specializationsResponse = await axios.get(`${API_BASE}/specializations/list`);
    console.log('✅ Specializations retrieved!');
    specializationsResponse.data.specializations.forEach(spec => {
      console.log(`   - ${spec.name}: ${spec.count} doctors`);
    });
    console.log();
    
    // Example 7: Get statistics
    console.log('📊 Example 7: Getting statistics overview...');
    const statsResponse = await axios.get(`${API_BASE}/stats/overview`);
    console.log('✅ Statistics retrieved!');
    console.log(`   Total doctors: ${statsResponse.data.total}`);
    console.log(`   Active doctors: ${statsResponse.data.active}`);
    console.log(`   Total specializations: ${statsResponse.data.totalSpecializations}\n`);
    
    // Example 8: Filter by specialization
    console.log('🔍 Example 8: Filtering doctors by specialization...');
    const filterResponse = await axios.get(`${API_BASE}?specialization=Pediatrics`);
    console.log('✅ Filter applied!');
    console.log(`   Found ${filterResponse.data.doctors.length} doctors in Pediatrics\n`);
    
    // Example 9: Test validation (this should fail)
    console.log('❌ Example 9: Testing validation (should fail)...');
    try {
      const invalidDoctor = {
        name: "Dr. Invalid",
        // Missing required fields
        contactNumber: "123" // Invalid phone number
      };
      
      await axios.post(API_BASE, invalidDoctor);
      console.log('❌ This should not have succeeded!');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validation correctly rejected invalid data!');
        console.log(`   Error: ${error.response.data.error}\n`);
      } else {
        console.log('❌ Unexpected error occurred');
        console.log(`   Error: ${error.message}\n`);
      }
    }
    
    // Example 10: Clean up - delete the test doctor
    console.log('🗑️ Example 10: Cleaning up - deleting test doctor...');
    const deleteResponse = await axios.delete(`${API_BASE}/${doctorId}`);
    console.log('✅ Doctor deleted successfully!');
    console.log(`   Deleted: ${deleteResponse.data.doctor.name}\n`);
    
    console.log('🎉 All API usage examples completed successfully!');
    console.log('\n📚 Check DOCTORS_API_USAGE_GUIDE.md for detailed documentation');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the demonstration
demonstrateAPIUsage();
