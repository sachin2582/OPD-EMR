import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Flex,
  Spacer,
  IconButton,
  Tooltip,
  useColorModeValue,
  Divider
} from '@chakra-ui/react';
import { SearchIcon, DownloadIcon, ViewIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const BillsView = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  // Fetch bills based on selected date and filters
  const fetchBills = useCallback(async (date = selectedDate, status = statusFilter) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📅 Fetching bills for date:', date, 'status:', status);
      console.log('🌐 API Base URL:', process.env.REACT_APP_API_BASE_URL);
      console.log('🔗 Full API URL:', `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/api/bills`);
      
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (status) params.append('status', status);
      
      const response = await api.get(`/api/bills?${params.toString()}`);
      
      if (response.data.success) {
        console.log('✅ Bills fetched successfully:', response.data);
        setBills(response.data.data || []);
        
        toast({
          title: "✅ Bills Loaded",
          description: `Found ${response.data.count} bills for ${date}`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch bills');
      }
    } catch (error) {
      console.error('❌ Error fetching bills:', error);
      
      let errorMessage = "Failed to fetch bills. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setBills([]);
      
      toast({
        title: "❌ Error Loading Bills",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, statusFilter, toast]);

  // Load bills on component mount and when filters change
  useEffect(() => {
    console.log('🔄 BillsView component mounted, fetching bills...');
    console.log('📊 Current state:', { selectedDate, statusFilter, bills: bills.length });
    fetchBills();
  }, [fetchBills]);

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    fetchBills(newDate, statusFilter);
  };

  // Handle status filter change
  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    fetchBills(selectedDate, newStatus);
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Filter bills based on search term
  const filteredBills = bills.filter(bill => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      bill.billNumber?.toLowerCase().includes(searchLower) ||
      bill.patientName?.toLowerCase().includes(searchLower) ||
      bill.patientPhone?.includes(searchTerm) ||
      bill.services?.toLowerCase().includes(searchLower)
    );
  });

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'green';
      case 'PENDING':
        return 'yellow';
      case 'CANCELLED':
        return 'red';
      case 'REFUNDED':
        return 'purple';
      default:
        return 'gray';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle view bill details
  const handleViewBill = (billId) => {
    navigate(`/billing?billId=${billId}`);
  };


  // Generate print content for bill (using same format as Billing component)
  const generatePrintContent = (bill) => {
    const clinic = {
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

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${bill.billNumber}</title>
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
                  ${bill.patientName || 'N/A'}
                </div>
                <div class="detail-row">
                  <span class="detail-label">Patient ID:</span>
                  <span>#${bill.patientId || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span>${bill.patientPhone || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Address:</span>
                  <span>${bill.patientAddress || 'N/A'}</span>
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
                    ${bill.items && bill.items.length > 0 ? bill.items.map((item, index) => `
                      <tr>
                        <td>${item.serviceName}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.unitPrice.toLocaleString()}</td>
                        <td>₹${item.totalPrice.toLocaleString()}</td>
                      </tr>
                    `).join('') : `
                      <tr>
                        <td>${bill.services || 'General Consultation'}</td>
                        <td>1</td>
                        <td>₹${(bill.subtotal || bill.total).toLocaleString()}</td>
                        <td>₹${(bill.subtotal || bill.total).toLocaleString()}</td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>

              <!-- Notes -->
              ${bill.notes ? `
                <div class="notes-section">
                  <div class="notes-title">Additional Notes</div>
                  <div class="notes-content">${bill.notes}</div>
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
                  <span>${bill.billNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span>${new Date(bill.billDate || bill.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Payment:</span>
                  <span>${(bill.paymentMethod || 'CASH').toUpperCase()}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span>${(bill.status || 'PAID').toUpperCase()}</span>
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
                  <span class="total-value">₹${(bill.subtotal || bill.total).toFixed(2)}</span>
                </div>
                ${bill.discount > 0 ? `
                  <div class="total-row">
                    <span class="total-label">Discount (${bill.discount}%):</span>
                    <span class="total-value" style="color: #000000; font-weight: bold;">-₹${(bill.discountAmount || 0).toFixed(2)}</span>
                  </div>
                ` : ''}
                <div class="final-total">
                  <div class="total-row">
                    <span>Total Amount:</span>
                    <span>₹${bill.total.toFixed(2)}</span>
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
    
    return printContent;
  };

  // Open print dialog (using same approach as Billing component)
  const openPrintDialog = (printContent, billNumber) => {
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

  // Handle print bill
  const handlePrintBill = async (billId) => {
    try {
      console.log('🖨️ Printing bill ID:', billId);
      
      // Fetch the specific bill data
      const response = await api.get(`/api/bills/${billId}`);
      
      if (response.data.success) {
        const bill = response.data.data;
        console.log('📄 Bill data for printing:', bill);
        
        // Generate print content
        const printContent = generatePrintContent(bill);
        
        // Open print dialog
        openPrintDialog(printContent, bill.billNumber);
      } else {
        toast({
          title: "❌ Error",
          description: "Failed to fetch bill data for printing",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('❌ Error printing bill:', error);
      toast({
        title: "❌ Print Error",
        description: "Failed to print bill. Please try again.",
        status: "error",
        duration: 3000,
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
            <CardHeader>
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color="blue.600">
                    Bills View
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    View and manage patient bills by date
                  </Text>
                </VStack>
                <HStack spacing={3}>
                  <Button
                    leftIcon={<DownloadIcon />}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                  >
                    Export
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={() => navigate('/billing')}
                    size="sm"
                  >
                    New Bill
                  </Button>
                </HStack>
              </HStack>
            </CardHeader>
          </Card>

          {/* Filters */}
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <HStack spacing={4} w="full" flexWrap="wrap">
                  {/* Date Picker */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                      Select Date
                    </Text>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      w="200px"
                    />
                  </Box>

                  {/* Status Filter */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                      Payment Status
                    </Text>
                    <Select
                      value={statusFilter}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      placeholder="All Status"
                      w="150px"
                    >
                      <option value="PAID">Paid</option>
                      <option value="PENDING">Pending</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="REFUNDED">Refunded</option>
                    </Select>
                  </Box>

                  {/* Search */}
                  <Box flex="1" minW="250px">
                    <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                      Search Bills
                    </Text>
                    <Input
                      placeholder="Search by bill number, patient name, or phone..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      leftIcon={<SearchIcon />}
                    />
                  </Box>

                  {/* Refresh Button */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                      &nbsp;
                    </Text>
                    <Button
                      onClick={() => {
                        console.log('🔄 Manual refresh triggered');
                        fetchBills();
                      }}
                      isLoading={loading}
                      loadingText="Loading..."
                      colorScheme="blue"
                      variant="outline"
                    >
                      Refresh
                    </Button>
                  </Box>
                  
                  {/* Test API Button */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                      &nbsp;
                    </Text>
                    <Button
                      onClick={async () => {
                        console.log('🧪 Testing API directly...');
                        try {
                          const response = await fetch('http://localhost:3001/api/bills');
                          const data = await response.json();
                          console.log('🧪 Direct API response:', data);
                          alert(`API Response: ${JSON.stringify(data, null, 2)}`);
                        } catch (error) {
                          console.error('🧪 Direct API error:', error);
                          alert(`API Error: ${error.message}`);
                        }
                      }}
                      colorScheme="green"
                      variant="outline"
                      size="sm"
                    >
                      Test API
                    </Button>
                  </Box>
                </HStack>

                {/* Summary */}
                <HStack w="full" justify="space-between" pt={2}>
                  <Text fontSize="sm" color="gray.600">
                    Showing {filteredBills.length} of {bills.length} bills
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Total Amount: {formatCurrency(filteredBills.reduce((sum, bill) => sum + (bill.total || 0), 0))}
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Bills Table */}
          <Card>
            <CardBody p={0}>
              {loading ? (
                <Flex justify="center" align="center" h="200px">
                  <VStack spacing={4}>
                    <Spinner size="lg" color="blue.500" />
                    <Text color="gray.600">Loading bills...</Text>
                  </VStack>
                </Flex>
              ) : error ? (
                <Alert status="error" m={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Error Loading Bills!</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Box>
                </Alert>
              ) : filteredBills.length === 0 ? (
                <Flex justify="center" align="center" h="200px">
                  <VStack spacing={4}>
                    <Text fontSize="lg" color="gray.500">
                      No bills found
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      {searchTerm ? 'Try adjusting your search criteria' : 'No bills available for the selected date'}
                    </Text>
                  </VStack>
                </Flex>
              ) : (
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead bg={headerBg}>
                      <Tr>
                        <Th>Bill ID</Th>
                        <Th>Patient Name</Th>
                        <Th>Phone</Th>
                        <Th>Amount</Th>
                        <Th>Date/Time</Th>
                        <Th>Status</Th>
                        <Th>Services</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredBills.map((bill) => (
                        <Tr key={bill.id} _hover={{ bg: 'gray.50' }}>
                          <Td>
                            <Text fontWeight="medium" color="blue.600">
                              #{bill.billNumber}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontWeight="medium">
                              {bill.patientName || 'N/A'}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600">
                              {bill.patientPhone || 'N/A'}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" color="green.600">
                              {formatCurrency(bill.total || 0)}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600">
                              {formatDate(bill.billDate || bill.createdAt)}
                            </Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getStatusColor(bill.status)}
                              variant="subtle"
                            >
                              {bill.status || 'UNKNOWN'}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600" maxW="200px" isTruncated>
                              {bill.services || 'No services'}
                            </Text>
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              <Tooltip label="View Bill">
                                <IconButton
                                  icon={<ViewIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleViewBill(bill.id)}
                                />
                              </Tooltip>
                              <Tooltip label="Print Bill">
                                <IconButton
                                  icon={<DownloadIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="purple"
                                  onClick={() => handlePrintBill(bill.id)}
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default BillsView;
