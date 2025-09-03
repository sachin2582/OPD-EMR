import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaStethoscope, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaNotesMedical, 
  FaSave, 
  FaTimes,
  FaUserMd,
  FaPhoneAlt,
  FaArrowLeft,
  FaCalendarDay,
  FaUserFriends,
  FaClock,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaUserPlus,
  FaUsers,
  FaCalendarPlus,
  FaCheckDouble
} from 'react-icons/fa';
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
  CircularProgressLabel,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  CheckboxGroup,
  Stack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Switch,
  Radio,
  RadioGroup,
  RadioStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  Editable,
  EditablePreview,
  EditableInput,
  EditableTextarea,
  Code,
  Kbd,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Link,
  LinkBox,
  LinkOverlay,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  CloseButton,
  Portal,
  useBreakpointValue,
  useMediaQuery,
  useClipboard,
  useDisclosure as useDisclosureHook
} from '@chakra-ui/react';
import './AppointmentScheduler.css';

const AppointmentScheduler = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Color mode values
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('existing');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form data for existing patient appointment
  const [existingPatientForm, setExistingPatientForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: '',
    notes: '',
    status: 'scheduled',
    priority: 'normal',
    duration: '30'
  });

  // Form data for new patient appointment
  const [newPatientForm, setNewPatientForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: '',
    notes: '',
    status: 'scheduled',
    priority: 'normal',
    duration: '30'
  });

  // Mock data
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'General Consultation', icon: '🩺' },
    { value: 'followup', label: 'Follow-up', icon: '🔄' },
    { value: 'emergency', label: 'Emergency', icon: '🚨' },
    { value: 'routine', label: 'Routine Checkup', icon: '✅' },
    { value: 'specialist', label: 'Specialist Visit', icon: '👨‍⚕️' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'normal', label: 'Normal Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const durations = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' }
  ];

  // Load data on component mount
  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await api.get('/api/patients');
      if (response.ok) {
        const data = await response.json();
          setPatients(data);
        } else {
        // Mock data for development
        setPatients([
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            phone: '1234567890',
            email: 'john.doe@email.com',
            address: '123 Main St, City, State'
          },
          {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '0987654321',
            email: 'jane.smith@email.com',
            address: '456 Oak Ave, City, State'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      // Mock data for development
      setPatients([
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
          email: 'john.doe@email.com',
          address: '123 Main St, City, State'
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '0987654321',
          email: 'jane.smith@email.com',
          address: '456 Oak Ave, City, State'
        }
      ]);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await api.get('/api/doctors');
      if (response.ok) {
        const data = await response.json();
          setDoctors(data);
        } else {
        // Mock data for development
        setDoctors([
          {
            id: 1,
            firstName: 'Dr. Sarah',
            lastName: 'Johnson',
            specialization: 'General Medicine',
            experience: 10
          },
          {
            id: 2,
            firstName: 'Dr. Michael',
            lastName: 'Brown',
            specialization: 'Cardiology',
            experience: 15
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      // Mock data for development
      setDoctors([
        {
          id: 1,
          firstName: 'Dr. Sarah',
          lastName: 'Johnson',
          specialization: 'General Medicine',
          experience: 10
        },
        {
          id: 2,
          firstName: 'Dr. Michael',
          lastName: 'Brown',
          specialization: 'Cardiology',
          experience: 15
        }
      ]);
    }
  };

  const handleExistingPatientInputChange = (e) => {
    const { name, value } = e.target;
    setExistingPatientForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNewPatientInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatientForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleExistingPatientSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      const response = await api.post('/api/appointments', existingPatientForm);

      if (response.ok) {
        setSuccessMessage('Appointment scheduled successfully!');
        setShowSuccess(true);
        setExistingPatientForm({
          patientId: '',
          doctorId: '',
          appointmentDate: '',
          appointmentTime: '',
          appointmentType: '',
          notes: '',
          status: 'scheduled',
          priority: 'normal',
          duration: '30'
        });
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        const errorData = await response.json();
        setErrors(errorData.errors || { general: 'Failed to schedule appointment' });
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPatientSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/api/appointments/new-patient', newPatientForm);

      if (response.ok) {
        setSuccessMessage('Patient registered and appointment scheduled successfully!');
        setShowSuccess(true);
        setNewPatientForm({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          address: '',
          dateOfBirth: '',
          gender: '',
          doctorId: '',
          appointmentDate: '',
          appointmentTime: '',
          appointmentType: '',
          notes: '',
          status: 'scheduled',
          priority: 'normal',
          duration: '30'
        });
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        const errorData = await response.json();
        setErrors(errorData.errors || { general: 'Failed to register patient and schedule appointment' });
      }
    } catch (error) {
      console.error('Error registering patient and scheduling appointment:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPatient = () => {
    return patients && Array.isArray(patients) ? patients.find(patient => patient.id === existingPatientForm.patientId) : null;
  };

  const getAppointmentTypeIcon = (type) => {
    const appointmentType = appointmentTypes.find(t => t.value === type);
    return appointmentType ? appointmentType.icon : '🩺';
  };

    const filteredPatients = patients && Array.isArray(patients) ? patients.filter(patient =>
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <Box minH="100vh" bg="gray.50" p={6}>
      <Container maxW="7xl">
        <VStack spacing={8} align="stretch">
             {/* Header */}
          <Card>
            <CardBody>
              <HStack justify="space-between" align="center">
                <Button
                  leftIcon={<Icon as={FaArrowLeft} />}
                  variant="outline"
                  colorScheme="gray"
               onClick={() => navigate('/dashboard')} 
                >
                  Back to Dashboard
                </Button>
                <Heading size="xl" color="health.600">
                  <HStack>
                    <Icon as={FaCalendarAlt} />
                    <Text>Appointment Scheduler</Text>
                  </HStack>
                </Heading>
              </HStack>
            </CardBody>
          </Card>

      {/* Success Message */}
      {showSuccess && (
            <Alert status="success" borderRadius="lg">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Box>
              <CloseButton
                position="absolute"
                right="8px"
                top="8px"
            onClick={() => setShowSuccess(false)}
              />
            </Alert>
      )}

      {/* Patient Type Selection Tabs */}
          <Card>
            <CardBody>
              <Tabs index={activeTab === 'existing' ? 0 : 1} onChange={(index) => setActiveTab(index === 0 ? 'existing' : 'new')}>
                <TabList>
                  <Tab>
                    <HStack>
                      <Icon as={FaUsers} />
                      <Text>Existing Patient</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack>
                      <Icon as={FaUserPlus} />
                      <Text>New Patient</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Existing Patient Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
          {/* Quick Info Cards */}
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <Card bg="health.50" borderColor="health.200">
                          <CardBody>
                            <Stat>
                              <HStack>
                                <Icon as={FaUser} color="health.500" boxSize={6} />
                                <StatLabel color="health.700">Registered Patients</StatLabel>
                              </HStack>
                              <StatNumber color="health.600">{patients ? patients.length : 0}</StatNumber>
                              <StatHelpText>Total registered patients</StatHelpText>
                            </Stat>
                          </CardBody>
                        </Card>

                        <Card bg="blue.50" borderColor="blue.200">
                          <CardBody>
                            <Stat>
                              <HStack>
                                <Icon as={FaUserMd} color="blue.500" boxSize={6} />
                                <StatLabel color="blue.700">Available Doctors</StatLabel>
                              </HStack>
                              <StatNumber color="blue.600">{doctors ? doctors.length : 0}</StatNumber>
                              <StatHelpText>Doctors available for appointments</StatHelpText>
                            </Stat>
                          </CardBody>
                        </Card>

                        <Card bg="green.50" borderColor="green.200">
                          <CardBody>
                            <Stat>
                              <HStack>
                                <Icon as={FaClock} color="green.500" boxSize={6} />
                                <StatLabel color="green.700">Time Slots</StatLabel>
                              </HStack>
                              <StatNumber color="green.600">{timeSlots.length}</StatNumber>
                              <StatHelpText>Available time slots</StatHelpText>
                            </Stat>
                          </CardBody>
                        </Card>
                      </SimpleGrid>

                      {/* Existing Patient Appointment Form */}
                      <Card>
                        <CardHeader>
                          <Heading size="md" color="health.600">
                            <HStack>
                              <Icon as={FaUsers} />
                              <Text>Schedule Appointment for Existing Patient</Text>
                            </HStack>
                          </Heading>
                          <Text color="gray.600">
                            Select from registered patients and schedule their appointment
                          </Text>
                        </CardHeader>
                        <CardBody>
                          <form onSubmit={handleExistingPatientSubmit}>
                            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
                              {/* Left Panel - Patient Information */}
                              <GridItem>
                                <Card variant="outline">
                                  <CardHeader>
                                    <Heading size="sm" color="health.600">
                                      <HStack>
                                        <Icon as={FaUser} />
                                        <Text>Patient Selection</Text>
                                      </HStack>
                                    </Heading>
                                  </CardHeader>
                                  <CardBody>
                                    <VStack spacing={4} align="stretch">
                    {/* Search Section */}
                                      <FormControl>
                                        <FormLabel>
                                          <HStack>
                                            <Icon as={FaSearch} />
                                            <Text>Search Patients</Text>
                                          </HStack>
                                        </FormLabel>
                                        <InputGroup>
                                          <InputLeftElement>
                                            <Icon as={FaSearch} color="gray.400" />
                                          </InputLeftElement>
                                          <Input
                          type="text"
                          placeholder="Search by name, phone, or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                                        </InputGroup>
                                      </FormControl>
                      
                                                            {/* Patient Results */}
                                      {searchTerm && (
                                        <Box maxH="300px" overflowY="auto" border="1px" borderColor="gray.200" borderRadius="md">
                                          {filteredPatients && filteredPatients.length > 0 ? filteredPatients.map(patient => (
                                            <Box 
                                              key={patient.id} 
                                              p={3}
                                              borderBottom="1px"
                                              borderColor="gray.100"
                                              cursor="pointer"
                                              _hover={{ bg: "gray.50" }}
                                              onClick={() => setExistingPatientForm(prev => ({ ...prev, patientId: patient.id }))}
                                            >
                                              <HStack spacing={3}>
                                                <Avatar size="sm" bg="health.500">
                                                  {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                                                </Avatar>
                                                <VStack align="start" spacing={1} flex={1}>
                                                  <Text fontWeight="semibold" color="health.600">
                                                    {patient.firstName} {patient.lastName}
                                                  </Text>
                                                  <HStack spacing={2}>
                                                    <Icon as={FaPhoneAlt} color="gray.500" />
                                                    <Text fontSize="sm" color="gray.600">{patient.phone}</Text>
                                                  </HStack>
                                                  {patient.email && (
                                                    <HStack spacing={2}>
                                                      <Icon as={FaEnvelope} color="gray.500" />
                                                      <Text fontSize="sm" color="gray.600">{patient.email}</Text>
                                                    </HStack>
                                                  )}
                                                </VStack>
                                              </HStack>
                                            </Box>
                                          )) : (
                                            <Box p={4} textAlign="center" color="gray.500">
                                              <Text>No patients found</Text>
                                            </Box>
                                          )}
                                        </Box>
                                      )}

                    {/* Selected Patient Display */}
                    {existingPatientForm.patientId && (
                                        <Box>
                                          <FormLabel>
                                            <HStack>
                                              <Icon as={FaUser} />
                                              <Text>Selected Patient</Text>
                                            </HStack>
                                          </FormLabel>
                        {(() => {
                          const patient = getSelectedPatient();
                          return patient ? (
                                              <Card variant="outline" bg="health.50" borderColor="health.200">
                                                <CardBody>
                                                  <HStack spacing={3}>
                                                    <Avatar size="md" bg="health.500">
                                {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                                                    </Avatar>
                                                    <VStack align="start" spacing={1} flex={1}>
                                                      <Text fontWeight="semibold" color="health.600" fontSize="lg">
                                  {patient.firstName} {patient.lastName}
                                                      </Text>
                                                      <HStack spacing={2}>
                                                        <Icon as={FaPhoneAlt} color="gray.500" />
                                                        <Text fontSize="sm" color="gray.600">{patient.phone}</Text>
                                                      </HStack>
                                  {patient.email && (
                                                        <HStack spacing={2}>
                                                          <Icon as={FaEnvelope} color="gray.500" />
                                                          <Text fontSize="sm" color="gray.600">{patient.email}</Text>
                                                        </HStack>
                                                      )}
                                                    </VStack>
                                                  </HStack>
                                                </CardBody>
                                              </Card>
                          ) : null;
                        })()}
                                        </Box>
                    )}
                                    </VStack>
                                  </CardBody>
                                </Card>
                              </GridItem>

                  {/* Right Panel - Appointment Details */}
                              <GridItem>
                                <Card variant="outline">
                                  <CardHeader>
                                    <Heading size="sm" color="health.600">
                                      <HStack>
                                        <Icon as={FaCalendarDay} />
                                        <Text>Appointment Details</Text>
                                      </HStack>
                                    </Heading>
                                  </CardHeader>
                                  <CardBody>
                                    <VStack spacing={4} align="stretch">
                    {/* Core Appointment Fields */}
                                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl isRequired isInvalid={errors.doctorId}>
                                          <FormLabel>
                                            <HStack>
                                              <Icon as={FaUserMd} />
                                              <Text>Select Doctor</Text>
                                            </HStack>
                                          </FormLabel>
                                                                                    <Select
                                            name="doctorId"
                                            value={existingPatientForm.doctorId}
                                            onChange={handleExistingPatientInputChange}
                                            placeholder="Select doctor"
                                          >
                                            {doctors && doctors.length > 0 ? doctors.map(doctor => (
                                              <option key={doctor.id} value={doctor.id}>
                                                Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                                              </option>
                                            )) : (
                                              <option value="" disabled>No doctors available</option>
                                            )}
                                          </Select>
                                          {errors.doctorId && (
                                            <FormErrorMessage>{errors.doctorId}</FormErrorMessage>
                                          )}
                                        </FormControl>

                                        <FormControl isRequired isInvalid={errors.appointmentType}>
                                          <FormLabel>
                                            <HStack>
                                              <Text>{getAppointmentTypeIcon(existingPatientForm.appointmentType)}</Text>
                                              <Text>Appointment Type</Text>
                                            </HStack>
                                          </FormLabel>
                                          <Select
                          name="appointmentType"
                          value={existingPatientForm.appointmentType}
                          onChange={handleExistingPatientInputChange}
                                            placeholder="Select type"
                        >
                          {appointmentTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                                          </Select>
                                          {errors.appointmentType && (
                                            <FormErrorMessage>{errors.appointmentType}</FormErrorMessage>
                                          )}
                                        </FormControl>

                                        <FormControl isRequired isInvalid={errors.appointmentDate}>
                                          <FormLabel>
                                            <HStack>
                                              <Icon as={FaCalendarAlt} />
                                              <Text>Date</Text>
                                            </HStack>
                                          </FormLabel>
                                          <Input
                          type="date"
                          name="appointmentDate"
                          value={existingPatientForm.appointmentDate}
                          onChange={handleExistingPatientInputChange}
                          min={new Date().toISOString().split('T')[0]}
                        />
                                          {errors.appointmentDate && (
                                            <FormErrorMessage>{errors.appointmentDate}</FormErrorMessage>
                                          )}
                                        </FormControl>

                                        <FormControl isRequired isInvalid={errors.appointmentTime}>
                                          <FormLabel>
                                            <HStack>
                                              <Icon as={FaClock} />
                                              <Text>Time</Text>
                                            </HStack>
                                          </FormLabel>
                                          <Select
                          name="appointmentTime"
                          value={existingPatientForm.appointmentTime}
                          onChange={handleExistingPatientInputChange}
                                            placeholder="Select time"
                        >
                          <option value="">Select time</option>
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                                          </Select>
                                          {errors.appointmentTime && (
                                            <FormErrorMessage>{errors.appointmentTime}</FormErrorMessage>
                                          )}
                                        </FormControl>
                                      </SimpleGrid>

                    {/* Priority and Duration Section */}
                                      <Box>
                                        <Heading size="sm" color="health.600" mb={4}>
                                          <HStack>
                                            <Icon as={FaExclamationTriangle} />
                                            <Text>Priority & Duration</Text>
                                          </HStack>
                                        </Heading>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                          <FormControl>
                                            <FormLabel>
                                              <HStack>
                                                <Icon as={FaExclamationTriangle} />
                                                <Text>Priority</Text>
                                              </HStack>
                                            </FormLabel>
                                            <Select
                            name="priority"
                            value={existingPatientForm.priority}
                            onChange={handleExistingPatientInputChange}
                          >
                            {priorities.map(priority => (
                              <option key={priority.value} value={priority.value}>
                                {priority.label}
                              </option>
                            ))}
                                            </Select>
                                          </FormControl>

                                          <FormControl>
                                            <FormLabel>
                                              <HStack>
                                                <Icon as={FaClock} />
                                                <Text>Duration</Text>
                                              </HStack>
                                            </FormLabel>
                                            <Select
                            name="duration"
                            value={existingPatientForm.duration}
                            onChange={handleExistingPatientInputChange}
                          >
                            {durations.map(duration => (
                              <option key={duration.value} value={duration.value}>
                                {duration.label}
                              </option>
                            ))}
                                            </Select>
                                          </FormControl>
                                        </SimpleGrid>
                                      </Box>

                    {/* Status Section */}
                                      <FormControl>
                                        <FormLabel>
                                          <HStack>
                                            <Icon as={FaInfoCircle} />
                                            <Text>Status</Text>
                                          </HStack>
                                        </FormLabel>
                                        <Select
                        name="status"
                        value={existingPatientForm.status}
                        onChange={handleExistingPatientInputChange}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rescheduled">Rescheduled</option>
                                        </Select>
                                      </FormControl>

                    {/* Notes Section */}
                                      <Box>
                                        <Heading size="sm" color="health.600" mb={4}>
                                          <HStack>
                                            <Icon as={FaNotesMedical} />
                                            <Text>Additional Notes</Text>
                                          </HStack>
                                        </Heading>
                                        <Textarea
                        name="notes"
                        value={existingPatientForm.notes}
                        onChange={handleExistingPatientInputChange}
                        placeholder="Enter any additional notes or special instructions..."
                                          rows={4}
                                        />
                                      </Box>

                                      {/* Action Buttons */}
                                      <HStack spacing={4} justify="flex-end">
                                        <Button
                    type="button"
                                          variant="outline"
                                          leftIcon={<Icon as={FaTimes} />}
                    onClick={() => navigate('/dashboard')}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                    type="submit"
                                          colorScheme="health"
                                          leftIcon={<Icon as={FaCheckDouble} />}
                                          isLoading={loading}
                                          loadingText="Processing..."
                                        >
                                          Schedule Appointment
                                        </Button>
                                      </HStack>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              </GridItem>
                            </Grid>
              </form>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>

                  {/* New Patient Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {/* Quick Info Cards */}
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <Card bg="health.50" borderColor="health.200">
                          <CardBody>
                            <Stat>
                              <HStack>
                                <Icon as={FaUserPlus} color="health.500" boxSize={6} />
                                <StatLabel color="health.700">New Patient Registration</StatLabel>
                              </HStack>
                              <StatNumber color="health.600">Register & Schedule</StatNumber>
                              <StatHelpText>Complete registration and appointment</StatHelpText>
                            </Stat>
                          </CardBody>
                        </Card>

                        <Card bg="blue.50" borderColor="blue.200">
                          <CardBody>
                            <Stat>
                              <HStack>
                                <Icon as={FaUserMd} color="blue.500" boxSize={6} />
                                <StatLabel color="blue.700">Available Doctors</StatLabel>
                              </HStack>
                              <StatNumber color="blue.600">{doctors ? doctors.length : 0}</StatNumber>
                              <StatHelpText>Doctors available for appointments</StatHelpText>
                            </Stat>
                          </CardBody>
                        </Card>

                        <Card bg="green.50" borderColor="green.200">
                          <CardBody>
                            <Stat>
                              <HStack>
                                <Icon as={FaClock} color="green.500" boxSize={6} />
                                <StatLabel color="green.700">Time Slots</StatLabel>
                              </HStack>
                              <StatNumber color="green.600">{timeSlots.length}</StatNumber>
                              <StatHelpText>Available time slots</StatHelpText>
                            </Stat>
                          </CardBody>
                        </Card>
                      </SimpleGrid>

                      {/* New Patient Registration & Appointment Form */}
                      <Card>
                        <CardHeader>
                          <Heading size="md" color="health.600">
                            <HStack>
                              <Icon as={FaUserPlus} />
                              <Text>Register New Patient & Schedule Appointment</Text>
                            </HStack>
                          </Heading>
                          <Text color="gray.600">
                            Create a new patient record and schedule their appointment
                          </Text>
                        </CardHeader>
                        <CardBody>
                          <form onSubmit={handleNewPatientSubmit}>
                            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
                              {/* Left Panel - Patient Registration */}
                              <GridItem>
                                <Card variant="outline">
                                  <CardHeader>
                                    <Heading size="sm" color="health.600">
                                      <HStack>
                                        <Icon as={FaUserPlus} />
                                        <Text>Patient Registration</Text>
                                      </HStack>
                                    </Heading>
                                  </CardHeader>
                                  <CardBody>
                                    <VStack spacing={4} align="stretch">
                                      {/* Personal Information */}
                                      <Box>
                                        <Heading size="xs" color="health.600" mb={3}>
                                          Personal Information
                                        </Heading>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                          <FormControl isRequired isInvalid={errors.firstName}>
                                            <FormLabel>
                                              <HStack>
                                                <Icon as={FaUser} />
                                                <Text>First Name</Text>
                                              </HStack>
                                            </FormLabel>
                                            <Input
                                              type="text"
                                              name="firstName"
                                              value={newPatientForm.firstName}
                                              onChange={handleNewPatientInputChange}
                                              placeholder="Enter first name"
                                            />
                                            {errors.firstName && (
                                              <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                                            )}
                                          </FormControl>

                                          <FormControl isRequired isInvalid={errors.lastName}>
                                            <FormLabel>
                                              <HStack>
                                                <Icon as={FaUser} />
                                                <Text>Last Name</Text>
                                              </HStack>
                                            </FormLabel>
                                            <Input
                                              type="text"
                                              name="lastName"
                                              value={newPatientForm.lastName}
                                              onChange={handleNewPatientInputChange}
                                              placeholder="Enter last name"
                                            />
                                            {errors.lastName && (
                                              <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                                            )}
                                          </FormControl>
                                        </SimpleGrid>
                                      </Box>

                                      {/* Contact Information */}
                                      <Box>
                                        <Heading size="xs" color="health.600" mb={3}>
                                          Contact Information
                                        </Heading>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                          <FormControl isRequired isInvalid={errors.phone}>
                                            <FormLabel>
                                              <HStack>
                                                <Icon as={FaPhoneAlt} />
                                                <Text>Phone Number</Text>
                                              </HStack>
                                            </FormLabel>
                                            <Input
                                              type="tel"
                                              name="phone"
                                              value={newPatientForm.phone}
                                              onChange={handleNewPatientInputChange}
                                              placeholder="Enter phone number"
                                            />
                                            {errors.phone && (
                                              <FormErrorMessage>{errors.phone}</FormErrorMessage>
                                            )}
                                          </FormControl>

                                          <FormControl isInvalid={errors.email}>
                                            <FormLabel>
                                              <HStack>
                                                <Icon as={FaEnvelope} />
                                                <Text>Email Address</Text>
                                              </HStack>
                                            </FormLabel>
                                            <Input
                                              type="email"
                                              name="email"
                                              value={newPatientForm.email}
                                              onChange={handleNewPatientInputChange}
                                              placeholder="Enter email address"
                                            />
                                            {errors.email && (
                                              <FormErrorMessage>{errors.email}</FormErrorMessage>
                                            )}
                                          </FormControl>
                                        </SimpleGrid>
                                      </Box>

                                      {/* Address Information */}
                                      <Box>
                                        <Heading size="xs" color="health.600" mb={3}>
                                          Address Information
                                        </Heading>
                                        <FormControl>
                                          <FormLabel>
                                            <HStack>
                                              <Icon as={FaMapMarkerAlt} />
                                              <Text>Address</Text>
                                            </HStack>
                                          </FormLabel>
                                          <Textarea
                                            name="address"
                                            value={newPatientForm.address}
                                            onChange={handleNewPatientInputChange}
                                            placeholder="Enter complete address"
                                            rows={3}
                                          />
                                        </FormControl>
                                      </Box>

                                      {/* Personal Details */}
                                      <Box>
                                        <Heading size="xs" color="health.600" mb={3}>
                                          Personal Details
                                        </Heading>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                          <FormControl>
                                            <FormLabel>
                                              <HStack>
                                                <Icon as={FaUser} />
                                                <Text>Date of Birth</Text>
                                              </HStack>
                                            </FormLabel>
                                            <Input
                                              type="date"
                                              name="dateOfBirth"
                                              value={newPatientForm.dateOfBirth}
                                              onChange={handleNewPatientInputChange}
                                            />
                                          </FormControl>

                                          <FormControl>
                                            <FormLabel>
                                              <HStack>
                                                <Icon as={FaUser} />
                                                <Text>Gender</Text>
                                              </HStack>
                                            </FormLabel>
                                            <Select
                                              name="gender"
                                              value={newPatientForm.gender}
                                              onChange={handleNewPatientInputChange}
                                              placeholder="Select gender"
                                            >
                                              <option value="male">Male</option>
                                              <option value="female">Female</option>
                                              <option value="other">Other</option>
                                            </Select>
                                          </FormControl>
                                        </SimpleGrid>
                                      </Box>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              </GridItem>

                              {/* Right Panel - Appointment Details */}
                              <GridItem>
                                <Card variant="outline">
                                  <CardHeader>
                                    <Heading size="sm" color="health.600">
                                      <HStack>
                                        <Icon as={FaCalendarDay} />
                                        <Text>Appointment Details</Text>
                                      </HStack>
                                    </Heading>
                                  </CardHeader>
                                  <CardBody>
                                    <VStack spacing={4} align="stretch">
                                      {/* Core Appointment Fields */}
                                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl isRequired isInvalid={errors.doctorId}>
                                          <FormLabel>
                                            <HStack>
                                              <Icon as={FaUserMd} />
                                              <Text>Select Doctor</Text>
                                            </HStack>
                                          </FormLabel>
                                          <Select
                                            name="doctorId"
                                            value={newPatientForm.doctorId}
                                            onChange={handleNewPatientInputChange}
                                            placeholder="Select doctor"
                                          >
                                            {doctors && doctors.length > 0 ? doctors.map(doctor => (
                                              <option key={doctor.id} value={doctor.id}>
                                                Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                                              </option>
                                            )) : (
                                              <option value="" disabled>No doctors available</option>
                                            )}
                                          </Select>
                                          {errors.doctorId && (
                                            <FormErrorMessage>{errors.doctorId}</FormErrorMessage>
                                          )}
                                        </FormControl>

                                        <FormControl isRequired isInvalid={errors.appointmentType}>
                                          <FormLabel>
                                            <HStack>
                                              <Text>{getAppointmentTypeIcon(newPatientForm.appointmentType)}</Text>
                                              <Text>Appointment Type</Text>
                                            </HStack>
                                          </FormLabel>
                                          <Select
                                            name="appointmentType"
                                            value={newPatientForm.appointmentType}
                                            onChange={handleNewPatientInputChange}
                                            placeholder="Select type"
                                          >
                                            {appointmentTypes.map(type => (
                                              <option key={type.value} value={type.value}>
                                                {type.icon} {type.label}
                                              </option>
                                            ))}
                                          </Select>
                                          {errors.appointmentType && (
                                            <FormErrorMessage>{errors.appointmentType}</FormErrorMessage>
                                          )}
                                        </FormControl>

                                        <FormControl isRequired isInvalid={errors.appointmentDate}>
                                          <FormLabel>
                                            <HStack>
                                              <Icon as={FaCalendarAlt} />
                                              <Text>Date</Text>
                                            </HStack>
                                          </FormLabel>
                                          <Input
                                            type="date"
                                            name="appointmentDate"
                                            value={newPatientForm.appointmentDate}
                                            onChange={handleNewPatientInputChange}
                                            min={new Date().toISOString().split('T')[0]}
                                          />
                                          {errors.appointmentDate && (
                                            <FormErrorMessage>{errors.appointmentDate}</FormErrorMessage>
                                          )}
                                        </FormControl>

                                        <FormControl isRequired isInvalid={errors.appointmentTime}>
                                          <FormLabel>
                                            <HStack>
                                              <Icon as={FaClock} />
                                              <Text>Time</Text>
                                            </HStack>
                                          </FormLabel>
                                          <Select
                                            name="appointmentTime"
                                            value={newPatientForm.appointmentTime}
                                            onChange={handleNewPatientInputChange}
                                            placeholder="Select time"
                                          >
                                            <option value="">Select time</option>
                                            {timeSlots.map(time => (
                                              <option key={time} value={time}>{time}</option>
                                            ))}
                                          </Select>
                                          {errors.appointmentTime && (
                                            <FormErrorMessage>{errors.appointmentTime}</FormErrorMessage>
                                          )}
                                        </FormControl>
                                      </SimpleGrid>

                                      {/* Priority and Duration Section */}
                                      <Box>
                                        <Heading size="sm" color="health.600" mb={4}>
                                          <HStack>
                                            <Icon as={FaExclamationTriangle} />
                                            <Text>Priority & Duration</Text>
                                          </HStack>
                                        </Heading>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                          <FormControl>
                                            <FormLabel>
                                              <HStack>
                                                <Icon as={FaExclamationTriangle} />
                                                <Text>Priority</Text>
                                              </HStack>
                                            </FormLabel>
                                            <Select
                                              name="priority"
                                              value={newPatientForm.priority}
                                              onChange={handleNewPatientInputChange}
                                            >
                                              {priorities.map(priority => (
                                                <option key={priority.value} value={priority.value}>
                                                  {priority.label}
                                                </option>
                                              ))}
                                            </Select>
                                          </FormControl>

                                          <FormControl>
                                            <FormLabel>
                                              <HStack>
                                                <Icon as={FaClock} />
                                                <Text>Duration</Text>
                                              </HStack>
                                            </FormLabel>
                                            <Select
                                              name="duration"
                                              value={newPatientForm.duration}
                                              onChange={handleNewPatientInputChange}
                                            >
                                              {durations.map(duration => (
                                                <option key={duration.value} value={duration.value}>
                                                  {duration.label}
                                                </option>
                                              ))}
                                            </Select>
                                          </FormControl>
                                        </SimpleGrid>
                                      </Box>

                                      {/* Status Section */}
                                      <FormControl>
                                        <FormLabel>
                                          <HStack>
                                            <Icon as={FaInfoCircle} />
                                            <Text>Status</Text>
                                          </HStack>
                                        </FormLabel>
                                        <Select
                                          name="status"
                                          value={newPatientForm.status}
                                          onChange={handleNewPatientInputChange}
                                        >
                                          <option value="scheduled">Scheduled</option>
                                          <option value="confirmed">Confirmed</option>
                                          <option value="completed">Completed</option>
                                          <option value="cancelled">Cancelled</option>
                                          <option value="rescheduled">Rescheduled</option>
                                        </Select>
                                      </FormControl>

                                      {/* Notes Section */}
                                      <Box>
                                        <Heading size="sm" color="health.600" mb={4}>
                                          <HStack>
                                            <Icon as={FaNotesMedical} />
                                            <Text>Additional Notes</Text>
                                          </HStack>
                                        </Heading>
                                        <Textarea
                                          name="notes"
                                          value={newPatientForm.notes}
                                          onChange={handleNewPatientInputChange}
                                          placeholder="Enter any additional notes or special instructions..."
                                          rows={4}
                                        />
                                      </Box>

                                      {/* Action Buttons */}
                                      <HStack spacing={4} justify="flex-end">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          leftIcon={<Icon as={FaTimes} />}
                                          onClick={() => navigate('/dashboard')}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          type="submit"
                                          colorScheme="health"
                                          leftIcon={<Icon as={FaCheckDouble} />}
                                          isLoading={loading}
                                          loadingText="Processing..."
                                        >
                                          Register Patient & Schedule
                                        </Button>
                                      </HStack>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              </GridItem>
                            </Grid>
                          </form>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default AppointmentScheduler;