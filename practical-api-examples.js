const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/doctors';

// Example 1: Add a new doctor to your hospital
async function addNewDoctor() {
  console.log('🏥 Adding a new doctor to the hospital...\n');
  
  const newDoctor = {
    name: "Dr. Rajesh Kumar",
    specialization: "Orthopedics",
    contactNumber: "9876543212",
    email: "rajesh.kumar@hospital.com",
    qualification: "MBBS, MS Orthopedics",
    experienceYears: 15,
    availability: "Mon-Fri 9AM-6PM, Sat 9AM-1PM"
  };
  
  try {
    const response = await axios.post(API_BASE, newDoctor);
    console.log('✅ Doctor added successfully!');
    console.log(`   Name: ${response.data.doctor.name}`);
    console.log(`   Specialization: ${response.data.doctor.specialization}`);
    console.log(`   Doctor ID: ${response.data.doctor.doctorId}`);
    console.log(`   Experience: ${response.data.doctor.experienceYears} years\n`);
    
    return response.data.doctor.id;
  } catch (error) {
    console.error('❌ Error adding doctor:', error.response?.data?.error || error.message);
    return null;
  }
}

// Example 2: Search for doctors by specialization
async function searchDoctorsBySpecialization(specialization) {
  console.log(`🔍 Searching for ${specialization} doctors...\n`);
  
  try {
    const response = await axios.get(`${API_BASE}?specialization=${specialization}`);
    console.log(`✅ Found ${response.data.doctors.length} ${specialization} doctors:`);
    
    response.data.doctors.forEach(doctor => {
      console.log(`   - ${doctor.name} (${doctor.experienceYears} years experience)`);
      console.log(`     Phone: ${doctor.phone}`);
      console.log(`     Availability: ${doctor.availability}\n`);
    });
    
    return response.data.doctors;
  } catch (error) {
    console.error('❌ Error searching doctors:', error.response?.data?.error || error.message);
    return [];
  }
}

// Example 3: Get doctor statistics for dashboard
async function getDashboardStats() {
  console.log('📊 Getting dashboard statistics...\n');
  
  try {
    const response = await axios.get(`${API_BASE}/stats/overview`);
    const stats = response.data;
    
    console.log('✅ Hospital Statistics:');
    console.log(`   Total Doctors: ${stats.total}`);
    console.log(`   Active Doctors: ${stats.active}`);
    console.log(`   Inactive Doctors: ${stats.inactive}`);
    console.log(`   Total Specializations: ${stats.totalSpecializations}\n`);
    
    console.log('📋 Specialization Breakdown:');
    stats.specializations.forEach(spec => {
      console.log(`   - ${spec.name}: ${spec.count} doctors`);
    });
    console.log();
    
    return stats;
  } catch (error) {
    console.error('❌ Error getting stats:', error.response?.data?.error || error.message);
    return null;
  }
}

// Example 4: Update doctor's availability
async function updateDoctorAvailability(doctorId, newAvailability) {
  console.log(`✏️ Updating doctor ${doctorId} availability...\n`);
  
  try {
    const response = await axios.put(`${API_BASE}/${doctorId}`, {
      availability: newAvailability
    });
    
    console.log('✅ Doctor availability updated!');
    console.log(`   Name: ${response.data.doctor.name}`);
    console.log(`   New Availability: ${response.data.doctor.availability}\n`);
    
    return response.data.doctor;
  } catch (error) {
    console.error('❌ Error updating doctor:', error.response?.data?.error || error.message);
    return null;
  }
}

// Example 5: Get all specializations for dropdown
async function getSpecializationsForDropdown() {
  console.log('🏥 Getting specializations for dropdown...\n');
  
  try {
    const response = await axios.get(`${API_BASE}/specializations/list`);
    
    console.log('✅ Available Specializations:');
    response.data.specializations.forEach(spec => {
      console.log(`   - ${spec.name} (${spec.count} doctors)`);
    });
    console.log();
    
    return response.data.specializations;
  } catch (error) {
    console.error('❌ Error getting specializations:', error.response?.data?.error || error.message);
    return [];
  }
}

// Example 6: Search doctors by name or qualification
async function searchDoctors(query) {
  console.log(`🔍 Searching doctors for "${query}"...\n`);
  
  try {
    const response = await axios.get(`${API_BASE}?search=${query}`);
    
    console.log(`✅ Found ${response.data.doctors.length} doctors matching "${query}":`);
    response.data.doctors.forEach(doctor => {
      console.log(`   - ${doctor.name}`);
      console.log(`     Specialization: ${doctor.specialization}`);
      console.log(`     Qualification: ${doctor.qualification}`);
      console.log(`     Phone: ${doctor.phone}\n`);
    });
    
    return response.data.doctors;
  } catch (error) {
    console.error('❌ Error searching doctors:', error.response?.data?.error || error.message);
    return [];
  }
}

// Example 7: Get doctor details for appointment booking
async function getDoctorForAppointment(doctorId) {
  console.log(`👤 Getting doctor details for appointment booking...\n`);
  
  try {
    const response = await axios.get(`${API_BASE}/${doctorId}`);
    const doctor = response.data;
    
    console.log('✅ Doctor Details:');
    console.log(`   Name: ${doctor.name}`);
    console.log(`   Specialization: ${doctor.specialization}`);
    console.log(`   Qualification: ${doctor.qualification}`);
    console.log(`   Experience: ${doctor.experienceYears} years`);
    console.log(`   Availability: ${doctor.availability}`);
    console.log(`   Contact: ${doctor.phone}`);
    console.log(`   Email: ${doctor.email}\n`);
    
    return doctor;
  } catch (error) {
    console.error('❌ Error getting doctor details:', error.response?.data?.error || error.message);
    return null;
  }
}

// Example 8: Deactivate a doctor (soft delete)
async function deactivateDoctor(doctorId) {
  console.log(`🗑️ Deactivating doctor ${doctorId}...\n`);
  
  try {
    const response = await axios.delete(`${API_BASE}/${doctorId}`);
    
    console.log('✅ Doctor deactivated successfully!');
    console.log(`   Name: ${response.data.doctor.name}`);
    console.log(`   Status: ${response.data.doctor.isActive ? 'Active' : 'Inactive'}\n`);
    
    return response.data.doctor;
  } catch (error) {
    console.error('❌ Error deactivating doctor:', error.response?.data?.error || error.message);
    return null;
  }
}

// Main function to run all examples
async function runPracticalExamples() {
  console.log('🚀 Practical Doctors API Usage Examples\n');
  console.log('=' .repeat(50));
  
  // 1. Add a new doctor
  const newDoctorId = await addNewDoctor();
  
  // 2. Get dashboard statistics
  await getDashboardStats();
  
  // 3. Get specializations for dropdown
  await getSpecializationsForDropdown();
  
  // 4. Search doctors by specialization
  await searchDoctorsBySpecialization('Orthopedics');
  
  // 5. Search doctors by name
  await searchDoctors('Rajesh');
  
  // 6. Get doctor details for appointment
  if (newDoctorId) {
    await getDoctorForAppointment(newDoctorId);
    
    // 7. Update doctor availability
    await updateDoctorAvailability(newDoctorId, 'Mon-Fri 8AM-7PM, Sat 9AM-2PM');
    
    // 8. Deactivate doctor (cleanup)
    await deactivateDoctor(newDoctorId);
  }
  
  console.log('🎉 All practical examples completed!');
  console.log('\n💡 You can now use these patterns in your application:');
  console.log('   - Add new doctors to your hospital');
  console.log('   - Search and filter doctors');
  console.log('   - Get statistics for dashboards');
  console.log('   - Update doctor information');
  console.log('   - Manage doctor availability');
  console.log('   - Handle appointment booking');
}

// Run the examples
runPracticalExamples();
