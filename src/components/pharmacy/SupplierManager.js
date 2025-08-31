import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
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
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '../ChakraComponents';
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTruck,
  FaShieldAlt,
  FaStar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaBox,
  FaUser,
  FaBuilding,
  FaGlobe,
  FaFileContract,
} from 'react-icons/fa';

const SupplierManager = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [supplierData, setSupplierData] = useState([]);

  // Mock data
  const mockSuppliers = [
    {
      id: 1,
      name: 'PharmaCorp International',
      contactPerson: 'Dr. Sarah Johnson',
      phone: '+1-555-0123',
      email: 'orders@pharmacorp.com',
      website: 'www.pharmacorp.com',
      address: '123 Pharma Street, Medical District, NY 10001',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      status: 'active',
      rating: 4.8,
      totalOrders: 156,
      totalSpent: 45600.50,
      lastOrder: '2024-01-15',
      paymentTerms: 'Net 30',
      creditLimit: 50000,
      categories: ['Pain Relief', 'Antibiotics', 'Cardiovascular'],
      certifications: ['FDA Approved', 'ISO 9001', 'GMP Certified'],
      leadTime: 7,
      minimumOrder: 500,
      notes: 'Reliable supplier with excellent quality control. Fast shipping and competitive pricing.',
      contractExpiry: '2025-12-31',
      performance: 'excellent'
    },
    {
      id: 2,
      name: 'MedSupply Inc',
      contactPerson: 'Michael Chen',
      phone: '+1-555-0456',
      email: 'orders@medsupply.com',
      website: 'www.medsupply.com',
      address: '456 Medical Blvd, Healthcare City, CA 90210',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      postalCode: '90210',
      status: 'active',
      rating: 4.5,
      totalOrders: 89,
      totalSpent: 23400.75,
      lastOrder: '2024-01-10',
      paymentTerms: 'Net 45',
      creditLimit: 30000,
      categories: ['Antibiotics', 'Gastric', 'Diabetes'],
      certifications: ['FDA Approved', 'ISO 13485'],
      leadTime: 10,
      minimumOrder: 300,
      notes: 'Good supplier for specialized medications. Slightly longer lead times but good quality.',
      contractExpiry: '2024-06-30',
      performance: 'good'
    },
    {
      id: 3,
      name: 'HealthPharm Solutions',
      contactPerson: 'Dr. Robert Williams',
      phone: '+1-555-0789',
      email: 'orders@healthpharm.com',
      website: 'www.healthpharm.com',
      address: '789 Health Avenue, Pharma Park, TX 75001',
      city: 'Dallas',
      state: 'TX',
      country: 'USA',
      postalCode: '75001',
      status: 'review',
      rating: 4.2,
      totalOrders: 45,
      totalSpent: 12800.25,
      lastOrder: '2024-01-05',
      paymentTerms: 'Net 30',
      creditLimit: 20000,
      categories: ['Gastric', 'Pain Relief'],
      certifications: ['FDA Approved'],
      leadTime: 14,
      minimumOrder: 200,
      notes: 'New supplier under review. Initial orders show promise but need more evaluation.',
      contractExpiry: '2024-12-31',
      performance: 'review'
    }
  ];

  useEffect(() => {
    setSupplierData(mockSuppliers);
  }, []);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'review': return 'yellow';
      case 'suspended': return 'orange';
      default: return 'gray';
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'average': return 'yellow';
      case 'poor': return 'red';
      case 'review': return 'orange';
      default: return 'gray';
    }
  };

  const handleAddSupplier = () => {
    onOpen();
  };

  const handleEditSupplier = (supplier) => {
    // Handle edit supplier
    toast({
      title: 'Edit Supplier',
      description: `Editing supplier: ${supplier.name}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteSupplier = (supplierId) => {
    toast({
      title: 'Supplier Deleted',
      description: 'Supplier has been removed successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setSupplierData(prev => prev.filter(supplier => supplier.id !== supplierId));
  };

  const filteredSuppliers = supplierData.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const calculateTotalSuppliers = () => supplierData.length;
  const calculateActiveSuppliers = () => supplierData.filter(s => s.status === 'active').length;
  const calculateTotalSpent = () => supplierData.reduce((total, s) => total + s.totalSpent, 0);
  const calculateAverageRating = () => {
    const totalRating = supplierData.reduce((total, s) => total + s.rating, 0);
    return (totalRating / supplierData.length).toFixed(1);
  };

  return (
    <Box minH="100vh" bg={bgColor} py={6}>
      <Container maxW="7xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <VStack align="start" spacing={2}>
              <Heading size="xl" color={textColor}>Supplier Management</Heading>
              <Text color="gray.600">Manage pharmaceutical suppliers and vendor relationships</Text>
            </VStack>
            <Button
              leftIcon={<FaPlus />}
              colorScheme="blue"
              onClick={handleAddSupplier}
            >
              Add Supplier
            </Button>
          </HStack>

          {/* Stats Overview */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.600">Total Suppliers</StatLabel>
                  <StatNumber color={textColor}>{calculateTotalSuppliers()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    12% from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.600">Active Suppliers</StatLabel>
                  <StatNumber color="green.500">{calculateActiveSuppliers()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    8% from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.600">Total Spent</StatLabel>
                  <StatNumber color={textColor}>${calculateTotalSpent().toLocaleString()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    15% from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.600">Avg. Rating</StatLabel>
                  <StatNumber color="blue.500">{calculateAverageRating()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    0.2 from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Search and Filters */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <HStack spacing={4} wrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement>
                    <FaSearch color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search suppliers by name, contact person, or city..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="review">Under Review</option>
                  <option value="suspended">Suspended</option>
                </Select>

                <Button
                  leftIcon={<FaFileContract />}
                  variant="outline"
                >
                  View Contracts
                </Button>

                <Button
                  leftIcon={<FaStar />}
                  variant="outline"
                >
                  Performance Report
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Suppliers Table */}
          <Card bg={cardBg} shadow="md">
            <CardHeader>
              <Heading size="md" color={textColor}>Suppliers ({filteredSuppliers.length})</Heading>
            </CardHeader>
            <CardBody>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Supplier Details</Th>
                      <Th>Contact Info</Th>
                      <Th>Performance</Th>
                      <Th>Financial</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredSuppliers.map((supplier) => (
                      <Tr key={supplier.id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color={textColor}>{supplier.name}</Text>
                            <HStack spacing={2}>
                              <Badge colorScheme="blue" variant="subtle" size="sm">
                                {supplier.categories[0]}
                              </Badge>
                              {supplier.categories.length > 1 && (
                                <Badge colorScheme="purple" variant="subtle" size="sm">
                                  +{supplier.categories.length - 1} more
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="sm" color="gray.500">
                              {supplier.city}, {supplier.state}, {supplier.country}
                            </Text>
                          </VStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <FaUser color="gray.400" />
                              <Text fontSize="sm" color={textColor}>{supplier.contactPerson}</Text>
                            </HStack>
                            <HStack spacing={2}>
                              <FaPhone color="gray.400" />
                              <Text fontSize="sm" color={textColor}>{supplier.phone}</Text>
                            </HStack>
                            <HStack spacing={2}>
                              <FaEnvelope color="gray.400" />
                              <Text fontSize="sm" color={textColor}>{supplier.email}</Text>
                            </HStack>
                          </VStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <FaStar color="yellow.400" />
                              <Text fontWeight="bold" color={textColor}>{supplier.rating}</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.500">
                              {supplier.totalOrders} orders
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              Lead time: {supplier.leadTime} days
                            </Text>
                            <Badge colorScheme={getPerformanceColor(supplier.performance)} size="sm">
                              {supplier.performance}
                            </Badge>
                          </VStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color={textColor}>
                              ${supplier.totalSpent.toLocaleString()}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              Credit: ${supplier.creditLimit.toLocaleString()}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              Terms: {supplier.paymentTerms}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              Min Order: ${supplier.minimumOrder}
                            </Text>
                          </VStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={2}>
                            <Badge colorScheme={getStatusColor(supplier.status)}>
                              {supplier.status}
                            </Badge>
                            <Text fontSize="xs" color="gray.500">
                              Contract: {supplier.contractExpiry}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Last Order: {supplier.lastOrder}
                            </Text>
                          </VStack>
                        </Td>
                        
                        <Td>
                          <VStack spacing={2}>
                            <HStack spacing={1}>
                              <Tooltip label="View Details">
                                <IconButton
                                  size="sm"
                                  icon={<FaEye />}
                                  variant="ghost"
                                  colorScheme="blue"
                                />
                              </Tooltip>
                              <Tooltip label="Edit Supplier">
                                <IconButton
                                  size="sm"
                                  icon={<FaEdit />}
                                  variant="ghost"
                                  colorScheme="green"
                                  onClick={() => handleEditSupplier(supplier)}
                                />
                              </Tooltip>
                              <Tooltip label="Delete Supplier">
                                <IconButton
                                  size="sm"
                                  icon={<FaTrash />}
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDeleteSupplier(supplier.id)}
                                />
                              </Tooltip>
                            </HStack>
                            
                            <HStack spacing={1}>
                              <Tooltip label="View Orders">
                                <IconButton
                                  size="sm"
                                  icon={<FaBox />}
                                  variant="ghost"
                                  colorScheme="purple"
                                />
                              </Tooltip>
                              <Tooltip label="Performance History">
                                <IconButton
                                  size="sm"
                                  icon={<FaChartBar />}
                                  variant="ghost"
                                  colorScheme="teal"
                                />
                              </Tooltip>
                            </HStack>
                          </VStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Add Supplier Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Supplier</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input placeholder="Supplier Name" />
              <Input placeholder="Contact Person" />
              <SimpleGrid columns={2} spacing={4} w="full">
                <Input placeholder="Phone" />
                <Input placeholder="Email" type="email" />
              </SimpleGrid>
              <Input placeholder="Website" />
              <Textarea placeholder="Address" rows={3} />
              <SimpleGrid columns={3} spacing={4} w="full">
                <Input placeholder="City" />
                <Input placeholder="State" />
                <Input placeholder="Postal Code" />
              </SimpleGrid>
              <Select placeholder="Country">
                <option value="USA">USA</option>
                <option value="Canada">Canada</option>
                <option value="UK">UK</option>
                <option value="Germany">Germany</option>
                <option value="India">India</option>
              </Select>
              <SimpleGrid columns={2} spacing={4} w="full">
                <Input placeholder="Payment Terms" />
                <Input placeholder="Credit Limit" type="number" />
              </SimpleGrid>
              <Input placeholder="Categories (comma separated)" />
              <Input placeholder="Certifications (comma separated)" />
              <Textarea placeholder="Notes" rows={3} />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={onClose}>
              Add Supplier
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SupplierManager;
