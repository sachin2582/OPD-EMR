import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Card,
  CardBody,
  CardHeader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  IconButton,
  Tooltip,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  useDisclosure,
  Alert,
  AlertIcon,
  Icon,
  Spinner
} from '@chakra-ui/react';
import { FaPlus, FaEdit, FaTrash, FaUserMd, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../config/api';

const AdminPanel = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    specialization: '',
    is_active: true
  });

  // Fetch doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await api.get('/api/auth/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch doctors",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      specialization: '',
      is_active: true
    });
    onOpen();
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      username: doctor.username,
      password: '', // Don't pre-fill password
      specialization: doctor.specialization || '',
      is_active: doctor.is_active
    });
    onOpen();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (editingDoctor) {
        // Update existing doctor
        const updateData = {
          name: formData.name,
          username: formData.username,
          specialization: formData.specialization,
          is_active: formData.is_active
        };
        
        // Only include password if provided
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await api.put(`/api/auth/doctors/${editingDoctor.doctor_id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast({
          title: "Success",
          description: "Doctor updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new doctor
        await api.post('/api/auth/register', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast({
          title: "Success",
          description: "Doctor created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      onClose();
      fetchDoctors();
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save doctor",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to deactivate this doctor?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      await api.delete(`/api/auth/doctors/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: "Success",
        description: "Doctor deactivated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate doctor",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'doctor': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'green' : 'red';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="health.500" />
          <Text>Loading doctors...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={2}>
            <Heading size="lg" color="health.600">
              <HStack>
                <Icon as={FaShieldAlt} />
                <Text>Admin Panel</Text>
              </HStack>
            </Heading>
            <Text color="gray.600">
              Manage doctors and system access
            </Text>
          </VStack>
          <Button
            colorScheme="health"
            leftIcon={<Icon as={FaPlus} />}
            onClick={handleAddDoctor}
          >
            Add Doctor
          </Button>
        </HStack>

        {/* Doctors Table */}
        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FaUserMd} color="health.500" />
              <Heading size="md">Doctors Management</Heading>
              <Badge colorScheme="health" variant="subtle">
                {doctors.length} doctors
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Username</Th>
                    <Th>Specialization</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {doctors.map((doctor) => (
                    <Tr key={doctor.doctor_id}>
                      <Td fontWeight="semibold">{doctor.name}</Td>
                      <Td>{doctor.username}</Td>
                      <Td>{doctor.specialization || 'N/A'}</Td>
                      <Td>
                        <Badge colorScheme={getRoleColor(doctor.role)} variant="subtle">
                          {doctor.role}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(doctor.is_active)} variant="subtle">
                          {doctor.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </Td>
                      <Td>{new Date(doctor.created_at).toLocaleDateString()}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="Edit Doctor">
                            <IconButton
                              icon={<FaEdit />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => handleEditDoctor(doctor)}
                            />
                          </Tooltip>
                          {doctor.role !== 'admin' && (
                            <Tooltip label="Deactivate Doctor">
                              <IconButton
                                icon={<FaTrash />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteDoctor(doctor.doctor_id)}
                              />
                            </Tooltip>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Add/Edit Doctor Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <form onSubmit={handleSubmit}>
              <ModalHeader>
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter doctor's full name"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Username</FormLabel>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                    />
                  </FormControl>

                  <FormControl isRequired={!editingDoctor}>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder={editingDoctor ? "Leave blank to keep current password" : "Enter password"}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Specialization</FormLabel>
                    <Input
                      value={formData.specialization}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                      placeholder="Enter specialization (optional)"
                    />
                  </FormControl>

                  <FormControl>
                    <HStack>
                      <Switch
                        isChecked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      />
                      <FormLabel mb={0}>Active</FormLabel>
                    </HStack>
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="health" type="submit">
                  {editingDoctor ? 'Update' : 'Create'}
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default AdminPanel;
