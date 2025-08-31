import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Badge,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  IconButton,
  Tooltip,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import {
  FaUserPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUser,
  FaHeartbeat,
  FaUsers,
  FaMale,
  FaFemale,
} from 'react-icons/fa';

// Mock data for demo purposes when backend is not available
const mockPatients = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-05-15',
    gender: 'Male',
    phone: '+91-9876543210',
    email: 'john.doe@email.com',
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400001',
    bloodGroup: 'O+',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '+91-9876543211',
    occupation: 'Software Engineer',
    maritalStatus: 'Married',
    allergies: 'None',
    medicalHistory: 'Hypertension',
    currentMedications: 'Amlodipine 5mg',
    createdAt: '2024-01-15T10:30:00.000Z'
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1985-08-22',
    gender: 'Female',
    phone: '+91-9876543212',
    email: 'sarah.j@email.com',
    address: '456 Oak Avenue',
    city: 'Delhi',
    state: 'Delhi',
    pinCode: '110001',
    bloodGroup: 'A+',
    emergencyContact: 'Mike Johnson',
    emergencyPhone: '+91-9876543213',
    occupation: 'Doctor',
    maritalStatus: 'Single',
    allergies: 'Peanuts',
    medicalHistory: 'Asthma',
    currentMedications: 'Inhaler',
    createdAt: '2024-01-14T15:45:00.000Z'
  },
  {
    id: 3,
    firstName: 'Rajesh',
    lastName: 'Kumar',
    dateOfBirth: '1978-12-10',
    gender: 'Male',
    phone: '+91-9876543214',
    email: 'rajesh.k@email.com',
    address: '789 Pine Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pinCode: '560001',
    bloodGroup: 'B+',
    emergencyContact: 'Priya Kumar',
    emergencyPhone: '+91-9876543215',
    occupation: 'Teacher',
    maritalStatus: 'Married',
    allergies: 'None',
    medicalHistory: 'Diabetes Type 2',
    currentMedications: 'Metformin 500mg',
    createdAt: '2024-01-13T09:20:00.000Z'
  }
];

const PatientList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [filterGender, setFilterGender] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');

  // Color mode values
  const bgColor = 'gray.50';
  const cardBg = 'white';
  const textColor = 'gray.800';
  const textSecondary = 'gray.600';

  useEffect(() => {
    console.log('🚀 PatientList component mounted');
    console.log('🌐 Current hostname:', window.location.hostname);
    console.log('🔌 Offline mode:', isOffline);
    
    // Check if we're in production (Vercel) and set offline mode
    if (window.location.hostname.includes('vercel.app')) {
      console.log('🚨 Setting offline mode for Vercel deployment');
      setIsOffline(true);
    }
    
    fetchPatients();
  }, [isOffline]);

  const fetchPatients = async () => {
    if (isOffline) {
      // Use mock data for demo
      setPatients(mockPatients);
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching patients from API...');
      const response = await fetch('/api/patients');
      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Patients data received:', data);
        setPatients(data.patients || data); // Handle both formats
      } else {
        console.error('❌ API Error:', response.status, response.statusText);
        throw new Error(`Failed to fetch patients: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      console.log('🔄 Falling back to mock data...');
      setPatients(mockPatients);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patientId) => {
    if (isOffline) {
      // Demo mode - just remove from local state
      setPatients(patients.filter(p => p.id !== patientId));
      toast({
        title: 'Patient Deleted',
        description: 'Patient removed successfully (demo mode)',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setPatients(patients.filter(p => p.id !== patientId));
        toast({
          title: 'Patient Deleted',
          description: 'Patient removed successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to delete patient');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete patient',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    onOpen();
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = !filterGender || patient.gender === filterGender;
    const matchesBloodGroup = !filterBloodGroup || patient.bloodGroup === filterBloodGroup;
    
    return matchesSearch && matchesGender && matchesBloodGroup;
  });

  const stats = {
    total: patients.length,
    male: patients.filter(p => p.gender === 'Male').length,
    female: patients.filter(p => p.gender === 'Female').length,
    withAllergies: patients.filter(p => p.allergies && p.allergies !== 'None').length,
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="health.500" thickness="4px" />
          <Text color={textSecondary} fontSize="lg">
            Loading patients...
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="7xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Card shadow="lg" borderRadius="xl" bg={cardBg}>
            <CardBody p={8}>
              <Flex alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={4}>
                <VStack align="start" spacing={2}>
                  <HStack spacing={3}>
                    <Icon as={FaUsers} w={8} h={8} color="health.500" />
                    <Heading size="xl" color={textColor}>
                      Patient Management
                    </Heading>
                  </HStack>
                  <Text color={textSecondary} fontSize="lg">
                    {isOffline ? 'Demo Mode: Managing sample patient data' : 'Manage your patient records'}
                  </Text>
                  {isOffline && (
                    <Alert status="info" borderRadius="md" maxW="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Demo Mode</AlertTitle>
                        <AlertDescription>
                          Using mock data for demonstration
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </VStack>
                <Button
                  onClick={() => navigate('/add-patient')}
                  colorScheme="health"
                  size="lg"
                  borderRadius="lg"
                  leftIcon={<FaUserPlus />}
                  _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Add Patient
                </Button>
              </Flex>
            </CardBody>
          </Card>

          {/* Stats Overview */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <Card shadow="md" borderRadius="lg" bg={cardBg}>
              <CardBody p={6} textAlign="center">
                <Stat>
                  <StatNumber fontSize="3xl" color="blue.600">{stats.total}</StatNumber>
                  <StatLabel color={textSecondary}>Total Patients</StatLabel>
                </Stat>
              </CardBody>
            </Card>
            <Card shadow="md" borderRadius="lg" bg={cardBg}>
              <CardBody p={6} textAlign="center">
                <Stat>
                  <StatNumber fontSize="3xl" color="blue.500">{stats.male}</StatNumber>
                  <StatLabel color={textSecondary}>Male Patients</StatLabel>
                </Stat>
              </CardBody>
            </Card>
            <Card shadow="md" borderRadius="lg" bg={cardBg}>
              <CardBody p={6} textAlign="center">
                <Stat>
                  <StatNumber fontSize="3xl" color="pink.500">{stats.female}</StatNumber>
                  <StatLabel color={textSecondary}>Female Patients</StatLabel>
                </Stat>
              </CardBody>
            </Card>
            <Card shadow="md" borderRadius="lg" bg={cardBg}>
              <CardBody p={6} textAlign="center">
                <Stat>
                  <StatNumber fontSize="3xl" color="orange.500">{stats.withAllergies}</StatNumber>
                  <StatLabel color={textSecondary}>With Allergies</StatLabel>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Search and Filters */}
          <Card shadow="lg" borderRadius="xl" bg={cardBg}>
            <CardBody p={6}>
              <VStack spacing={6}>
                <HStack spacing={4} w="full">
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search patients by name, phone, email, or city..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      focusBorderColor="health.500"
                    />
                  </InputGroup>
                  <Text color={textSecondary} fontSize="sm" whiteSpace="nowrap">
                    {filteredPatients.length} of {patients.length} patients
                  </Text>
                </HStack>
                
                <HStack spacing={4} w="full">
                  <FormControl maxW="200px">
                    <FormLabel fontSize="sm">Gender</FormLabel>
                    <Select
                      value={filterGender}
                      onChange={(e) => setFilterGender(e.target.value)}
                      placeholder="All Genders"
                      borderRadius="lg"
                      focusBorderColor="health.500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl maxW="200px">
                    <FormLabel fontSize="sm">Blood Group</FormLabel>
                    <Select
                      value={filterBloodGroup}
                      onChange={(e) => setFilterBloodGroup(e.target.value)}
                      placeholder="All Blood Groups"
                      borderRadius="lg"
                      focusBorderColor="health.500"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </Select>
                  </FormControl>
                  
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterGender('');
                      setFilterBloodGroup('');
                    }}
                    variant="outline"
                    colorScheme="gray"
                    borderRadius="lg"
                    leftIcon={<FaFilter />}
                  >
                    Clear Filters
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Patients Table */}
          <Card shadow="lg" borderRadius="xl" bg={cardBg}>
            <CardHeader pb={4}>
              <Heading size="md" color={textColor}>
                Patient Records
              </Heading>
            </CardHeader>
            <CardBody pt={0}>
              <TableContainer>
                <Table variant="simple">
                  <Thead bg="gray.50" _dark={{ bg: 'gray.700' }}>
                    <Tr>
                      <Th color={textColor}>Patient</Th>
                      <Th color={textColor}>Contact</Th>
                      <Th color={textColor}>Location</Th>
                      <Th color={textColor}>Medical Info</Th>
                      <Th color={textColor}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredPatients.map((patient) => (
                      <Tr key={patient.id} _hover={{ bg: 'gray.50' }} _dark={{ _hover: { bg: 'gray.700' } }}>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar
                              size="md"
                              name={`${patient.firstName} ${patient.lastName}`}
                              bg={patient.gender === 'Male' ? 'blue.500' : 'pink.500'}
                            />
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold" color={textColor}>
                                {patient.firstName} {patient.lastName}
                              </Text>
                              <HStack spacing={2}>
                                <Badge colorScheme={patient.gender === 'Male' ? 'blue' : 'pink'} variant="subtle">
                                  {patient.gender === 'Male' ? <FaMale /> : <FaFemale />} {patient.gender}
                                </Badge>
                                <Text fontSize="sm" color={textSecondary}>
                                  {calculateAge(patient.dateOfBirth)} years
                                </Text>
                              </HStack>
                            </VStack>
                          </HStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2} fontSize="sm">
                              <Icon as={FaPhone} color="gray.500" />
                              <Text color={textColor}>{patient.phone}</Text>
                            </HStack>
                            <HStack spacing={2} fontSize="sm">
                              <Icon as={FaEnvelope} color="gray.500" />
                              <Text color={textColor}>{patient.email}</Text>
                            </HStack>
                          </VStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2} fontSize="sm">
                              <Icon as={FaMapMarkerAlt} color="gray.500" />
                              <Text color={textColor}>{patient.city}, {patient.state}</Text>
                            </HStack>
                            <Text fontSize="sm" color={textSecondary}>
                              PIN: {patient.pinCode}
                            </Text>
                          </VStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2} fontSize="sm">
                              <Icon as={FaHeartbeat} color="red.500" />
                              <Text color={textColor}>Blood: {patient.bloodGroup}</Text>
                            </HStack>
                            {patient.allergies && patient.allergies !== 'None' && (
                              <Badge colorScheme="red" variant="outline" fontSize="xs">
                                Allergy: {patient.allergies}
                              </Badge>
                            )}
                          </VStack>
                        </Td>
                        
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="View Details">
                              <IconButton
                                icon={<FaEye />}
                                onClick={() => handleViewPatient(patient)}
                                colorScheme="blue"
                                variant="ghost"
                                size="sm"
                                aria-label="View patient"
                              />
                            </Tooltip>
                            <Tooltip label="Edit Patient">
                              <IconButton
                                icon={<FaEdit />}
                                onClick={() => navigate(`/patient/${patient.id}/edit`)}
                                colorScheme="green"
                                variant="ghost"
                                size="sm"
                                aria-label="Edit patient"
                              />
                            </Tooltip>
                            <Tooltip label="Delete Patient">
                              <IconButton
                                icon={<FaTrash />}
                                onClick={() => handleDelete(patient.id)}
                                colorScheme="red"
                                variant="ghost"
                                size="sm"
                                aria-label="Delete patient"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
              
              {filteredPatients.length === 0 && (
                <VStack spacing={4} py={12}>
                  <Icon as={FaUsers} w={16} h={16} color="gray.400" />
                  <Text color={textSecondary} fontSize="lg">
                    No patients found matching your criteria
                  </Text>
                  <Button
                    onClick={() => navigate('/add-patient')}
                    colorScheme="health"
                    leftIcon={<FaUserPlus />}
                    borderRadius="lg"
                  >
                    Add Your First Patient
                  </Button>
                </VStack>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Patient Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FaUser} color="health.500" />
              <Text>Patient Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedPatient && (
              <VStack spacing={6} align="stretch">
                {/* Basic Info */}
                <Card variant="outline">
                  <CardHeader pb={3}>
                    <Heading size="md" color={textColor}>
                      Basic Information
                    </Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color={textSecondary}>Full Name</Text>
                        <Text fontWeight="bold">{selectedPatient.firstName} {selectedPatient.lastName}</Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color={textSecondary}>Date of Birth</Text>
                        <Text>{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color={textSecondary}>Gender</Text>
                        <Badge colorScheme={selectedPatient.gender === 'Male' ? 'blue' : 'pink'}>
                          {selectedPatient.gender}
                        </Badge>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color={textSecondary}>Blood Group</Text>
                        <Badge colorScheme="red" variant="outline">{selectedPatient.bloodGroup}</Badge>
                      </VStack>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Contact Info */}
                <Card variant="outline">
                  <CardHeader pb={3}>
                    <Heading size="md" color={textColor}>
                      Contact Information
                    </Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color={textSecondary}>Phone</Text>
                        <Text>{selectedPatient.phone}</Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color={textSecondary}>Email</Text>
                        <Text>{selectedPatient.email}</Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color={textSecondary}>Emergency Contact</Text>
                        <Text>{selectedPatient.emergencyContact}</Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color={textSecondary}>Emergency Phone</Text>
                        <Text>{selectedPatient.emergencyPhone}</Text>
                      </VStack>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Medical Info */}
                <Card variant="outline">
                  <CardHeader pb={3}>
                    <Heading size="md" color={textColor}>
                      Medical Information
                    </Heading>
                  </CardHeader>
                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color={textSecondary}>Allergies</Text>
                        <Text>{selectedPatient.allergies}</Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color={textSecondary}>Medical History</Text>
                        <Text>{selectedPatient.medicalHistory}</Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color={textSecondary}>Current Medications</Text>
                        <Text>{selectedPatient.currentMedications}</Text>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} variant="ghost">
              Close
            </Button>
            <Button
              colorScheme="health"
              onClick={() => {
                onClose();
                navigate(`/patient/${selectedPatient?.id}`);
              }}
            >
              View Full Profile
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PatientList;
