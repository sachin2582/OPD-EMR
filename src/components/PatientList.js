import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Input,
  Select,
  HStack,
  VStack,
  Flex,
  Spacer,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  Divider,
  Icon,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useBreakpointValue
} from '@chakra-ui/react';
import { 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaVenusMars,
  FaTint,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaArrowLeft,
  FaUsers,
  FaHospital,
  FaStethoscope,
  FaTimes,
  FaUserInjured,
  FaIdCard,
  FaHeartbeat,
  FaEllipsisV,
  FaTable,
  FaTh,
  FaDownload,
  FaPrint
} from 'react-icons/fa';

const PatientList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Color scheme
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const primaryColor = 'medical.500';

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      console.log('Fetching records from API...');
      const response = await fetch('/api/patients');
      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);
        
        // Handle the API response structure correctly
        if (data.patients && Array.isArray(data.patients)) {
          console.log('Setting records from data.patients:', data.patients.length);
          setPatients(data.patients);
        } else if (Array.isArray(data)) {
          console.log('Setting records from direct array:', data.length);
          setPatients(data);
        } else {
          console.log('No valid records data found, setting empty array');
          setPatients([]);
        }
      } else {
        console.error('API response not ok:', response.status, response.statusText);
        setError('Failed to fetch records');
      }
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const response = await fetch(`/api/patients/${patientId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setPatients(patients.filter(p => p.patientId !== patientId));
          toast({
            title: 'Success!',
            description: 'Patient deleted successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Error!',
            description: 'Failed to delete patient',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        toast({
          title: 'Error!',
          description: 'Error deleting patient',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const filteredPatients = (patients || []).filter(patient => {
    if (!patient) return false;
    
    const matchesSearch = 
      patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = !filterGender || patient.gender === filterGender;
    const matchesBloodGroup = !filterBloodGroup || patient.bloodGroup === filterBloodGroup;
    
    return matchesSearch && matchesGender && matchesBloodGroup;
  });

  const getGenderColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male': return 'blue';
      case 'female': return 'pink';
      default: return 'gray';
    }
  };

  const getBloodGroupColor = (bloodGroup) => {
    if (!bloodGroup) return 'gray';
    return bloodGroup.includes('+') ? 'red' : 'orange';
  };

  const openPatientDetails = (patient) => {
    setSelectedPatient(patient);
    onOpen();
  };

  if (loading) {
    return (
      <Center minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color={primaryColor} />
          <Text>Loading patients...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="7xl">
        {/* Header */}
        <Flex mb={8} align="center" justify="space-between" flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" color={textColor} display="flex" alignItems="center" gap={3}>
              <Icon as={FaUsers} color={primaryColor} />
              Patient Management
            </Heading>
            <Text color="gray.600" mt={2}>
              Manage and view all patient records
            </Text>
          </Box>
          
          <HStack spacing={4}>
            <Button
              leftIcon={<FaArrowLeft />}
              onClick={() => navigate('/dashboard')}
              variant="outline"
              colorScheme="gray"
            >
              Back to Dashboard
            </Button>
            <Button
              leftIcon={<FaPlus />}
              onClick={() => navigate('/add-patient')}
              colorScheme="medical"
              size="lg"
            >
              Add New Patient
            </Button>
          </HStack>
        </Flex>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Patients</StatLabel>
                <StatNumber>{patients.length}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  23.36%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Active Patients</StatLabel>
                <StatNumber>{filteredPatients.length}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  12.5%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>New This Month</StatLabel>
                <StatNumber>24</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  8.2%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pending Appointments</StatLabel>
                <StatNumber>12</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  3.1%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Search and Filters */}
        <Card mb={6}>
          <CardBody>
            <VStack spacing={4}>
              <HStack w="full" spacing={4} flexWrap="wrap">
                <Box flex="1" minW="200px">
                  <Input
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<FaSearch />}
                    size="lg"
                  />
                </Box>
                
                <Select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  placeholder="Filter by Gender"
                  size="lg"
                  minW="150px"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
                
                <Select
                  value={filterBloodGroup}
                  onChange={(e) => setFilterBloodGroup(e.target.value)}
                  placeholder="Filter by Blood Group"
                  size="lg"
                  minW="150px"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </Select>
              </HStack>
              
              <HStack spacing={4}>
                <Button
                  leftIcon={<FaTable />}
                  variant={viewMode === 'table' ? 'solid' : 'outline'}
                  colorScheme="medical"
                  onClick={() => setViewMode('table')}
                >
                  Table View
                </Button>
                <Button
                  leftIcon={<FaTh />}
                  variant={viewMode === 'grid' ? 'solid' : 'outline'}
                  colorScheme="medical"
                  onClick={() => setViewMode('grid')}
                >
                  Grid View
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Patient List */}
        {viewMode === 'table' ? (
          <Card>
            <CardBody>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Patient</Th>
                      <Th>Contact</Th>
                      <Th>Demographics</Th>
                      <Th>Medical</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredPatients.map((patient) => (
                      <Tr key={patient.patientId || patient.id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">
                              {patient.firstName} {patient.lastName}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              ID: {patient.patientId || patient.id}
                            </Text>
                          </VStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            {patient.phone && (
                              <HStack spacing={2}>
                                <Icon as={FaPhone} color="gray.500" />
                                <Text fontSize="sm">{patient.phone}</Text>
                              </HStack>
                            )}
                            {patient.email && (
                              <HStack spacing={2}>
                                <Icon as={FaEnvelope} color="gray.500" />
                                <Text fontSize="sm">{patient.email}</Text>
                              </HStack>
                            )}
                          </VStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <Icon as={FaCalendarAlt} color="gray.500" />
                              <Text fontSize="sm">{patient.dateOfBirth}</Text>
                            </HStack>
                            <HStack spacing={2}>
                              <Icon as={FaVenusMars} color="gray.500" />
                              <Badge colorScheme={getGenderColor(patient.gender)}>
                                {patient.gender}
                              </Badge>
                            </HStack>
                          </VStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            {patient.bloodGroup && (
                              <HStack spacing={2}>
                                <Icon as={FaTint} color="gray.500" />
                                <Badge colorScheme={getBloodGroupColor(patient.bloodGroup)}>
                                  {patient.bloodGroup}
                                </Badge>
                              </HStack>
                            )}
                            {patient.chiefComplaint && (
                              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                {patient.chiefComplaint}
                              </Text>
                            )}
                          </VStack>
                        </Td>
                        
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="View Details">
                              <IconButton
                                icon={<FaEye />}
                                onClick={() => openPatientDetails(patient)}
                                aria-label="View patient details"
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                              />
                            </Tooltip>
                            
                            <Tooltip label="Edit Patient">
                              <IconButton
                                icon={<FaEdit />}
                                onClick={() => navigate(`/patient/${patient.patientId || patient.id}`)}
                                aria-label="Edit patient"
                                size="sm"
                                colorScheme="green"
                                variant="ghost"
                              />
                            </Tooltip>
                            
                            <Tooltip label="Delete Patient">
                              <IconButton
                                icon={<FaTrash />}
                                onClick={() => handleDelete(patient.patientId || patient.id)}
                                aria-label="Delete patient"
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredPatients.map((patient) => (
              <Card key={patient.patientId || patient.id} cursor="pointer" 
                    _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                    transition="all 0.2s">
                <CardHeader pb={2}>
                  <Flex align="center" justify="space-between">
                    <Avatar name={`${patient.firstName} ${patient.lastName}`} size="sm" />
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FaEllipsisV />}
                        variant="ghost"
                        size="sm"
                        aria-label="Patient actions"
                      />
                      <MenuList>
                        <MenuItem icon={<FaEye />} onClick={() => openPatientDetails(patient)}>
                          View Details
                        </MenuItem>
                        <MenuItem icon={<FaEdit />} onClick={() => navigate(`/patient/${patient.patientId || patient.id}`)}>
                          Edit Patient
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem icon={<FaTrash />} onClick={() => handleDelete(patient.patientId || patient.id)} color="red.500">
                          Delete Patient
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>
                  <Heading size="md" mt={2}>
                    {patient.firstName} {patient.lastName}
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    ID: {patient.patientId || patient.id}
                  </Text>
                </CardHeader>
                
                <CardBody pt={0}>
                  <VStack align="start" spacing={3}>
                    {patient.phone && (
                      <HStack spacing={2}>
                        <Icon as={FaPhone} color="gray.500" />
                        <Text fontSize="sm">{patient.phone}</Text>
                      </HStack>
                    )}
                    
                    <HStack spacing={2}>
                      <Icon as={FaCalendarAlt} color="gray.500" />
                      <Text fontSize="sm">{patient.dateOfBirth}</Text>
                    </HStack>
                    
                    <HStack spacing={2}>
                      <Icon as={FaVenusMars} color="gray.500" />
                      <Badge colorScheme={getGenderColor(patient.gender)}>
                        {patient.gender}
                      </Badge>
                    </HStack>
                    
                    {patient.bloodGroup && (
                      <HStack spacing={2}>
                        <Icon as={FaTint} color="gray.500" />
                        <Badge colorScheme={getBloodGroupColor(patient.bloodGroup)}>
                          {patient.bloodGroup}
                        </Badge>
                      </HStack>
                    )}
                    
                    {patient.chiefComplaint && (
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        <Icon as={FaStethoscope} mr={2} />
                        {patient.chiefComplaint}
                      </Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Patient Details Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <Icon as={FaUser} color={primaryColor} />
                <Text>Patient Details</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedPatient && (
                <VStack align="start" spacing={4}>
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </Text>
                    <Text color="gray.600">ID: {selectedPatient.patientId || selectedPatient.id}</Text>
                  </Box>
                  
                  <Divider />
                  
                  <SimpleGrid columns={2} spacing={4} w="full">
                    <Box>
                      <Text fontWeight="semibold" color="gray.700">Date of Birth</Text>
                      <Text>{selectedPatient.dateOfBirth}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.700">Gender</Text>
                      <Badge colorScheme={getGenderColor(selectedPatient.gender)}>
                        {selectedPatient.gender}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.700">Blood Group</Text>
                      {selectedPatient.bloodGroup ? (
                        <Badge colorScheme={getBloodGroupColor(selectedPatient.bloodGroup)}>
                          {selectedPatient.bloodGroup}
                        </Badge>
                      ) : (
                        <Text color="gray.500">Not specified</Text>
                      )}
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" color="gray.700">Phone</Text>
                      <Text>{selectedPatient.phone || 'Not specified'}</Text>
                    </Box>
                  </SimpleGrid>
                  
                  {selectedPatient.email && (
                    <Box w="full">
                      <Text fontWeight="semibold" color="gray.700">Email</Text>
                      <Text>{selectedPatient.email}</Text>
                    </Box>
                  )}
                  
                  {selectedPatient.address && (
                    <Box w="full">
                      <Text fontWeight="semibold" color="gray.700">Address</Text>
                      <Text>{selectedPatient.address}</Text>
                    </Box>
                  )}
                  
                  {selectedPatient.chiefComplaint && (
                    <Box w="full">
                      <Text fontWeight="semibold" color="gray.700">Chief Complaint</Text>
                      <Text>{selectedPatient.chiefComplaint}</Text>
                    </Box>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Close
              </Button>
              {selectedPatient && (
                <Button
                  colorScheme="medical"
                  onClick={() => {
                    onClose();
                    navigate(`/patient/${selectedPatient.patientId || selectedPatient.id}`);
                  }}
                >
                  Edit Patient
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default PatientList;
