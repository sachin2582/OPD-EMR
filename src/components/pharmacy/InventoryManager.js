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
  SimpleGrid,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Progress,
} from '../ChakraComponents';
import {
  FaBarcode,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaDownload,
  FaSync,
} from 'react-icons/fa';

const InventoryManager = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [inventoryData, setInventoryData] = useState([]);

  // Mock data
  const mockInventory = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      stock: 150,
      minStock: 50,
      price: 2.50,
      supplier: 'PharmaCorp',
      barcode: '1234567890123',
      location: 'Shelf A1',
      status: 'active',
      expiryDate: '2024-12-31'
    },
    {
      id: 2,
      name: 'Amoxicillin 250mg',
      category: 'Antibiotics',
      stock: 75,
      minStock: 30,
      price: 8.75,
      supplier: 'MedSupply Inc',
      barcode: '9876543210987',
      location: 'Shelf B2',
      status: 'active',
      expiryDate: '2024-06-30'
    }
  ];

  useEffect(() => {
    setInventoryData(mockInventory);
  }, []);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  const getStockStatus = (stock, minStock) => {
    if (stock <= minStock) return 'low-stock';
    if (stock <= minStock * 1.5) return 'medium-stock';
    return 'good-stock';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'low-stock': return 'orange';
      case 'expired': return 'red';
      default: return 'blue';
    }
  };

  const handleScanBarcode = () => {
    toast({
      title: 'Barcode Scanner',
      description: 'Barcode scanner activated.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleAddItem = () => {
    onOpen();
  };

  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box minH="100vh" bg={bgColor} py={6}>
      <Container maxW="7xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <VStack align="start" spacing={2}>
              <Heading size="xl" color={textColor}>Inventory Management</Heading>
              <Text color="gray.600">Advanced inventory tracking with barcode scanning</Text>
            </VStack>
            <HStack spacing={3}>
              <Button
                leftIcon={<FaBarcode />}
                colorScheme="blue"
                variant="outline"
                onClick={handleScanBarcode}
              >
                Scan Barcode
              </Button>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="blue"
                onClick={handleAddItem}
              >
                Add Item
              </Button>
            </HStack>
          </HStack>

          {/* Search and Filters */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <HStack spacing={4} wrap="wrap">
                <InputGroup maxW="300px">
                  <InputLeftElement>
                    <FaSearch color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  maxW="200px"
                >
                  <option value="all">All Categories</option>
                  <option value="Pain Relief">Pain Relief</option>
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Gastric">Gastric</option>
                </Select>

                <Button
                  leftIcon={<FaDownload />}
                  variant="outline"
                >
                  Export Data
                </Button>

                <Button
                  leftIcon={<FaSync />}
                  variant="ghost"
                >
                  Refresh
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Inventory Table */}
          <Card bg={cardBg} shadow="md">
            <CardHeader>
              <Heading size="md" color={textColor}>Inventory Items ({filteredInventory.length})</Heading>
            </CardHeader>
            <CardBody>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Item Name</Th>
                      <Th>Category</Th>
                      <Th>Stock</Th>
                      <Th>Price</Th>
                      <Th>Supplier</Th>
                      <Th>Location</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredInventory.map((item) => {
                      const stockStatus = getStockStatus(item.stock, item.minStock);
                      
                      return (
                        <Tr key={item.id}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold" color={textColor}>{item.name}</Text>
                              <Text fontSize="sm" color="gray.500">Barcode: {item.barcode}</Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge colorScheme="blue" variant="subtle">
                              {item.category}
                            </Badge>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text color={textColor}>{item.stock}</Text>
                              <Progress
                                size="sm"
                                value={(item.stock / (item.minStock * 2)) * 100}
                                colorScheme={stockStatus === 'low-stock' ? 'red' : stockStatus === 'medium-stock' ? 'orange' : 'green'}
                                borderRadius="full"
                                w="100px"
                              />
                            </VStack>
                          </Td>
                          <Td>
                            <Text color={textColor}>${item.price}</Text>
                          </Td>
                          <Td>
                            <Text color={textColor}>{item.supplier}</Text>
                          </Td>
                          <Td>
                            <Text color={textColor}>{item.location}</Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Tooltip label="View Details">
                                <IconButton
                                  size="sm"
                                  icon={<FaEye />}
                                  variant="ghost"
                                  colorScheme="blue"
                                />
                              </Tooltip>
                              <Tooltip label="Edit Item">
                                <IconButton
                                  size="sm"
                                  icon={<FaEdit />}
                                  variant="ghost"
                                  colorScheme="green"
                                />
                              </Tooltip>
                              <Tooltip label="Delete Item">
                                <IconButton
                                  size="sm"
                                  icon={<FaTrash />}
                                  variant="ghost"
                                  colorScheme="red"
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Add Item Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Inventory Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input placeholder="Item Name" />
              <Select placeholder="Category">
                <option value="Pain Relief">Pain Relief</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Gastric">Gastric</option>
              </Select>
              <Input placeholder="Stock Quantity" type="number" />
              <Input placeholder="Price" type="number" step="0.01" />
              <Input placeholder="Supplier" />
              <Input placeholder="Barcode" />
              <Input placeholder="Location" />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={onClose}>
              Add Item
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default InventoryManager;
