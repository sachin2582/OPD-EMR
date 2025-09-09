import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Badge,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { FaPlus, FaEdit, FaTrash, FaUserMd } from 'react-icons/fa';
import api from '../config/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'doctor',
    fullName: '',
    email: '',
    phone: '',
    department: '',
    specialization: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchDoctors();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/api/doctors');
      if (response.data.success) {
        setDoctors(response.data.doctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (isEditing) {
        // Update user
        await api.put(`/users/${selectedUser.id}`, formData);
        toast({
          title: 'Success',
          description: 'User updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create user
        if (formData.role === 'doctor') {
          // For doctors, use the doctors API which handles user creation automatically
          await api.post('/doctors', {
            name: formData.fullName,
            specialization: formData.specialization,
            contactNumber: formData.phone,
            email: formData.email,
            username: formData.username,
            password: formData.password
          });
        } else {
          await api.post('/users', formData);
        }
        toast({
          title: 'Success',
          description: 'User created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      fetchUsers();
      fetchDoctors();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save user',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
    setFormData({
      username: user.username || '',
      password: '',
      role: user.role || 'doctor',
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      department: user.department || '',
      specialization: user.specialization || ''
    });
    onOpen();
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        toast({
          title: 'Success',
          description: 'User deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchUsers();
        fetchDoctors();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete user',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setFormData({
      username: '',
      password: '',
      role: 'doctor',
      fullName: '',
      email: '',
      phone: '',
      department: '',
      specialization: ''
    });
    onClose();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'doctor': return 'blue';
      case 'staff': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">
            User Management
          </Text>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="blue"
            onClick={() => {
              setIsEditing(false);
              onOpen();
            }}
          >
            Add User
          </Button>
        </HStack>

        <Alert status="info">
          <AlertIcon />
          <Text>
            <strong>Default Credentials:</strong><br />
            Admin: admin / admin123<br />
            Doctor: drjohn / doctor123
          </Text>
        </Alert>

        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Users ({users.length})
          </Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Username</Th>
                <Th>Name</Th>
                <Th>Role</Th>
                <Th>Email</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td>{user.username}</Td>
                  <Td>{user.fullName}</Td>
                  <Td>
                    <Badge colorScheme={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </Td>
                  <Td>{user.email || '-'}</Td>
                  <Td>
                    <Badge colorScheme={user.isActive ? 'green' : 'red'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<FaEdit />}
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleEdit(user)}
                      />
                      <IconButton
                        icon={<FaTrash />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(user.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Doctors ({doctors.length})
          </Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Specialization</Th>
                <Th>Username</Th>
                <Th>Email</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {doctors.map((doctor) => (
                <Tr key={doctor.id}>
                  <Td>
                    <HStack>
                      <FaUserMd />
                      <Text>{doctor.name}</Text>
                    </HStack>
                  </Td>
                  <Td>{doctor.specialization || '-'}</Td>
                  <Td>{doctor.username || '-'}</Td>
                  <Td>{doctor.email || doctor.userEmail || '-'}</Td>
                  <Td>
                    <Badge colorScheme={doctor.isActive ? 'green' : 'red'}>
                      {doctor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {/* Add/Edit User Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit User' : 'Add New User'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="staff">Staff</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Department</FormLabel>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter department"
                  />
                </FormControl>

                {formData.role === 'doctor' && (
                  <FormControl>
                    <FormLabel>Specialization</FormLabel>
                    <Input
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="Enter specialization"
                    />
                  </FormControl>
                )}

                <HStack spacing={4} w="full">
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={loading}
                    loadingText="Saving..."
                    flex={1}
                  >
                    {isEditing ? 'Update' : 'Create'} User
                  </Button>
                  <Button onClick={handleCloseModal} flex={1}>
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserManagement;
