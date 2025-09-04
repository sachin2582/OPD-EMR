import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  HStack,
  VStack,
  Flex,
  Spacer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, EditIcon, DeleteIcon, CloseIcon } from '@chakra-ui/icons';
import api from '../config/api';

const DoctorsManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [stats, setStats] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  
  // Chakra UI hooks
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Form state for adding/editing doctors
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    contactNumber: '',
    email: '',
    qualification: '',
    experienceYears: '',
    availability: 'Mon-Fri 9AM-5PM'
  });

  // Load doctors on component mount
  useEffect(() => {
    loadDoctors();
    loadSpecializations();
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load doctors with search and filter
  const loadDoctors = async () => {
    try {
      setLoading(true);
      let url = '/api/doctors';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSpecialization) params.append('specialization', selectedSpecialization);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await api.get(url);
      setDoctors(response.data.doctors);
      setError(null);
    } catch (err) {
      setError('Failed to load doctors: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Load specializations for dropdown
  const loadSpecializations = async () => {
    try {
      const response = await api.get('/api/doctors/specializations/list');
      setSpecializations(response.data.specializations);
    } catch (err) {
      console.error('Failed to load specializations:', err);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await api.get('/api/doctors/stats/overview');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new doctor
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const doctorData = {
        ...formData,
        experienceYears: parseInt(formData.experienceYears) || null
      };
      
      const response = await api.post('/api/doctors', doctorData);
      setDoctors(prev => [...prev, response.data.doctor]);
      onClose();
      resetForm();
      loadStats(); // Refresh stats
      toast({
        title: 'Doctor Added Successfully',
        description: `${response.data.doctor.name} has been added to the system.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError('Failed to add doctor: ' + (err.response?.data?.error || err.message));
    }
  };

  // Update doctor
  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        ...formData,
        experienceYears: parseInt(formData.experienceYears) || null
      };
      
      const response = await api.put(`/api/doctors/${editingDoctor.id}`, updateData);
      setDoctors(prev => prev.map(doctor => 
        doctor.id === editingDoctor.id ? response.data.doctor : doctor
      ));
      setEditingDoctor(null);
      onClose();
      resetForm();
      toast({
        title: 'Doctor Updated Successfully',
        description: `${response.data.doctor.name}'s information has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError('Failed to update doctor: ' + (err.response?.data?.error || err.message));
    }
  };

  // Delete doctor
  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) {
      return;
    }
    
    try {
      await api.delete(`/api/doctors/${doctorId}`);
      setDoctors(prev => prev.filter(doctor => doctor.id !== doctorId));
      loadStats(); // Refresh stats
      toast({
        title: 'Doctor Deleted Successfully',
        description: 'The doctor has been removed from the system.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError('Failed to delete doctor: ' + (err.response?.data?.error || err.message));
    }
  };

  // Edit doctor
  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      contactNumber: doctor.phone,
      email: doctor.email || '',
      qualification: doctor.qualification || '',
      experienceYears: doctor.experienceYears || '',
      availability: doctor.availability || 'Mon-Fri 9AM-5PM'
    });
    onOpen();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      specialization: '',
      contactNumber: '',
      email: '',
      qualification: '',
      experienceYears: '',
      availability: 'Mon-Fri 9AM-5PM'
    });
    setEditingDoctor(null);
  };

  // Handle search
  const handleSearch = () => {
    loadDoctors();
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSelectedSpecialization('');
    loadDoctors();
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Flex justify="center" align="center" h="200px">
          <Text fontSize="lg">Loading doctors...</Text>
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color="blue.600">
          🏥 Doctors Management
        </Heading>
      
        {/* Statistics Cards */}
        {stats && (
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
            <GridItem>
              <Card bg="gradient-to-r" bgGradient="linear(to-r, blue.400, blue.600)" color="white">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel fontSize="lg" color="whiteAlpha.800">Total Doctors</StatLabel>
                    <StatNumber fontSize="3xl">{stats.total}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card bg="gradient-to-r" bgGradient="linear(to-r, green.400, green.600)" color="white">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel fontSize="lg" color="whiteAlpha.800">Active Doctors</StatLabel>
                    <StatNumber fontSize="3xl">{stats.active}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card bg="gradient-to-r" bgGradient="linear(to-r, purple.400, purple.600)" color="white">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel fontSize="lg" color="whiteAlpha.800">Specializations</StatLabel>
                    <StatNumber fontSize="3xl">{stats.totalSpecializations}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        )}

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <Heading size="md" color="gray.700">
              🔍 Search & Filter Doctors
            </Heading>
          </CardHeader>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <Input
                placeholder="Search by name, specialization, or qualification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                flex="1"
                minW="300px"
              />
              <Select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                placeholder="All Specializations"
                w="200px"
              >
                {specializations.map(spec => (
                  <option key={spec.name} value={spec.name}>
                    {spec.name} ({spec.count})
                  </option>
                ))}
              </Select>
              <Button
                leftIcon={<SearchIcon />}
                colorScheme="blue"
                onClick={handleSearch}
                minW="100px"
              >
                Search
              </Button>
              <Button
                leftIcon={<CloseIcon />}
                variant="outline"
                onClick={clearSearch}
                minW="100px"
              >
                Clear
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Add/Edit Doctor Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
            </ModalHeader>
            <ModalCloseButton />
            <form onSubmit={editingDoctor ? handleUpdateDoctor : handleAddDoctor}>
              <ModalBody>
                <VStack spacing={4}>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="full">
                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel>Name</FormLabel>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Doctor's full name"
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel>Specialization</FormLabel>
                        <Input
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          placeholder="e.g., Cardiology, Neurology"
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>
                  
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="full">
                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel>Contact Number</FormLabel>
                        <Input
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleInputChange}
                          placeholder="10 digits"
                          type="tel"
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          type="email"
                          placeholder="doctor@example.com"
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>
                  
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} w="full">
                    <GridItem>
                      <FormControl>
                        <FormLabel>Qualification</FormLabel>
                        <Input
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleInputChange}
                          placeholder="e.g., MBBS, MD"
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Experience (Years)</FormLabel>
                        <Input
                          name="experienceYears"
                          value={formData.experienceYears}
                          onChange={handleInputChange}
                          type="number"
                          min="0"
                          placeholder="Years of experience"
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>
                  
                  <FormControl>
                    <FormLabel>Availability</FormLabel>
                    <Textarea
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      placeholder="e.g., Mon-Fri 9AM-5PM"
                      rows={3}
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={() => { onClose(); resetForm(); }}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  colorScheme="blue"
                  leftIcon={editingDoctor ? <EditIcon /> : <AddIcon />}
                >
                  {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Action Buttons */}
        <Flex justify="center">
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            size="lg"
            onClick={() => {
              setEditingDoctor(null);
              resetForm();
              onOpen();
            }}
          >
            Add New Doctor
          </Button>
        </Flex>

        {/* Error Message */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Doctors List */}
        <Box>
          <Heading size="lg" mb={6} color="gray.700">
            Doctors ({doctors.length})
          </Heading>
          {doctors.length === 0 ? (
            <Card>
              <CardBody textAlign="center" py={12}>
                <Text fontSize="lg" color="gray.500">
                  No doctors found. Add your first doctor to get started!
                </Text>
              </CardBody>
            </Card>
          ) : (
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
              {doctors.map(doctor => (
                <GridItem key={doctor.id}>
                  <Card 
                    variant="outline" 
                    _hover={{ 
                      transform: "translateY(-2px)", 
                      boxShadow: "lg",
                      transition: "all 0.2s"
                    }}
                  >
                    <CardHeader pb={2}>
                      <Flex justify="space-between" align="center">
                        <Heading size="md" color="blue.600">
                          {doctor.name}
                        </Heading>
                        <Badge 
                          colorScheme={doctor.isActive ? "green" : "red"}
                          variant="solid"
                        >
                          {doctor.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Flex>
                    </CardHeader>
                    
                    <CardBody pt={0}>
                      <VStack spacing={2} align="stretch">
                        <Text><Text as="span" fontWeight="bold">Specialization:</Text> {doctor.specialization}</Text>
                        <Text><Text as="span" fontWeight="bold">Qualification:</Text> {doctor.qualification || 'Not specified'}</Text>
                        <Text><Text as="span" fontWeight="bold">Experience:</Text> {doctor.experienceYears || 0} years</Text>
                        <Text><Text as="span" fontWeight="bold">Phone:</Text> {doctor.phone}</Text>
                        <Text><Text as="span" fontWeight="bold">Email:</Text> {doctor.email || 'Not specified'}</Text>
                        <Text><Text as="span" fontWeight="bold">Availability:</Text> {doctor.availability}</Text>
                      </VStack>
                    </CardBody>
                    
                    <CardFooter pt={0}>
                      <HStack spacing={2} w="full">
                        <Tooltip label="Edit Doctor">
                          <IconButton
                            icon={<EditIcon />}
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => handleEditDoctor(doctor)}
                            flex="1"
                          />
                        </Tooltip>
                        <Tooltip label="Delete Doctor">
                          <IconButton
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            variant="outline"
                            onClick={() => handleDeleteDoctor(doctor.id)}
                            flex="1"
                          />
                        </Tooltip>
                      </HStack>
                    </CardFooter>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default DoctorsManagement;
