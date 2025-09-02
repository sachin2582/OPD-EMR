import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardBody,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow
} from '@chakra-ui/react';
import { FaHospital, FaSave, FaEdit, FaPhone, FaEnvelope, FaGlobe, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';

const ClinicSetup = () => {
  const [clinicData, setClinicData] = useState({
    clinicName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    license: '',
    registration: '',
    prescriptionValidity: 30
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  // Fetch clinic data on component mount
  useEffect(() => {
    fetchClinicData();
  }, []);

  const fetchClinicData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/clinic');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setClinicData(data.data);
        }
      } else {
        console.error('Failed to fetch clinic data');
      }
    } catch (error) {
      console.error('Error fetching clinic data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load clinic data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!clinicData.clinicName.trim()) {
      newErrors.clinicName = 'Clinic name is required';
    }
    if (!clinicData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!clinicData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!clinicData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!clinicData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    }
    if (!clinicData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (clinicData.email && !/\S+@\S+\.\S+/.test(clinicData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (clinicData.website && !/^https?:\/\/.+/.test(clinicData.website)) {
      newErrors.website = 'Please enter a valid website URL (include http:// or https://)';
    }
    if (clinicData.prescriptionValidity < 1 || clinicData.prescriptionValidity > 365) {
      newErrors.prescriptionValidity = 'Prescription validity must be between 1 and 365 days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('http://localhost:3001/api/clinic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clinicData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({
            title: 'Success',
            description: 'Clinic setup saved successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          throw new Error(data.message || 'Failed to save clinic setup');
        }
      } else {
        throw new Error('Failed to save clinic setup');
      }
    } catch (error) {
      console.error('Error saving clinic setup:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save clinic setup',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setClinicData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50" p={6}>
        <Container maxW="4xl">
          <VStack spacing={6} align="stretch">
            <Text>Loading clinic setup...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" p={6}>
      <Container maxW="4xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Card>
            <CardHeader>
              <HStack spacing={4}>
                <Icon as={FaHospital} boxSize={8} color="health.600" />
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color="health.600">
                    Clinic Setup
                  </Heading>
                  <Text color="gray.600">
                    Configure your clinic information for prescriptions and documents
                  </Text>
                </VStack>
              </HStack>
            </CardHeader>
          </Card>

          {/* Information Alert */}
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Important!</AlertTitle>
              <AlertDescription>
                This information will be used in all prescription prints and official documents. 
                Make sure all details are accurate and up-to-date.
              </AlertDescription>
            </Box>
          </Alert>

          {/* Clinic Information Form */}
          <Card>
            <CardHeader>
              <Heading size="md" color="health.600">
                <HStack>
                  <Icon as={FaHospital} />
                  <Text>Clinic Information</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired isInvalid={errors.clinicName}>
                    <FormLabel>Clinic Name</FormLabel>
                    <Input
                      value={clinicData.clinicName}
                      onChange={(e) => handleInputChange('clinicName', e.target.value)}
                      placeholder="Enter clinic name"
                    />
                    <FormErrorMessage>{errors.clinicName}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={errors.phone}>
                    <FormLabel>
                      <HStack>
                        <Icon as={FaPhone} />
                        <Text>Phone Number</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      value={clinicData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                    <FormErrorMessage>{errors.phone}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                {/* Address Information */}
                <FormControl isRequired isInvalid={errors.address}>
                  <FormLabel>
                    <HStack>
                      <Icon as={FaMapMarkerAlt} />
                      <Text>Address</Text>
                    </HStack>
                  </FormLabel>
                  <Textarea
                    value={clinicData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                  <FormErrorMessage>{errors.address}</FormErrorMessage>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <FormControl isRequired isInvalid={errors.city}>
                    <FormLabel>City</FormLabel>
                    <Input
                      value={clinicData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                    />
                    <FormErrorMessage>{errors.city}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={errors.state}>
                    <FormLabel>State</FormLabel>
                    <Input
                      value={clinicData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state"
                    />
                    <FormErrorMessage>{errors.state}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={errors.pincode}>
                    <FormLabel>Pincode</FormLabel>
                    <Input
                      value={clinicData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      placeholder="Enter pincode"
                    />
                    <FormErrorMessage>{errors.pincode}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                <Divider />

                {/* Contact Information */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isInvalid={errors.email}>
                    <FormLabel>
                      <HStack>
                        <Icon as={FaEnvelope} />
                        <Text>Email Address</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      type="email"
                      value={clinicData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                    />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.website}>
                    <FormLabel>
                      <HStack>
                        <Icon as={FaGlobe} />
                        <Text>Website</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      value={clinicData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.yourclinic.com"
                    />
                    <FormErrorMessage>{errors.website}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                <Divider />

                {/* License and Registration */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>
                      <HStack>
                        <Icon as={FaIdCard} />
                        <Text>License Number</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      value={clinicData.license}
                      onChange={(e) => handleInputChange('license', e.target.value)}
                      placeholder="Enter license number"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Registration Number</FormLabel>
                    <Input
                      value={clinicData.registration}
                      onChange={(e) => handleInputChange('registration', e.target.value)}
                      placeholder="Enter registration number"
                    />
                  </FormControl>
                </SimpleGrid>

                <Divider />

                {/* Prescription Settings */}
                <FormControl isInvalid={errors.prescriptionValidity}>
                  <FormLabel>Prescription Validity (Days)</FormLabel>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={clinicData.prescriptionValidity}
                    onChange={(e) => handleInputChange('prescriptionValidity', parseInt(e.target.value) || 30)}
                    placeholder="30"
                  />
                  <FormErrorMessage>{errors.prescriptionValidity}</FormErrorMessage>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Save Button */}
          <Card>
            <CardBody>
              <HStack justify="center">
                <Button
                  leftIcon={<Icon as={FaSave} />}
                  colorScheme="health"
                  size="lg"
                  onClick={handleSave}
                  isLoading={saving}
                  loadingText="Saving..."
                  px={12}
                >
                  Save Clinic Setup
                </Button>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default ClinicSetup;
