import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Grid,
  GridItem,
  Heading,
  Text,
  Icon,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Badge,
  Flex,
  Spacer,
  IconButton,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Collapse,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  List,
  ListItem,
  ListIcon,
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
  FaHeartbeat,
  FaExclamationTriangle,
  FaUserFriends,
  FaBriefcase,
  FaSave,
  FaTimes,
  FaIdCard,
  FaFileAlt,
  FaHospital,
  FaStethoscope,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa';

const PatientForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editPatientId, setEditPatientId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    area: '',
    pinCode: '',
    medicalHistory: '',
    allergies: '',
    familyHistory: '',
    lifestyle: '',
    numberOfChildren: '',
    vitalSigns: '',
    chiefComplaint: ''
  });

  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [pinCodeSuggestions, setPinCodeSuggestions] = useState([]);
  const [showPinCodeSuggestions, setShowPinCodeSuggestions] = useState(false);
  const [isLoadingPinCode, setIsLoadingPinCode] = useState(false);
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [isLoadingArea, setIsLoadingArea] = useState(false);

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const genderOptions = ['male', 'female', 'other'];

  // Color scheme for medical theme
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const primaryColor = 'medical.500';
  const accentColor = 'medical.100';

  // Responsive grid columns
  const gridCols = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  // Comprehensive local database of Indian cities with areas and PIN codes
  const cityDatabase = {
    'Mumbai': [
      { area: 'Andheri', pinCode: '400058', district: 'Mumbai Suburban', state: 'Maharashtra' },
      { area: 'Bandra', pinCode: '400050', district: 'Mumbai Suburban', state: 'Maharashtra' },
      { area: 'Colaba', pinCode: '400001', district: 'Mumbai City', state: 'Maharashtra' },
      { area: 'Dadar', pinCode: '400014', district: 'Mumbai City', state: 'Maharashtra' },
      { area: 'Juhu', pinCode: '400049', district: 'Mumbai Suburban', state: 'Maharashtra' },
      { area: 'Worli', pinCode: '400018', district: 'Mumbai City', state: 'Maharashtra' },
      { area: 'Powai', pinCode: '400076', district: 'Mumbai Suburban', state: 'Maharashtra' },
      { area: 'Vashi', pinCode: '400703', district: 'Navi Mumbai', state: 'Maharashtra' },
      { area: 'Nerul', pinCode: '400706', district: 'Navi Mumbai', state: 'Maharashtra' },
      { area: 'Thane', pinCode: '400601', district: 'Thane', state: 'Maharashtra' }
    ],
    'Delhi': [
      { area: 'Connaught Place', pinCode: '110001', district: 'New Delhi', state: 'Delhi' },
      { area: 'Dwarka', pinCode: '110075', district: 'South West Delhi', state: 'Delhi' },
      { area: 'Lajpat Nagar', pinCode: '110024', district: 'South Delhi', state: 'Delhi' },
      { area: 'Rohini', pinCode: '110085', district: 'North West Delhi', state: 'Delhi' },
      { area: 'Saket', pinCode: '110017', district: 'South Delhi', state: 'Delhi' },
      { area: 'Pitampura', pinCode: '110034', district: 'North West Delhi', state: 'Delhi' },
      { area: 'Janakpuri', pinCode: '110058', district: 'West Delhi', state: 'Delhi' },
      { area: 'Vasant Vihar', pinCode: '110057', district: 'South Delhi', state: 'Delhi' },
      { area: 'Hauz Khas', pinCode: '110016', district: 'South Delhi', state: 'Delhi' },
      { area: 'Shahdara', pinCode: '110032', district: 'East Delhi', state: 'Delhi' }
    ],
    'Bangalore': [
      { area: 'Indiranagar', pinCode: '560038', district: 'Bangalore Urban', state: 'Karnataka' },
      { area: 'Koramangala', pinCode: '560034', district: 'Bangalore Urban', state: 'Karnataka' },
      { area: 'Whitefield', pinCode: '560066', district: 'Bangalore Urban', state: 'Karnataka' },
      { area: 'Marathahalli', pinCode: '560037', district: 'Bangalore Urban', state: 'Karnataka' },
      { area: 'Electronic City', pinCode: '560100', district: 'Bangalore Urban', state: 'Karnataka' },
      { area: 'HSR Layout', pinCode: '560102', district: 'Bangalore Urban', state: 'Karnataka' },
      { area: 'JP Nagar', pinCode: '560078', district: 'Bangalore Urban', state: 'Karnataka' },
      { area: 'Banashankari', pinCode: '560070', district: 'Bangalore Urban', state: 'Karnataka' },
      { area: 'Jayanagar', pinCode: '560011', district: 'Bangalore Urban', state: 'Karnataka' },
      { area: 'Basavanagudi', pinCode: '560004', district: 'Bangalore Urban', state: 'Karnataka' }
    ]
  };

  useEffect(() => {
    // Check if we're editing an existing patient
    if (location.state && location.state.patient) {
      setIsEditing(true);
      setEditPatientId(location.state.patient.id);
      setFormData(location.state.patient);
    }
  }, [location.state]);

  useEffect(() => {
    // Calculate age when date of birth changes
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  }, [formData.dateOfBirth]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (formData.phone && !/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const url = isEditing 
        ? `/api/patients/${editPatientId}`
        : '/api/patients';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        if (isEditing) {
          toast({
            title: 'Success!',
            description: 'Patient updated successfully!',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          navigate('/patients');
        } else {
          const patientData = await response.json();
          toast({
            title: 'Success!',
            description: 'Patient registered successfully! Redirecting to billing...',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          navigate('/billing', { 
            state: { 
              patientData: patientData,
              patientId: patientData.id 
            } 
          });
        }
      } else {
        const errorData = await response.json();
        const action = isEditing ? 'Update' : 'Registration';
        toast({
          title: 'Error!',
          description: `${action} failed: ${errorData.error || 'Unknown error'}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      const action = isEditing ? 'Update' : 'Registration';
      toast({
        title: 'Error!',
        description: `${action} failed. Please try again.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCitySearch = (city) => {
    if (cityDatabase[city]) {
      setCitySuggestions(cityDatabase[city]);
      setShowCitySuggestions(true);
    }
  };

  const handleAreaSelect = (areaData) => {
    setFormData(prev => ({
      ...prev,
      area: areaData.area,
      pinCode: areaData.pinCode
    }));
    setShowCitySuggestions(false);
  };

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="7xl">
        {/* Header with Close Button */}
        <Flex mb={6} align="center" justify="space-between">
          <Box>
            <Heading size="lg" color={textColor} display="flex" alignItems="center" gap={3}>
              <Icon as={FaUser} color={primaryColor} />
              {isEditing ? 'Edit Patient' : 'Add New Patient'}
            </Heading>
            <Text color="gray.600" mt={2}>
              {isEditing ? 'Update patient information' : 'Register a new patient in the system'}
            </Text>
          </Box>
          
          <IconButton
            icon={<FaTimes />}
            onClick={() => navigate('/dashboard')}
            aria-label="Close"
            size="lg"
            colorScheme="gray"
            variant="ghost"
            _hover={{ bg: 'gray.100' }}
          />
        </Flex>

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          <Tabs variant="enclosed" colorScheme="medical">
            <TabList>
              <Tab>
                <Icon as={FaIdCard} mr={2} />
                Personal Information
              </Tab>
              <Tab>
                <Icon as={FaMapMarkerAlt} mr={2} />
                Contact Details
              </Tab>
              <Tab>
                <Icon as={FaStethoscope} mr={2} />
                Medical Information
              </Tab>
            </TabList>

            <TabPanels>
              {/* Personal Information Tab */}
              <TabPanel>
                <Card mb={6}>
                  <CardHeader>
                    <Heading size="md" color={primaryColor}>
                      <Icon as={FaIdCard} mr={2} />
                      Personal Information
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={gridCols} spacing={6}>
                      <FormControl isInvalid={!!errors.firstName} isRequired>
                        <FormLabel>First Name</FormLabel>
                        <Input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Enter first name"
                          size="lg"
                        />
                        <FormErrorMessage>{errors.firstName}</FormErrorMessage>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Middle Name</FormLabel>
                        <Input
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
                          placeholder="Enter middle name"
                          size="lg"
                        />
                      </FormControl>

                      <FormControl isInvalid={!!errors.lastName} isRequired>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Enter last name"
                          size="lg"
                        />
                        <FormErrorMessage>{errors.lastName}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!errors.dateOfBirth} isRequired>
                        <FormLabel>Date of Birth</FormLabel>
                        <Input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          size="lg"
                        />
                        <FormErrorMessage>{errors.dateOfBirth}</FormErrorMessage>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Age</FormLabel>
                        <NumberInput value={formData.age} isReadOnly>
                          <NumberInputField placeholder="Age will be calculated" size="lg" />
                        </NumberInput>
                      </FormControl>

                      <FormControl isInvalid={!!errors.gender} isRequired>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          placeholder="Select gender"
                          size="lg"
                        >
                          {genderOptions.map(gender => (
                            <option key={gender} value={gender}>
                              {gender.charAt(0).toUpperCase() + gender.slice(1)}
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>{errors.gender}</FormErrorMessage>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Blood Group</FormLabel>
                        <Select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                          placeholder="Select blood group"
                          size="lg"
                        >
                          {bloodGroups.map(group => (
                            <option key={group} value={group}>{group}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Contact Details Tab */}
              <TabPanel>
                <Card mb={6}>
                  <CardHeader>
                    <Heading size="md" color={primaryColor}>
                      <Icon as={FaMapMarkerAlt} mr={2} />
                      Contact Details
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={gridCols} spacing={6}>
                      <FormControl isInvalid={!!errors.phone}>
                        <FormLabel>Phone Number</FormLabel>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter phone number"
                          size="lg"
                        />
                        <FormErrorMessage>{errors.phone}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!errors.email}>
                        <FormLabel>Email Address</FormLabel>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter email address"
                          size="lg"
                        />
                        <FormErrorMessage>{errors.email}</FormErrorMessage>
                      </FormControl>

                      <FormControl>
                        <FormLabel>City</FormLabel>
                        <Input
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Enter city"
                          size="lg"
                          onBlur={(e) => handleCitySearch(e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Area</FormLabel>
                        <Box position="relative">
                          <Input
                            name="area"
                            value={formData.area}
                            onChange={handleInputChange}
                            placeholder="Enter area"
                            size="lg"
                          />
                          {showCitySuggestions && (
                            <Box
                              position="absolute"
                              top="100%"
                              left={0}
                              right={0}
                              bg="white"
                              border="1px solid"
                              borderColor="gray.200"
                              borderRadius="md"
                              zIndex={10}
                              maxH="200px"
                              overflowY="auto"
                            >
                              {citySuggestions.map((item, index) => (
                                <Box
                                  key={index}
                                  p={3}
                                  cursor="pointer"
                                  _hover={{ bg: 'gray.100' }}
                                  onClick={() => handleAreaSelect(item)}
                                >
                                  <Text fontWeight="medium">{item.area}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {item.pinCode} - {item.district}, {item.state}
                                  </Text>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </FormControl>

                      <FormControl>
                        <FormLabel>PIN Code</FormLabel>
                        <Input
                          name="pinCode"
                          value={formData.pinCode}
                          onChange={handleInputChange}
                          placeholder="Enter PIN code"
                          size="lg"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Address</FormLabel>
                        <Textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Enter complete address"
                          size="lg"
                          rows={3}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Medical Information Tab */}
              <TabPanel>
                <Card mb={6}>
                  <CardHeader>
                    <Heading size="md" color={primaryColor}>
                      <Icon as={FaStethoscope} mr={2} />
                      Medical Information
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={gridCols} spacing={6}>
                      <FormControl>
                        <FormLabel>Chief Complaint</FormLabel>
                        <Textarea
                          name="chiefComplaint"
                          value={formData.chiefComplaint}
                          onChange={handleInputChange}
                          placeholder="Enter chief complaint"
                          size="lg"
                          rows={3}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Medical History</FormLabel>
                        <Textarea
                          name="medicalHistory"
                          value={formData.medicalHistory}
                          onChange={handleInputChange}
                          placeholder="Enter medical history"
                          size="lg"
                          rows={3}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Allergies</FormLabel>
                        <Textarea
                          name="allergies"
                          value={formData.allergies}
                          onChange={handleInputChange}
                          placeholder="Enter allergies (if any)"
                          size="lg"
                          rows={3}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Family History</FormLabel>
                        <Textarea
                          name="familyHistory"
                          value={formData.familyHistory}
                          onChange={handleInputChange}
                          placeholder="Enter family history"
                          size="lg"
                          rows={3}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Lifestyle</FormLabel>
                        <Textarea
                          name="lifestyle"
                          value={formData.lifestyle}
                          onChange={handleInputChange}
                          placeholder="Enter lifestyle information"
                          size="lg"
                          rows={3}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Number of Children</FormLabel>
                        <NumberInput
                          name="numberOfChildren"
                          value={formData.numberOfChildren}
                          onChange={(value) => setFormData(prev => ({ ...prev, numberOfChildren: value }))}
                          min={0}
                        >
                          <NumberInputField placeholder="Enter number of children" size="lg" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Vital Signs</FormLabel>
                        <Textarea
                          name="vitalSigns"
                          value={formData.vitalSigns}
                          onChange={handleInputChange}
                          placeholder="Enter vital signs"
                          size="lg"
                          rows={3}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Submit Button */}
          <Flex justify="center" mt={8}>
            <Button
              type="submit"
              size="lg"
              colorScheme="medical"
              isLoading={loading}
              loadingText={isEditing ? "Updating..." : "Saving..."}
              leftIcon={<FaSave />}
              px={12}
              py={6}
              fontSize="lg"
            >
              {isEditing ? 'Update Patient' : 'Save Patient'}
            </Button>
          </Flex>
        </form>
      </Container>
    </Box>
  );
};

export default PatientForm;
