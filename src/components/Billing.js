import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../config/api';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Icon,
  Divider,
  SimpleGrid,
  Container,
  Grid,
  Tag,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  IconButton,
  Spinner,
  Textarea,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';
import { 
  FaUser, 
  FaCalculator, 
  FaPrint, 
  FaArrowLeft, 
  FaPlus, 
  FaTrash, 
  FaSave, 
  FaReceipt, 
  FaNotesMedical,
  FaSearch,
  FaTimes
} from 'react-icons/fa';

const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Color mode values (removed unused variables)
  
  const [patientData, setPatientData] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  // Removed tax rate - no GST calculation
  const [notes, setNotes] = useState('');

  // Lab tests from database
  const [labTestsFromDB, setLabTestsFromDB] = useState([]);
  const [labTestsLoading, setLabTestsLoading] = useState(false);
  const [labTestsError, setLabTestsError] = useState(null);
  
  // Search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTests, setFilteredTests] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Clinic data
  const [clinicData, setClinicData] = useState(null);

  // Available services with pricing (non-lab services)
  const availableServices = [
    { id: 1, name: 'Consultation Fee', category: 'Consultation', price: 500, description: 'General consultation with doctor' },
    { id: 2, name: 'Specialist Consultation', category: 'Consultation', price: 1000, description: 'Specialist doctor consultation' },
    { id: 5, name: 'X-Ray', category: 'Radiology', price: 1200, description: 'Chest X-Ray examination' },
    { id: 6, name: 'ECG', category: 'Cardiology', price: 600, description: 'Electrocardiogram test' },
    { id: 7, name: 'Ultrasound', category: 'Radiology', price: 1500, description: 'Abdominal ultrasound' },
    { id: 8, name: 'Dressing', category: 'Treatment', price: 200, description: 'Wound dressing and care' },
    { id: 9, name: 'Injection', category: 'Treatment', price: 150, description: 'Intramuscular injection' },
    { id: 10, name: 'Medicine Supply', category: 'Pharmacy', price: 400, description: 'Prescribed medicines' }
  ];


  // Function to fetch lab tests from database
  const fetchLabTests = async () => {
    try {
      console.log('🔄 Fetching lab tests from API...');
      console.log('🌐 API Base URL:', process.env.REACT_APP_API_BASE_URL);
      
      setLabTestsLoading(true);
      setLabTestsError(null);
      
      const response = await api.get('/api/lab-tests/tests?all=true');
      
      console.log('✅ Lab tests API response received:', response);
      console.log('📊 Response status:', response.status);
      console.log('📊 Response data:', response.data);
      
      if (response.status === 200) {
        const tests = response.data.tests || [];
        console.log('📋 Lab tests loaded:', tests.length, 'tests');
        setLabTestsFromDB(tests);
        setFilteredTests(tests);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(tests.map(test => test.category))].filter(Boolean);
        setCategories(uniqueCategories);
        console.log('📂 Categories found:', uniqueCategories);
      } else {
        console.warn('⚠️ Lab tests API returned unsuccessful response:', response.data);
        setLabTestsError('Failed to load lab tests');
      }
    } catch (error) {
      console.error('❌ Error fetching lab tests:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = "Failed to load lab tests";
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        errorMessage = "Backend server is not running. Please start the backend server.";
      } else if (error.response?.status === 404) {
        errorMessage = "Lab tests not found in database.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error occurred while fetching lab tests.";
      }
      
      setLabTestsError(errorMessage);
    } finally {
      setLabTestsLoading(false);
    }
  };

  // Filter tests based on search term and category
  useEffect(() => {
    let filtered = labTestsFromDB;
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(test => 
        test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.testCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }
    
    setFilteredTests(filtered);
  }, [searchTerm, selectedCategory, labTestsFromDB]);

  // Clear search and filters
  const clearSearchAndFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setFilteredTests(labTestsFromDB);
  };

  // Function to fetch clinic data
  const fetchClinicData = useCallback(async () => {
    console.log('🔄 Fetching clinic data from API...');
    console.log('🌐 API Base URL:', process.env.REACT_APP_API_BASE_URL);
    
    try {
      const response = await api.get('/api/clinic');
      console.log('✅ Clinic API response received:', response);
      console.log('📊 Response status:', response.status);
      console.log('📊 Response data:', response.data);
      
      if (response.status === 200 && response.data.success) {
        console.log('✅ Clinic data successfully loaded:', response.data.data);
        setClinicData(response.data.data);
        toast({
          title: "✅ Clinic Data Loaded",
          description: "Clinic information loaded successfully from database",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        console.warn('⚠️ Clinic API returned unsuccessful response:', response.data);
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Error fetching clinic data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });

      // Determine error type for better user feedback
      let errorMessage = "Using default clinic information.";
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        errorMessage = "Backend server is not running. Please start the backend server.";
      } else if (error.response?.status === 404) {
        errorMessage = "Clinic data not found in database.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error occurred while fetching clinic data.";
      }
      
      // Set fallback clinic data (same as database data)
      const fallbackData = {
        clinicName: 'HIMSHIKHA NURSING HOME',
        address: 'Plot No 1,Near CRPF Camp Himshika,Pinjore',
        city: 'Panchkula',
        state: 'Haryana',
        pincode: '134112',
        phone: '9815368811',
        email: 'info@demr.com',
        website: 'www.demr.com',
        license: 'CLINIC-LICENSE-001',
        registration: 'REG-2024-001'
      };
      setClinicData(fallbackData);
      console.log('🔄 Using fallback clinic data:', fallbackData);
      
      toast({
        title: "⚠️ Clinic Data Error",
        description: errorMessage,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    console.log('🚀 Billing component mounted, initializing...');

    // Always initialize bill metadata
    setBillNumber(`BILL-${Date.now().toString().slice(-6)}`);
    setBillDate(new Date().toISOString().split('T')[0]);

    // If navigated here with a selected patient, prefill
    if (location.state?.patientData) {
      setPatientData(location.state.patientData);
      setPatientId(location.state.patientId?.toString() || '');
    }

    // Fetch lab tests from database
    console.log('🔄 Fetching lab tests...');
    fetchLabTests();
    
    // Fetch clinic data
    console.log('🔄 Fetching clinic data...');
    fetchClinicData();
  }, [location.state, fetchClinicData]);


  const fetchPatientByRegistrationNo = async () => {
    setLookupError('');
    setPatientData(null);

    const trimmed = (patientId || '').toString().trim();
    if (!trimmed) {
      setLookupError('Please enter a registration number.');
      return;
    }

    try {
      const response = await api.get(`/api/patients/${encodeURIComponent(trimmed)}`);
      if (response.status === 200) {
        setPatientData(response.data);
      } else {
        setLookupError('Failed to fetch patient.');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setLookupError('No patient found with this registration number.');
      } else {
      setLookupError('Failed to connect to server. Please ensure backend is running.');
      }
    }
  };

  const addService = (service) => {
    const existingService = selectedServices.find(s => s.id === service.id);
    if (existingService) {
      setSelectedServices(selectedServices.map(s => 
        s.id === service.id 
          ? { ...s, quantity: s.quantity + 1, total: (s.quantity + 1) * s.price }
          : s
      ));
      toast({
        title: "Service Updated",
        description: `${service.name} quantity increased`,
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    } else {
      setSelectedServices([...selectedServices, { ...service, quantity: 1, total: service.price }]);
      toast({
        title: "Service Added",
        description: `${service.name} has been added to the bill`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const updateQuantity = (serviceId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
    } else {
      setSelectedServices(selectedServices.map(s => 
        s.id === serviceId 
          ? { ...s, quantity: newQuantity, total: newQuantity * s.price }
          : s
      ));
    }
  };

  const removeService = (serviceId) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  const calculateSubtotal = () => {
    return selectedServices.reduce((sum, service) => sum + service.total, 0);
  };

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscountAmount();
  };

  // Alternative print method using iframe
  const handlePrintAlternative = () => {
    if (!patientData || selectedServices.length === 0) {
      toast({
        title: "Cannot Print",
        description: "Please select a patient and add services before printing.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const clinic = clinicData || {
      clinicName: 'HIMSHIKHA NURSING HOME',
      address: 'Plot No 1,Near CRPF Camp Himshika,Pinjore',
      city: 'Panchkula',
      state: 'Haryana',
      pincode: '134112',
      phone: '9815368811',
      email: 'info@demr.com',
      website: 'www.demr.com',
      license: 'CLINIC-LICENSE-001',
      registration: 'REG-2024-001'
    };
    
    console.log('🏥 Using clinic data for invoice:', clinic);

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${billNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          @media print {
            body { margin: 0; padding: 0; }
            @page { margin: 0.3in; size: A4; }
            .no-print { display: none !important; }
            * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            line-height: 1.4; 
            color: #1a202c; 
            background: #fff;
            font-size: 12px;
          }
          .container { 
            max-width: 100%;
            margin: 0 auto; 
            padding: 0;
            background: #fff;
          }
          .header {
            background: #ffffff;
            color: #000000;
            padding: 15px 20px;
            text-align: center;
            border-radius: 6px 6px 0 0;
            border: 3px solid #000000;
          }
          .clinic-name {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
            letter-spacing: 0.5px;
          }
          .invoice-title {
            font-size: 14px;
            font-weight: 500;
            opacity: 0.9;
            margin-bottom: 8px;
          }
          .clinic-info {
            background: #ffffff;
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #000000;
            font-size: 11px;
          }
          .clinic-info p {
            margin: 2px 0;
            color: #000000;
          }
          .main-content {
            display: flex;
            gap: 15px;
            margin: 15px 0;
          }
          .left-section {
            flex: 2;
          }
          .right-section {
            flex: 1;
            min-width: 200px;
          }
          .section-card {
            background: #ffffff;
            padding: 12px;
            border-radius: 4px;
            border: 2px solid #000000;
            margin-bottom: 10px;
          }
          .section-title {
            font-size: 12px;
            font-weight: 600;
            color: #000000;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 2px solid #000000;
          }
          .patient-name {
            font-size: 14px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 6px;
          }
          .detail-row {
            margin: 3px 0;
            font-size: 11px;
            color: #4a5568;
            display: flex;
            justify-content: space-between;
          }
          .detail-label {
            font-weight: 600;
            color: #000000;
          }
          .services-table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            font-size: 11px;
          }
          .services-table th {
            background: #ffffff;
            color: #000000;
            padding: 8px 6px;
            text-align: left;
            font-weight: 700;
            font-size: 10px;
            border: 2px solid #000000;
          }
          .services-table th:last-child,
          .services-table td:last-child {
            text-align: right;
          }
          .services-table th:nth-child(2),
          .services-table td:nth-child(2) {
            text-align: center;
            width: 40px;
          }
          .services-table th:nth-child(3),
          .services-table td:nth-child(3),
          .services-table th:nth-child(4),
          .services-table td:nth-child(4) {
            text-align: right;
            width: 70px;
          }
          .services-table td {
            padding: 6px;
            border-bottom: 1px solid #000000;
            border-left: 1px solid #000000;
            border-right: 1px solid #000000;
            font-size: 10px;
          }
          .services-table tbody tr:nth-child(even) {
            background: #f5f5f5;
          }
          .totals-box {
            background: #ffffff;
            padding: 12px;
            border-radius: 4px;
            border: 2px solid #000000;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            font-size: 11px;
          }
          .total-label {
            color: #4a5568;
          }
          .total-value {
            font-weight: 600;
            color: #1a202c;
          }
          .final-total {
            background: #ffffff;
            color: #000000;
            padding: 8px 12px;
            border-radius: 4px;
            margin-top: 8px;
            border: 3px solid #000000;
            font-weight: 700;
          }
          .final-total .total-row {
            font-size: 12px;
            font-weight: 700;
          }
          .notes-section {
            background: #f5f5f5;
            padding: 8px 12px;
            border-radius: 4px;
            border-left: 3px solid #000000;
            margin: 10px 0;
            font-size: 10px;
          }
          .notes-title {
            font-weight: 600;
            color: #000000;
            margin-bottom: 4px;
          }
          .notes-content {
            color: #333333;
            line-height: 1.3;
          }
          .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
            background: #fff;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .main-content {
            display: flex;
            gap: 15px;
            margin: 15px 0;
            flex: 1;
          }
          .footer {
            background: #ffffff;
            padding: 12px 20px;
            text-align: center;
            border-top: 2px solid #000000;
            border-left: 2px solid #000000;
            border-right: 2px solid #000000;
            border-bottom: 2px solid #000000;
            border-radius: 0 0 6px 6px;
            font-size: 10px;
            color: #000000;
            margin-top: auto;
          }
          .footer-thanks {
            font-weight: 600;
            color: #000000;
            margin-bottom: 4px;
          }
          .footer-meta {
            border-top: 1px solid #000000;
            padding-top: 6px;
            margin-top: 6px;
          }
          .footer-meta p {
            margin: 1px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="clinic-name">${clinic.clinicName}</div>
            <div class="invoice-title">INVOICE</div>
            <div class="clinic-info">
              <p><strong>${clinic.address}</strong></p>
              <p>${clinic.city}, ${clinic.state} ${clinic.pincode} | Phone: ${clinic.phone}</p>
              <p>Email: ${clinic.email}${clinic.website ? ` | Website: ${clinic.website}` : ''}</p>
      </div>
          </div>

          <!-- Main Content -->
          <div class="main-content">
            <!-- Left Section -->
            <div class="left-section">
              <!-- Bill To -->
              <div class="section-card">
                <div class="section-title">Bill To</div>
                <div class="patient-name">
                  ${patientData.firstName} ${patientData.middleName} ${patientData.lastName}
                </div>
                <div class="detail-row">
                  <span class="detail-label">Patient ID:</span>
                  <span>#${patientData.patientId || patientId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span>${patientData.phone}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span>${patientData.address || 'N/A'}</span>
                </div>
              </div>

              <!-- Services Table -->
              <div class="section-card">
                <div class="section-title">Services & Charges</div>
                <table class="services-table">
                  <thead>
                    <tr>
                      <th>Service Description</th>
                      <th>Qty</th>
                      <th>Rate (₹)</th>
                      <th>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${selectedServices.map((service, index) => `
                      <tr>
                        <td>${service.name}</td>
                        <td>${service.quantity}</td>
                        <td>₹${service.price.toLocaleString()}</td>
                        <td>₹${service.total.toLocaleString()}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Notes -->
              ${notes ? `
                <div class="notes-section">
                  <div class="notes-title">Additional Notes</div>
                  <div class="notes-content">${notes}</div>
                </div>
              ` : ''}
            </div>

            <!-- Right Section -->
            <div class="right-section">
              <!-- Invoice Details -->
              <div class="section-card">
                <div class="section-title">Invoice Details</div>
                <div class="detail-row">
                  <span class="detail-label">Invoice #:</span>
                  <span>${billNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span>${new Date(billDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Payment:</span>
                  <span>${paymentMethod.toUpperCase()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Generated:</span>
                  <span>${new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <!-- Totals -->
              <div class="totals-box">
                <div class="section-title">Payment Summary</div>
                <div class="total-row">
                  <span class="total-label">Subtotal:</span>
                  <span class="total-value">₹${calculateSubtotal().toFixed(2)}</span>
                </div>
                ${discount > 0 ? `
                  <div class="total-row">
                    <span class="total-label">Discount (${discount}%):</span>
                    <span class="total-value" style="color: #000000; font-weight: bold;">-₹${calculateDiscountAmount().toFixed(2)}</span>
                  </div>
                ` : ''}
                <div class="final-total">
                  <div class="total-row">
                    <span>Total Amount:</span>
                    <span>₹${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-thanks">Thank you for choosing ${clinic.clinicName}</div>
            <div class="footer-meta">
              <p>This is a computer generated invoice</p>
              <p>Generated on: ${new Date().toLocaleString()}</p>
              ${clinic.registration ? `<p>Registration: ${clinic.registration}</p>` : ''}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a new window for printing
    console.log('Creating print window...');
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast({
        title: "Print Blocked",
        description: "Please allow popups for this site to print the invoice.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      console.log('Print window loaded, attempting to print...');
      printWindow.focus();
      printWindow.print();
      
      // Close window after a delay
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };

    toast({
      title: "Print Ready",
      description: "Bill has been sent to printer",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleSaveBill = async () => {
    try {
      console.log('💾 Saving bill data:', {
      billNumber,
      billDate,
      patientData,
      patientId,
      selectedServices,
      subtotal: calculateSubtotal(),
      discount,
      discountAmount: calculateDiscountAmount(),
        total: calculateTotal(),
        paymentMethod,
        notes
      });

      const billData = {
        billNumber,
        billDate,
        patientId,
        patientData,
        selectedServices,
        subtotal: calculateSubtotal(),
        discount,
        discountAmount: calculateDiscountAmount(),
      total: calculateTotal(),
      paymentMethod,
      notes
    };
    
      const response = await api.post('/api/bills', billData);
      
      if (response.data.success) {
        console.log('✅ Bill saved successfully:', response.data);
        
        toast({
          title: "✅ Bill Saved Successfully",
          description: `Bill #${billNumber} has been saved to the database`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Optionally reset the form or navigate away
        // You can add form reset logic here if needed
        
      } else {
        throw new Error(response.data.message || 'Failed to save bill');
      }
      
    } catch (error) {
      console.error('❌ Error saving bill:', error);
      
      let errorMessage = "Failed to save bill. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ Error Saving Bill",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="7xl" p={4}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Card>
            <CardBody>
              <Flex justify="space-between" align="center">
                <HStack spacing={4}>
                  <Button
                    leftIcon={<Icon as={FaArrowLeft} />}
                    variant="outline"
                    colorScheme="gray"
                    onClick={() => navigate('/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
              {patientData && (
                    <Text fontSize="lg" color="gray.600">
                      Generating bill for <Text as="span" fontWeight="bold">{patientData.firstName} {patientData.lastName}</Text>
                    </Text>
                  )}
                </HStack>
                <IconButton
                  icon={<Icon as={FaTimes} />}
                  variant="ghost"
              onClick={() => navigate('/dashboard')} 
                  aria-label="Close"
                />
              </Flex>
            </CardBody>
          </Card>

          {/* Patient Lookup Section */}
          <Card>
            <CardHeader>
              <HStack>
                <Icon as={FaUser} color="blue.500" />
                <VStack align="start" spacing={1}>
                  <Heading size="md">Patient Lookup</Heading>
                  <Text color="gray.600">Enter registration number to load patient details</Text>
                </VStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={3}>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FaSearch} color="gray.300" />
                    </InputLeftElement>
                    <Input
                  placeholder="Registration No (e.g., 1, 2, 3)"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && fetchPatientByRegistrationNo()}
                    />
                  </InputGroup>
                  <Button
                    colorScheme="blue"
                    onClick={fetchPatientByRegistrationNo}
                    leftIcon={<Icon as={FaSearch} />}
                    isLoading={false}
                  >
                    Load Patient
                  </Button>
                </HStack>
              
              {lookupError && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription>{lookupError}</AlertDescription>
                  </Alert>
              )}
              
              {patientData && (
                  <Box>
                  {location.state?.patientData && (
                      <Alert status="success" mb={4}>
                        <AlertIcon />
                        <AlertDescription>Patient registered successfully! Ready to create bill.</AlertDescription>
                      </Alert>
                    )}
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} p={4} bg="blue.50" borderRadius="md">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Patient</Text>
                        <Text fontWeight="semibold">{patientData.firstName} {patientData.middleName} {patientData.lastName}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Reg No</Text>
                        <Text fontWeight="semibold">#{patientData.patientId || patientId}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Phone</Text>
                        <Text fontWeight="semibold">{patientData.phone}</Text>
                      </VStack>
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {patientData && (
            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
              {/* Left Column - Service Selection */}
              <VStack spacing={6} align="stretch">
                {/* Bill Information */}
                <Card>
                  <CardHeader>
                    <HStack>
                      <Icon as={FaReceipt} color="green.500" />
                      <VStack align="start" spacing={1}>
                        <Heading size="md">Bill Information</Heading>
                        <Text color="gray.600">Configure bill details and payment method</Text>
                      </VStack>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Bill Number</FormLabel>
                        <Input
                        value={billNumber} 
                        onChange={(e) => setBillNumber(e.target.value)}
                      />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Bill Date</FormLabel>
                        <Input
                        type="date" 
                        value={billDate} 
                        onChange={(e) => setBillDate(e.target.value)}
                      />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                        value={paymentMethod} 
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="insurance">Insurance</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Available Services */}
                <Card>
                  <CardHeader>
                    <HStack>
                      <Icon as={FaPlus} color="purple.500" />
                      <VStack align="start" spacing={1}>
                        <Heading size="md">Available Services</Heading>
                        <Text color="gray.600">Click on services to add to bill</Text>
                      </VStack>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      {/* Search and Filter Controls */}
                      <Box>
                        <HStack spacing={3} mb={4}>
                          <InputGroup flex="1">
                            <InputLeftElement pointerEvents="none">
                              <Icon as={FaSearch} color="gray.300" />
                            </InputLeftElement>
                            <Input
                              placeholder="Search lab tests..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </InputGroup>
                          <Select
                            placeholder="All Categories"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            w="200px"
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </Select>
                          {(searchTerm || selectedCategory) && (
                            <Button
                              variant="outline"
                              onClick={clearSearchAndFilters}
                              leftIcon={<Icon as={FaTimes} />}
                            >
                              Clear
                            </Button>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Found {filteredTests.length} lab tests
                        </Text>
                      </Box>

                      {/* Regular Services */}
                      <Box>
                        <Text fontWeight="semibold" mb={3} color="gray.700">
                          General Services
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                    {availableServices.map(service => (
                            <Card
                        key={service.id} 
                              cursor="pointer"
                              _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                              transition="all 0.2s"
                        onClick={() => addService(service)}
                      >
                              <CardBody p={4}>
                                <Flex justify="space-between" align="start" mb={2}>
                                  <Text fontWeight="semibold" fontSize="sm">{service.name}</Text>
                                  <Text fontWeight="bold" color="green.600">₹{service.price}</Text>
                                </Flex>
                                <Text fontSize="xs" color="gray.600" mb={2}>{service.description}</Text>
                                <Tag size="sm" colorScheme="blue">{service.category}</Tag>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      </Box>

                      {/* Lab Tests */}
                      <Box>
                        <Text fontWeight="semibold" mb={3} color="gray.700">
                          Laboratory Tests
                        </Text>
                    {labTestsLoading ? (
                          <VStack spacing={4} py={8}>
                            <Spinner size="lg" color="blue.500" />
                            <Text color="gray.600">Loading lab tests from database...</Text>
                          </VStack>
                    ) : labTestsError ? (
                          <Alert status="error">
                            <AlertIcon />
                            <AlertDescription>{labTestsError}</AlertDescription>
                          </Alert>
                        ) : (
                          <Box
                            maxH="400px"
                            overflowY="auto"
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="md"
                          >
                            {filteredTests.length > 0 ? (
                              <VStack spacing={0} align="stretch">
                                {filteredTests.map(test => (
                                  <Box
                          key={`lab-${test.id}`} 
                                    p={3}
                                    borderBottom="1px solid"
                                    borderColor="gray.100"
                                    _hover={{ bg: "gray.50" }}
                                    cursor="pointer"
                          onClick={() => addService({
                            id: `lab-${test.id}`,
                                      name: test.testName,
                            category: 'Laboratory',
                                      price: test.price || 500,
                                      description: test.description || `${test.testName} laboratory test`,
                            isLabTest: true,
                            labTestId: test.id
                          })}
                        >
                                    <Flex justify="space-between" align="start">
                                      <VStack align="start" spacing={1} flex={1}>
                                        <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                                          {test.testName}
                                        </Text>
                                        <Text fontSize="xs" color="gray.600">
                                          {test.testCode} • {test.category}
                                        </Text>
                                        {test.description && (
                                          <Text fontSize="xs" color="gray.500">
                                            {test.description}
                                          </Text>
                                        )}
                                      </VStack>
                                      <VStack align="end" spacing={1}>
                                        <Text fontSize="sm" fontWeight="bold" color="green.600">
                                          ₹{test.price || 500}
                                        </Text>
                                        <Button
                                          size="xs"
                                          colorScheme="blue"
                                          variant="outline"
                                          leftIcon={<Icon as={FaPlus} />}
                                        >
                                          Add
                                        </Button>
                                      </VStack>
                                    </Flex>
                                  </Box>
                                ))}
                              </VStack>
                            ) : (
                              <Box p={4} textAlign="center">
                                <Text color="gray.500" fontSize="sm">
                                  No lab tests found matching your search.
                                </Text>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Bill Notes */}
                <Card>
                  <CardHeader>
                    <HStack>
                      <Icon as={FaNotesMedical} color="orange.500" />
                      <VStack align="start" spacing={1}>
                        <Heading size="md">Additional Notes</Heading>
                        <Text color="gray.600">Enter any additional notes or instructions</Text>
                      </VStack>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Textarea
                      placeholder="Enter any additional notes or instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </CardBody>
                </Card>
              </VStack>

              {/* Right Column - Bill Summary */}
              <VStack spacing={6} align="stretch">
                {/* Clinic Data Display */}
                <Card>
                  <CardHeader>
                    <HStack>
                      <Icon as={FaUser} color="blue.500" />
                      <VStack align="start" spacing={1}>
                        <Heading size="md">Clinic Information</Heading>
                        <Text color="gray.600">Current clinic data for invoice</Text>
                      </VStack>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    {clinicData ? (
                      <VStack align="start" spacing={2}>
                        <Text><strong>Name:</strong> {clinicData.clinicName}</Text>
                        <Text><strong>Address:</strong> {clinicData.address}</Text>
                        <Text><strong>City:</strong> {clinicData.city}, {clinicData.state} {clinicData.pincode}</Text>
                        <Text><strong>Phone:</strong> {clinicData.phone}</Text>
                        <Text><strong>Email:</strong> {clinicData.email}</Text>
                      </VStack>
                    ) : (
                      <Text color="orange.500">Loading clinic data...</Text>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <HStack>
                      <Icon as={FaCalculator} color="teal.500" />
                      <VStack align="start" spacing={1}>
                        <Heading size="md">Bill Summary</Heading>
                        <Text color="gray.600">Review selected services and totals</Text>
                      </VStack>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                  {/* Selected Services */}
                      <Box>
                        <Text fontWeight="semibold" mb={3} color="gray.700">
                          Selected Services ({selectedServices.length})
                        </Text>
                    {selectedServices.length === 0 ? (
                          <Box
                            textAlign="center"
                            p={8}
                            border="2px dashed"
                            borderColor="gray.300"
                            borderRadius="md"
                            bg="gray.50"
                          >
                            <Text color="gray.500" fontSize="sm">
                              No services selected. Add services from the left panel.
                            </Text>
                          </Box>
                        ) : (
                          <VStack spacing={2} align="stretch">
                        {selectedServices.map(service => (
                              <Card key={service.id} size="sm">
                                <CardBody p={3}>
                                  <Flex justify="space-between" align="center">
                                    <VStack align="start" spacing={1} flex={1}>
                                      <Text fontSize="sm" fontWeight="semibold">{service.name}</Text>
                                      <Text fontSize="xs" color="gray.600">
                                        ₹{service.price} × {service.quantity}
                                      </Text>
                                    </VStack>
                                    <HStack spacing={2}>
                                      <IconButton
                                        size="xs"
                                        icon={<Text>-</Text>}
                                onClick={() => updateQuantity(service.id, service.quantity - 1)}
                                        aria-label="Decrease quantity"
                                      />
                                      <Text fontSize="sm" fontWeight="semibold" minW="20px" textAlign="center">
                                        {service.quantity}
                                      </Text>
                                      <IconButton
                                        size="xs"
                                        icon={<Text>+</Text>}
                                onClick={() => updateQuantity(service.id, service.quantity + 1)}
                                        aria-label="Increase quantity"
                                      />
                                      <IconButton
                                        size="xs"
                                        colorScheme="red"
                                        variant="ghost"
                                        icon={<Icon as={FaTrash} />}
                                onClick={() => removeService(service.id)}
                                        aria-label="Remove service"
                                      />
                                    </HStack>
                                  </Flex>
                                </CardBody>
                              </Card>
                            ))}
                          </VStack>
                        )}
                      </Box>

                  {/* Bill Calculations */}
                      <Box>
                        <VStack spacing={2} align="stretch">
                          <Flex justify="space-between">
                            <Text fontSize="sm">Subtotal:</Text>
                            <Text fontSize="sm" fontWeight="semibold">₹{calculateSubtotal().toFixed(2)}</Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text fontSize="sm">Discount ({discount}%):</Text>
                            <Text fontSize="sm" color="red.500">-₹{calculateDiscountAmount().toFixed(2)}</Text>
                          </Flex>
                          <Divider />
                          <Flex justify="space-between">
                            <Text fontSize="lg" fontWeight="bold">Total:</Text>
                            <Text fontSize="lg" fontWeight="bold" color="green.600">
                              ₹{calculateTotal().toFixed(2)}
                            </Text>
                          </Flex>
                        </VStack>
                      </Box>

                  {/* Discount Control */}
                      <FormControl>
                        <FormLabel fontSize="sm">Discount Percentage</FormLabel>
                        <NumberInput
                      value={discount} 
                          onChange={(value) => setDiscount(parseFloat(value) || 0)}
                          min={0}
                          max={100}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                  {/* Action Buttons */}
                      <VStack spacing={3} align="stretch">
                        <Button
                          colorScheme="purple"
                          size="lg"
                          leftIcon={<Icon as={FaSearch} />}
                          onClick={fetchClinicData}
                          mr={2}
                        >
                          Refresh Clinic Data
                        </Button>
                        <Button
                          colorScheme="blue"
                          size="lg"
                          leftIcon={<Icon as={FaPrint} />}
                          onClick={handlePrintAlternative}
                          isDisabled={selectedServices.length === 0}
                        >
                          Generate & Print Bill
                        </Button>
                        <Button
                          colorScheme="green"
                          size="lg"
                          leftIcon={<Icon as={FaSave} />}
                      onClick={handleSaveBill}
                          isDisabled={selectedServices.length === 0}
                        >
                          Save Bill
                        </Button>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </Grid>
          )}

        </VStack>
      </Container>
    </Box>
  );
};

export default Billing;
