import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Icon,
  Button,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Spacer,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Tooltip,
  Switch,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '../ChakraComponents';
import {
  FaPills,
  FaBoxes,
  FaExclamationTriangle,
  FaChartLine,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaBarcode,
  FaQrcode,
  FaDownload,
  FaUpload,
  FaSync,
  FaBell,
  FaCog,
  FaUserMd,
  FaHospital,
  FaShieldAlt,
  FaClock,
  FaCalendarAlt,
  FaDollarSign,
  FaPercentage,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
} from 'react-icons/fa';

import AddEditItemForm from './forms/AddEditItemForm';
import AddSupplierForm from './forms/AddSupplierForm';
import StockAdjustmentForm from './forms/StockAdjustmentForm';

const PharmacyDashboard = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showStockAdjustmentModal, setShowStockAdjustmentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Enhanced mock data for demonstration
  const mockInventory = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      stock: 150,
      minStock: 50,
      expiryDate: '2024-12-31',
      price: 2.50,
      costPrice: 1.80,
      supplier: 'PharmaCorp',
      barcode: '1234567890123',
      location: 'Shelf A1',
      status: 'active',
      lastUpdated: '2024-01-15',
      salesThisMonth: 45,
      profitMargin: 35,
      reorderPoint: 60,
      maxStock: 200,
      unit: 'Tablets',
      prescription: false,
      taxRate: 5.0
    },
    {
      id: 2,
      name: 'Amoxicillin 250mg',
      category: 'Antibiotics',
      stock: 75,
      minStock: 30,
      expiryDate: '2024-06-30',
      price: 8.75,
      costPrice: 6.20,
      supplier: 'MedSupply Inc',
      barcode: '9876543210987',
      location: 'Shelf B2',
      status: 'active',
      lastUpdated: '2024-01-14',
      salesThisMonth: 28,
      profitMargin: 42,
      reorderPoint: 40,
      maxStock: 120,
      unit: 'Capsules',
      prescription: true,
      taxRate: 0.0
    },
    {
      id: 3,
      name: 'Omeprazole 20mg',
      category: 'Gastric',
      stock: 25,
      minStock: 40,
      expiryDate: '2024-08-15',
      price: 12.50,
      costPrice: 9.10,
      supplier: 'HealthPharm',
      barcode: '4567891230456',
      location: 'Shelf C3',
      status: 'low-stock',
      lastUpdated: '2024-01-13',
      salesThisMonth: 32,
      profitMargin: 38,
      reorderPoint: 50,
      maxStock: 100,
      unit: 'Tablets',
      prescription: false,
      taxRate: 5.0
    }
  ];

  const mockSuppliers = [
    {
      id: 1,
      name: 'PharmaCorp',
      contactPerson: 'John Smith',
      email: 'john@pharmacorp.com',
      phone: '+1-555-0123',
      address: '123 Pharma St, Medical City, MC 12345',
      rating: 4.5,
      paymentTerms: 'Net 30',
      creditLimit: 50000,
      status: 'active'
    },
    {
      id: 2,
      name: 'MedSupply Inc',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@medsupply.com',
      phone: '+1-555-0456',
      address: '456 Medical Ave, Health Town, HT 67890',
      rating: 4.8,
      paymentTerms: 'Net 45',
      creditLimit: 75000,
      status: 'active'
    }
  ];

  useEffect(() => {
    setInventoryData(mockInventory);
  }, []);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');

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
      case 'discontinued': return 'gray';
      default: return 'blue';
    }
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'red', text: 'Expired' };
    if (daysUntilExpiry <= 30) return { status: 'expiring-soon', color: 'orange', text: `${daysUntilExpiry} days` };
    if (daysUntilExpiry <= 90) return { status: 'expiring-soon', color: 'yellow', text: `${daysUntilExpiry} days` };
    return { status: 'good', color: 'green', text: `${daysUntilExpiry} days` };
  };

  // Enhanced functions for item management
  const handleAddItem = (itemData) => {
    const newItem = {
      id: Date.now(),
      ...itemData,
      stock: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      salesThisMonth: 0,
      status: 'active'
    };
    setInventoryData([...inventoryData, newItem]);
    setShowAddItemModal(false);
    toast({
      title: 'Item Added',
      description: `${itemData.name} has been added to inventory`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleAddSupplier = (supplierData) => {
    const newSupplier = {
      id: Date.now(),
      ...supplierData,
      rating: 0,
      status: 'active'
    };
    setShowAddSupplierModal(false);
    toast({
      title: 'Supplier Added',
      description: `${supplierData.name} has been added`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleStockAdjustment = (itemId, adjustment, reason) => {
    setInventoryData(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = Math.max(0, item.stock + adjustment);
        return {
          ...item,
          stock: newStock,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
    setShowStockAdjustmentModal(false);
    setSelectedItem(null);
    toast({
      title: 'Stock Adjusted',
      description: `Stock updated for ${inventoryData.find(i => i.id === itemId)?.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowAddItemModal(true);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventoryData(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: 'Item Deleted',
        description: 'Item has been removed from inventory',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Additional utility functions
  const calculateTotalValue = () => {
    return inventoryData.reduce((total, item) => total + (item.stock * item.price), 0);
  };

  const calculateLowStockItems = () => {
    return inventoryData.filter(item => item.stock <= item.minStock).length;
  };

  const calculateExpiringItems = () => {
    const today = new Date();
    const ninetyDaysFromNow = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000));
    return inventoryData.filter(item => {
      const expiry = new Date(item.expiryDate);
      return expiry <= ninetyDaysFromNow && expiry > today;
    }).length;
  };

  const handleExportData = () => {
    toast({
      title: 'Export Feature',
      description: 'Data export feature coming soon!',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });



  const handleScanBarcode = () => {
    toast({
      title: 'Barcode Scanner',
      description: 'Barcode scanner activated. Point camera at barcode.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box minH="100vh" bg={bgColor} py={6}>
      <Container maxW="7xl">
        {/* Header */}
        <VStack spacing={6} align="stretch">
          <Flex alignItems="center" justifyContent="space-between">
            <VStack align="start" spacing={2}>
              <HStack spacing={3}>
                <Icon as={FaPills} w={8} h={8} color="blue.500" />
                <Heading size="xl" color={textColor}>Pharmacy Management System</Heading>
              </HStack>
              <Text color={textSecondary} fontSize="lg">
                Comprehensive inventory management with real-time tracking
              </Text>
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
                onClick={() => setShowAddItemModal(true)}
              >
                Add Item
              </Button>
            </HStack>
          </Flex>

          {/* Quick Stats */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Total Items</StatLabel>
                  <StatNumber color={textColor}>{inventoryData.length}</StatNumber>
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
                  <StatLabel color={textSecondary}>Total Value</StatLabel>
                  <StatNumber color={textColor}>${calculateTotalValue().toFixed(2)}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    8.5% from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Low Stock Items</StatLabel>
                  <StatNumber color="orange.500">{calculateLowStockItems()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    Requires attention
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Expiring Soon</StatLabel>
                  <StatNumber color="red.500">{calculateExpiringItems()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    Within 90 days
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
                    <Icon as={FaSearch} color="gray.400" />
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
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Diabetes">Diabetes</option>
                </Select>

                <Button
                  leftIcon={<FaDownload />}
                  variant="outline"
                  onClick={handleExportData}
                >
                  Export Data
                </Button>

                <Button
                  leftIcon={<FaSync />}
                  variant="ghost"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Main Content Tabs */}
          <Card bg={cardBg} shadow="md">
            <CardHeader>
              <Tabs value={selectedTab} onChange={setSelectedTab}>
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Inventory</Tab>
                  <Tab>Analytics</Tab>
                  <Tab>Alerts</Tab>
                  <Tab>Settings</Tab>
                </TabList>
              </Tabs>
            </CardHeader>
            <CardBody>
              <Tabs value={selectedTab} onChange={setSelectedTab}>
                <TabPanels>
                  {/* Overview Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {/* Stock Status Overview */}
                      <Box>
                        <Heading size="md" color={textColor} mb={4}>Stock Status Overview</Heading>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Card bg="green.50" border="1px" borderColor="green.200">
                            <CardBody textAlign="center">
                              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                {inventoryData.filter(item => getStockStatus(item.stock, item.minStock) === 'good-stock').length}
                              </Text>
                              <Text color="green.700">Good Stock</Text>
                            </CardBody>
                          </Card>
                          
                          <Card bg="orange.50" border="1px" borderColor="orange.200">
                            <CardBody textAlign="center">
                              <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                                {inventoryData.filter(item => getStockStatus(item.stock, item.minStock) === 'medium-stock').length}
                              </Text>
                              <Text color="orange.700">Medium Stock</Text>
                            </CardBody>
                          </Card>
                          
                          <Card bg="red.50" border="1px" borderColor="red.200">
                            <CardBody textAlign="center">
                              <Text fontSize="2xl" fontWeight="bold" color="red.600">
                                {inventoryData.filter(item => getStockStatus(item.stock, item.minStock) === 'low-stock').length}
                              </Text>
                              <Text color="red.700">Low Stock</Text>
                            </CardBody>
                          </Card>
                        </SimpleGrid>
                      </Box>

                      {/* Recent Activity */}
                      <Box>
                        <Heading size="md" color={textColor} mb={4}>Recent Activity</Heading>
                        <VStack spacing={3} align="stretch">
                          {inventoryData.slice(0, 5).map((item) => (
                            <HStack key={item.id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" color={textColor}>{item.name}</Text>
                                <Text fontSize="sm" color={textSecondary}>
                                  Stock: {item.stock} | Last updated: {item.lastUpdated}
                                </Text>
                              </VStack>
                              <Badge colorScheme={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* Inventory Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <TableContainer>
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Item Name</Th>
                              <Th>Category</Th>
                              <Th>Stock</Th>
                              <Th>Price</Th>
                              <Th>Expiry</Th>
                              <Th>Status</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {filteredInventory.map((item) => {
                              const expiryStatus = getExpiryStatus(item.expiryDate);
                              const stockStatus = getStockStatus(item.stock, item.minStock);
                              
                              return (
                                <Tr key={item.id}>
                                  <Td>
                                    <VStack align="start" spacing={1}>
                                      <Text fontWeight="bold" color={textColor}>{item.name}</Text>
                                      <Text fontSize="sm" color={textSecondary}>{item.supplier}</Text>
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
                                      />
                                    </VStack>
                                  </Td>
                                  <Td>
                                    <Text color={textColor}>${item.price}</Text>
                                  </Td>
                                  <Td>
                                    <Badge colorScheme={expiryStatus.color} variant="subtle">
                                      {expiryStatus.text}
                                    </Badge>
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
                                          onClick={() => {
                                            setSelectedItem(item);
                                            toast({
                                              title: 'Item Details',
                                              description: `${item.name} - Stock: ${item.stock}, Price: $${item.price}`,
                                              status: 'info',
                                              duration: 3000,
                                              isClosable: true,
                                            });
                                          }}
                                        />
                                      </Tooltip>
                                      <Tooltip label="Edit Item">
                                        <IconButton
                                          size="sm"
                                          icon={<FaEdit />}
                                          variant="ghost"
                                          colorScheme="green"
                                          onClick={() => handleEditItem(item)}
                                        />
                                      </Tooltip>
                                      <Tooltip label="Stock Adjustment">
                                        <IconButton
                                          size="sm"
                                          icon={<FaBoxes />}
                                          variant="ghost"
                                          colorScheme="orange"
                                          onClick={() => {
                                            setSelectedItem(item);
                                            setShowStockAdjustmentModal(true);
                                          }}
                                        />
                                      </Tooltip>
                                      <Tooltip label="Delete Item">
                                        <IconButton
                                          size="sm"
                                          icon={<FaTrash />}
                                          variant="ghost"
                                          colorScheme="red"
                                          onClick={() => handleDeleteItem(item.id)}
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
                    </VStack>
                  </TabPanel>

                  {/* Analytics Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {/* Sales Trends */}
                      <Box>
                        <Heading size="md" color={textColor} mb={4}>Sales Trends</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <Card bg="blue.50" border="1px" borderColor="blue.200">
                            <CardBody>
                              <VStack spacing={3}>
                                <HStack spacing={2}>
                                  <Icon as={FaChartLine} color="blue.500" />
                                  <Text fontWeight="bold" color="blue.700">Monthly Sales</Text>
                                </HStack>
                                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                                  ${inventoryData.reduce((total, item) => total + (item.salesThisMonth * item.price), 0).toFixed(2)}
                                </Text>
                                <Text color="blue.600">This Month</Text>
                              </VStack>
                            </CardBody>
                          </Card>

                          <Card bg="green.50" border="1px" borderColor="green.200">
                            <CardBody>
                              <VStack spacing={3}>
                                <HStack spacing={2}>
                                  <Icon as={FaPercentage} color="green.500" />
                                  <Text fontWeight="bold" color="green.700">Avg. Profit Margin</Text>
                                </HStack>
                                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                                  {Math.round(inventoryData.reduce((total, item) => total + item.profitMargin, 0) / inventoryData.length)}%
                                </Text>
                                <Text color="green.600">Overall Average</Text>
                              </VStack>
                            </CardBody>
                          </Card>
                        </SimpleGrid>
                      </Box>

                      {/* Category Distribution */}
                      <Box>
                        <Heading size="md" color={textColor} mb={4}>Category Distribution</Heading>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          {['Pain Relief', 'Antibiotics', 'Gastric'].map((category) => {
                            const count = inventoryData.filter(item => item.category === category).length;
                            const percentage = (count / inventoryData.length) * 100;
                            
                            return (
                              <Card key={category} bg={cardBg}>
                                <CardBody textAlign="center">
                                  <CircularProgress value={percentage} color="blue.500" size="80px">
                                    <CircularProgressLabel>{percentage.toFixed(0)}%</CircularProgressLabel>
                                  </CircularProgress>
                                  <Text mt={3} fontWeight="bold" color={textColor}>{category}</Text>
                                  <Text color={textSecondary}>{count} items</Text>
                                </CardBody>
                              </Card>
                            );
                          })}
                        </SimpleGrid>
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* Alerts Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      {/* Low Stock Alerts */}
                      <Box>
                        <Heading size="md" color={textColor} mb={4}>Low Stock Alerts</Heading>
                        {inventoryData.filter(item => item.stock <= item.minStock).map((item) => (
                          <Alert key={item.id} status="warning" mb={3}>
                            <AlertIcon />
                            <Box>
                              <AlertTitle>Low Stock Alert!</AlertTitle>
                              <AlertDescription>
                                {item.name} has only {item.stock} units remaining. Minimum stock level is {item.minStock}.
                              </AlertDescription>
                            </Box>
                          </Alert>
                        ))}
                      </Box>

                      {/* Expiry Alerts */}
                      <Box>
                        <Heading size="md" color={textColor} mb={4}>Expiry Alerts</Heading>
                        {inventoryData.filter(item => {
                          const expiry = new Date(item.expiryDate);
                          const today = new Date();
                          const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                          return daysUntilExpiry <= 90;
                        }).map((item) => {
                          const expiry = new Date(item.expiryDate);
                          const today = new Date();
                          const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                          
                          return (
                            <Alert key={item.id} status={daysUntilExpiry <= 30 ? "error" : "warning"} mb={3}>
                              <AlertIcon />
                              <Box>
                                <AlertTitle>Expiry Alert!</AlertTitle>
                                <AlertDescription>
                                  {item.name} expires in {daysUntilExpiry} days on {item.expiryDate}.
                                </AlertDescription>
                              </Box>
                            </Alert>
                          );
                        })}
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* Settings Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Box>
                        <Heading size="md" color={textColor} mb={4}>System Settings</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <Card bg={cardBg}>
                            <CardBody>
                              <VStack spacing={4} align="stretch">
                                <FormControl display="flex" alignItems="center">
                                  <FormLabel htmlFor="email-alerts" mb="0">
                                    Email Alerts
                                  </FormLabel>
                                  <Switch id="email-alerts" defaultChecked />
                                </FormControl>
                                
                                <FormControl display="flex" alignItems="center">
                                  <FormLabel htmlFor="sms-alerts" mb="0">
                                    SMS Alerts
                                  </FormLabel>
                                  <Switch id="sms-alerts" />
                                </FormControl>
                                
                                <FormControl display="flex" alignItems="center">
                                  <FormLabel htmlFor="auto-reorder" mb="0">
                                    Auto Reorder
                                  </FormLabel>
                                  <Switch id="auto-reorder" defaultChecked />
                                </FormControl>
                              </VStack>
                            </CardBody>
                          </Card>

                          <Card bg={cardBg}>
                            <CardBody>
                              <VStack spacing={4} align="stretch">
                                <FormControl>
                                  <FormLabel>Default Min Stock Level</FormLabel>
                                  <NumberInput defaultValue={50} min={1}>
                                    <NumberInputField />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
                                </FormControl>
                                
                                <FormControl>
                                  <FormLabel>Expiry Warning Days</FormLabel>
                                  <NumberInput defaultValue={90} min={1}>
                                    <NumberInputField />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
                                </FormControl>
                              </VStack>
                            </CardBody>
                          </Card>
                        </SimpleGrid>
                      </Box>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Enhanced Modals */}
      
      {/* Add/Edit Item Modal */}
      <Modal isOpen={showAddItemModal} onClose={() => setShowAddItemModal(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedItem ? 'Edit Item' : 'Add New Item'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AddEditItemForm 
              item={selectedItem}
              onSubmit={handleAddItem}
              onCancel={() => setShowAddItemModal(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add Supplier Modal */}
      <Modal isOpen={showAddSupplierModal} onClose={() => setShowAddSupplierModal(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Supplier</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AddSupplierForm 
              onSubmit={handleAddSupplier}
              onCancel={() => setShowAddSupplierModal(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal isOpen={showStockAdjustmentModal} onClose={() => setShowStockAdjustmentModal(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Stock Adjustment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <StockAdjustmentForm 
              item={selectedItem}
              onSubmit={handleStockAdjustment}
              onCancel={() => setShowStockAdjustmentModal(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PharmacyDashboard;
