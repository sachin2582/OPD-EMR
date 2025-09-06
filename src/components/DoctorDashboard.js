import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { FaUserMd, FaUsers, FaStethoscope, FaCalendarAlt, FaSearch, FaEye, FaPrescription, FaClock, FaUser, FaHeartbeat, FaPhone, FaIdCard, FaThermometerHalf, FaTachometerAlt, FaWeight, FaNotesMedical } from 'react-icons/fa';
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
  Badge,
  Flex,
  Spacer,
  Icon,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Container,
  Grid,
  GridItem,
  Avatar,
  Tag,
  TagLabel,
  TagLeftIcon,
  useToast,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  CircularProgress,
  CircularProgressLabel
} from '@chakra-ui/react';
import '../styles/MasterTheme.css';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // Only list view
  
  // Color mode values
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Fetch patients with completed billing from backend API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Check if user is authenticated
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        
        if (!isAuthenticated) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access the dashboard",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          navigate('/login');
          return;
        }
        
        console.log('🚀 DoctorDashboard: Fetching patients with completed billing...');
        const response = await api.get('/api/doctors/patients');
        console.log('📡 Response status:', response.status);
        
        if (response.status === 200) {
          const data = response.data;
          console.log('✅ Raw data from backend:', data);
          console.log('📊 Data type:', typeof data);
          console.log('📊 Is array:', Array.isArray(data));
          console.log('📊 Data length:', data.length);
          
          // Handle both array format and object with data property
          const allPatients = Array.isArray(data) ? data : (data.data || []);
          console.log('✅ All patients with completed billing processed:', allPatients);
          console.log('📊 Patients count:', allPatients.length);
          
          // Patients already have status and prescription info from the API
          setPatients(allPatients);
          
          toast({
            title: "✅ Patients Loaded",
            description: `Found ${allPatients.length} patients with completed billing`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          console.error('❌ Failed to fetch patients:', response.status, response.statusText);
          setPatients([]);
          
          toast({
            title: "❌ Error Loading Patients",
            description: "Failed to fetch patients with completed billing",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('❌ Error fetching patients:', error);
        setPatients([]);
        
        toast({
          title: "❌ Error Loading Patients",
          description: "Failed to connect to server. Please ensure backend is running.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        console.log('🏁 Setting loading to false');
        setLoading(false);
      }
    };

    fetchPatients();
  }, [toast]);

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    const statusMatch = filterStatus === 'all' || (patient.status || 'waiting') === filterStatus;
    const searchMatch = 
      (patient.firstName && patient.firstName.toLowerCase().includes(searchLower)) ||
      (patient.lastName && patient.lastName.toLowerCase().includes(searchLower)) ||
      (patient.phone && patient.phone.includes(searchTerm)) ||
      (patient.chiefComplaint && patient.chiefComplaint.toLowerCase().includes(searchLower)) ||
      (patient.patientId && patient.patientId.toString().includes(searchTerm)) ||
      (patient.id && patient.id.toString().includes(searchTerm));
    
    return statusMatch && searchMatch;
  });

  // Debug logging
  console.log('🔍 DoctorDashboard Debug:');
  console.log('📊 Total patients:', patients.length);
  console.log('🔍 Filtered patients:', filteredPatients.length);
  console.log('🔍 Search term:', searchTerm);
  console.log('🔍 Filter status:', filterStatus);
  console.log('⏳ Loading state:', loading);

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'var(--warning-500)';
      case 'in-progress': return 'var(--primary-500)';
      case 'completed': return 'var(--success-500)';
      default: return 'var(--neutral-500)';
    }
  };



  const updatePatientStatus = (patientId, newStatus) => {
    setPatients(patients.map(patient => 
      patient.id === patientId ? { ...patient, status: newStatus } : patient
    ));
  };

  const getTodayStats = () => {
    const total = patients.length;
    const waiting = patients.filter(p => !p.status || p.status === 'waiting').length;
    const inProgress = patients.filter(p => p.status === 'in-progress').length;
    const completed = patients.filter(p => p.status === 'completed').length;
    
    return { total, waiting, inProgress, completed };
  };

  // Helper functions for status
  const getStatusText = (status) => {
    switch (status) {
      case 'waiting': return 'Waiting';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const handleStartConsultation = async (patient) => {
    try {
      if (patient.hasPrescription) {
        // Patient has existing prescription, fetch the latest one for editing
        const prescriptionResponse = await api.get(`/api/prescriptions/patient/${patient.id}`);
        if (prescriptionResponse.status === 200) {
          const prescriptions = prescriptionResponse.data;
          if (prescriptions && prescriptions.length > 0) {
            // Get the latest prescription
            const latestPrescription = prescriptions[0];
            // Navigate to edit mode with prescription data
            navigate(`/e-prescription/${patient.id}`, {
              state: {
                patientData: patient,
                prescriptionData: latestPrescription,
                mode: 'edit'
              }
            });
            return;
          }
        }
      }
      // No existing prescription, start new consultation
      navigate(`/e-prescription/${patient.id}`, {
        state: {
          patientData: patient,
          mode: 'new'
        }
      });
    } catch (error) {
      console.error('Error handling consultation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start consultation. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleViewPrescription = (patientId) => {
    navigate(`/view-prescription/${patientId}`);
  };

  const stats = getTodayStats();

  const getStatusColorScheme = (status) => {
    switch (status) {
      case 'waiting': return 'yellow';
      case 'in-progress': return 'blue';
      case 'completed': return 'green';
      default: return 'gray';
    }
  };



  return (
    <Box minH="100vh" bg="gray.50" p={6}>
      <Container maxW="7xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="xl" color="health.600" mb={2}>
              <HStack>
                <Icon as={FaUserMd} />
                <Text>Doctor Dashboard</Text>
              </HStack>
            </Heading>
            <HStack spacing={4}>
              <Text color="gray.600" fontSize="lg">
                Manage patients with completed billing and consultations
              </Text>
              <Badge colorScheme={patients.length > 0 ? 'green' : 'orange'} variant="solid">
                {patients.length > 0 ? `${patients.length} Patients (Billing Completed)` : 'No Patients with Completed Billing'}
              </Badge>
            </HStack>
          </Box>

          {/* Date Selection */}
          <Card>
            <CardBody>
              <HStack spacing={4}>
                <Icon as={FaCalendarAlt} color="health.500" />
                <Text fontWeight="semibold">Select Date:</Text>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  maxW="200px"
                />
              </HStack>
            </CardBody>
          </Card>

          {/* Statistics Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg="health.50" borderColor="health.200">
              <CardBody>
                <Stat>
                  <HStack>
                    <Icon as={FaUsers} color="health.500" boxSize={6} />
                    <StatLabel color="health.700">Total Patients</StatLabel>
                  </HStack>
                  <StatNumber color="health.600">{stats.total}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    All registered patients
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="warning.50" borderColor="warning.200">
              <CardBody>
                <Stat>
                  <HStack>
                    <Icon as={FaClock} color="warning.500" boxSize={6} />
                    <StatLabel color="warning.700">Waiting</StatLabel>
                  </HStack>
                  <StatNumber color="warning.600">{stats.waiting}</StatNumber>
                  <StatHelpText>
                    Patients waiting for consultation
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="blue.50" borderColor="blue.200">
              <CardBody>
                <Stat>
                  <HStack>
                    <Icon as={FaStethoscope} color="blue.500" boxSize={6} />
                    <StatLabel color="blue.700">In Progress</StatLabel>
                  </HStack>
                  <StatNumber color="blue.600">{stats.inProgress}</StatNumber>
                  <StatHelpText>
                    Currently being consulted
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="success.50" borderColor="success.200">
              <CardBody>
                <Stat>
                  <HStack>
                    <Icon as={FaPrescription} color="success.500" boxSize={6} />
                    <StatLabel color="success.700">Completed</StatLabel>
                  </HStack>
                  <StatNumber color="success.600">{stats.completed}</StatNumber>
                  <StatHelpText>
                    Consultations completed
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Search and Filters */}
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <HStack w="full" spacing={4}>
                  <InputGroup flex={1}>
                    <InputLeftElement>
                      <Icon as={FaSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search patients by name, phone, complaint, or patient ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                  
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    maxW="200px"
                  >
                    <option value="all">All Status</option>
                    <option value="waiting">Waiting</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Select>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Patient List */}
          <Card>
            <CardHeader>
              <HStack>
                <Icon as={FaUsers} color="health.500" />
                <Heading size="md">Patient Management</Heading>
                <Badge colorScheme="health" variant="subtle">
                  {filteredPatients.length} patients
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              {loading ? (
                <VStack spacing={4}>
                  <CircularProgress isIndeterminate color="health.500" />
                  <Text>Loading patients...</Text>
                </VStack>
              ) : patients.length === 0 ? (
                <VStack spacing={4} py={8}>
                  <Icon as={FaUsers} boxSize={16} color="gray.400" />
                  <Heading size="md" color="gray.600">No patients with completed billing</Heading>
                  <Text color="gray.500" textAlign="center">
                    Patients will appear here only after their billing is completed.
                    <br />
                    Complete the billing process first: Registration → Billing → Doctor Dashboard
                  </Text>
                  <HStack spacing={4}>
                    <Button
                      colorScheme="blue"
                      leftIcon={<Icon as={FaUser} />}
                      onClick={() => navigate('/add-patient')}
                      size="lg"
                    >
                      Register Patient
                    </Button>
                    <Button
                      colorScheme="green"
                      leftIcon={<Icon as={FaPrescription} />}
                      onClick={() => navigate('/billing')}
                      size="lg"
                    >
                      Complete Billing
                    </Button>
                  </HStack>
                </VStack>
              ) : filteredPatients.length === 0 ? (
                <VStack spacing={4} py={8}>
                  <Icon as={FaSearch} boxSize={16} color="gray.400" />
                  <Heading size="md" color="gray.600">No patients found</Heading>
                  <Text color="gray.500" textAlign="center">
                    No patients match your current search criteria.
                    <br />
                    Try adjusting your search terms or filters.
                  </Text>
                </VStack>
              ) : (
                <TableContainer>
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr>
                        <Th>Patient Info</Th>
                        <Th>Demographics</Th>
                        <Th>Appointment</Th>
                        <Th>Chief Complaint</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {console.log('🎯 Rendering patients:', filteredPatients.length, 'patients')}
                      {filteredPatients.map(patient => (
                        <Tr key={patient.id} _hover={{ bg: 'gray.50' }}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold">
                                {patient.firstName} {patient.lastName}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                ID: {patient.patientId || patient.id}
                              </Text>
                              <HStack>
                                <Icon as={FaPhone} boxSize={3} color="gray.400" />
                                <Text fontSize="sm" color="gray.600">
                                  {patient.phone || 'No phone'}
                                </Text>
                              </HStack>
                            </VStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <HStack>
                                <Icon as={FaUser} boxSize={3} color="gray.400" />
                                <Text fontSize="sm">{patient.age || 'N/A'} years</Text>
                              </HStack>
                              <Text fontSize="sm" color="gray.600">
                                {patient.gender || 'N/A'}
                              </Text>
                              <HStack>
                                <Icon as={FaHeartbeat} boxSize={3} color="gray.400" />
                                <Text fontSize="sm" color="gray.600">
                                  {patient.bloodGroup || 'N/A'}
                                </Text>
                              </HStack>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {patient.appointmentTime || 'Not specified'}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" noOfLines={2}>
                              {patient.chiefComplaint || 'Not specified'}
                            </Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getStatusColorScheme(patient.status || 'waiting')}
                              variant="subtle"
                            >
                              {getStatusText(patient.status || 'waiting')}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Tooltip label={patient.hasPrescription ? "Edit Prescription" : "Start Consultation"}>
                                <IconButton
                                  icon={<Icon as={FaPrescription} />}
                                  colorScheme={patient.hasPrescription ? "orange" : "health"}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartConsultation(patient)}
                                />
                              </Tooltip>
                              <Tooltip label="View Prescription">
                                <IconButton
                                  icon={<Icon as={FaEye} />}
                                  colorScheme="gray"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewPrescription(patient.id)}
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

export default DoctorDashboard;