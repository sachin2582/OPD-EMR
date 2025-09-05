const xlsx = require('xlsx');

try {
  console.log('📊 Reading Excel file...');
  const workbook = xlsx.readFile('Inhouse Tests.xlsx');
  console.log('📋 Sheet names:', workbook.SheetNames);
  
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  console.log('📄 Converting to JSON...');
  const data = xlsx.utils.sheet_to_json(worksheet);
  
  console.log('📊 Total rows:', data.length);
  console.log('📋 First few rows:');
  console.log(JSON.stringify(data.slice(0, 3), null, 2));
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
