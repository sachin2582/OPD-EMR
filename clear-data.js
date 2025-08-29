// Clear Data Script for OPD-EMR System
// Run this in the browser console to clear all localStorage data

console.log('🧹 Clearing OPD-EMR localStorage data...');

// Clear all localStorage items
localStorage.clear();

// Clear specific items if they exist
const itemsToClear = [
  'bills',
  'prescriptions', 
  'patients',
  'doctors',
  'appointments',
  'medical_records'
];

itemsToClear.forEach(item => {
  if (localStorage.getItem(item)) {
    localStorage.removeItem(item);
    console.log(`✅ Cleared: ${item}`);
  }
});

console.log('🎯 All localStorage data cleared successfully!');
console.log('📝 You can now add fresh data through the system forms.');
