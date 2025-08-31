import React, { useState } from 'react';
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
  SimpleGrid,
  useColorModeValue,
  Icon,
  Badge,
  Flex,
  Spacer,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '../ChakraComponents';
import {
  FaPills,
  FaBoxes,
  FaUsers,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaArrowRight,
  FaCog,
  FaBell,
  FaShieldAlt,
  FaTruck,
  FaFileInvoice,
  FaQrcode,
  FaBarcode,
  FaPrint,
  FaDownload,
  FaUpload,
  FaSync,
  FaHistory,
  FaStar,
  FaUserMd,
  FaHospital,
  FaPrescription,
  FaShoppingCart,
  FaCreditCard,
  FaFileContract,
  FaClipboardList,
  FaExclamationCircle,
  FaInfoCircle,
} from 'react-icons/fa';

const PharmacyRouter = () => {
  const [selectedModule, setSelectedModule] = useState('dashboard');
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');

  // Mock data for quick stats
  const quickStats = {
    totalItems: 1250,
    lowStock: 45,
    expiringSoon: 23,
    totalValue: 450000,
    activeSuppliers: 22,
    totalCustomers: 1250,
    monthlySales: 125000,
    pendingOrders: 15
  };

  const modules = [
    {
      id: 'dashboard',
      title: 'Pharmacy Dashboard',
      description: 'Overview of pharmacy operations and key metrics',
      icon: FaPills,
      color: 'blue',
      features: ['Real-time monitoring', 'Quick actions', 'System status'],
      alerts: 3,
      status: 'active'
    },
    {
      id: 'inventory',
      title: 'Inventory Management',
      description: 'Comprehensive inventory tracking and management',
      icon: FaBoxes,
      color: 'green',
      features: ['Stock tracking', 'Barcode scanning', 'Expiry management', 'Reorder alerts'],
      alerts: 8,
      status: 'active'
    },
    {
      id: 'suppliers',
      title: 'Supplier Management',
      description: 'Manage pharmaceutical suppliers and vendor relationships',
      icon: FaUsers,
      color: 'purple',
      features: ['Supplier database', 'Performance tracking', 'Contract management', 'Rating system'],
      alerts: 2,
      status: 'active'
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'Data-driven insights and performance analytics',
      icon: FaChartLine,
      color: 'orange',
      features: ['Sales analytics', 'Inventory insights', 'Supplier performance', 'Trends & forecasts'],
      alerts: 0,
      status: 'active'
    },
    {
      id: 'orders',
      title: 'Purchase Orders',
      description: 'Create and manage purchase orders with suppliers',
      icon: FaFileInvoice,
      color: 'teal',
      features: ['Order creation', 'Approval workflow', 'Tracking', 'Invoice management'],
      alerts: 5,
      status: 'active'
    },
    {
      id: 'billing',
      title: 'Billing & Invoicing',
      description: 'Customer billing and payment processing',
      icon: FaCreditCard,
      color: 'cyan',
      features: ['Invoice generation', 'Payment processing', 'Financial reports', 'Tax management'],
      alerts: 1,
      status: 'active'
    },
    {
      id: 'prescriptions',
      title: 'Prescription Management',
      description: 'Digital prescription handling and verification',
      icon: FaPrescription,
      color: 'red',
      features: ['E-prescriptions', 'Verification', 'Drug interactions', 'Patient history'],
      alerts: 12,
      status: 'active'
    },
    {
      id: 'compliance',
      title: 'Compliance & Safety',
      description: 'Regulatory compliance and safety monitoring',
      icon: FaShieldAlt,
      color: 'yellow',
      features: ['FDA compliance', 'Safety monitoring', 'Audit trails', 'Documentation'],
      alerts: 4,
      status: 'active'
    }
  ];

  const handleModuleSelect = (moduleId) => {
    setSelectedModule(moduleId);
    toast({
      title: 'Module Selected',
      description: `Navigating to ${modules.find(m => m.id === moduleId)?.title}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'maintenance': return 'yellow';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getAlertColor = (count) => {
    if (count === 0) return 'green';
    if (count <= 5) return 'yellow';
    if (count <= 10) return 'orange';
    return 'red';
  };

  return (
    <Box minH="100vh" bg={bgColor} py={6}>
      <Container maxW="7xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <VStack spacing={4} align="stretch">
            <HStack spacing={3}>
              <Icon as={FaHospital} w={10} h={10} color="blue.500" />
              <VStack align="start" spacing={1}>
                <Heading size="xl" color={textColor}>Pharmacy Management System</Heading>
                <Text color={textSecondary} fontSize="lg">
                  Comprehensive pharmaceutical inventory and operations management
                </Text>
              </VStack>
            </HStack>

            {/* Quick Stats */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <Card bg={cardBg} shadow="sm">
                <CardBody p={4}>
                  <VStack spacing={2}>
                    <HStack spacing={2}>
                      <Icon as={FaBoxes} color="blue.500" />
                      <Text fontSize="sm" color={textSecondary}>Total Items</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                      {quickStats.totalItems.toLocaleString()}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} shadow="sm">
                <CardBody p={4}>
                  <VStack spacing={2}>
                    <HStack spacing={2}>
                      <Icon as={FaExclamationTriangle} color="orange.500" />
                      <Text fontSize="sm" color={textSecondary}>Low Stock</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                      {quickStats.lowStock}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} shadow="sm">
                <CardBody p={4}>
                  <VStack spacing={2}>
                    <HStack spacing={2}>
                      <Icon as={FaClock} color="red.500" />
                      <Text fontSize="sm" color={textSecondary}>Expiring Soon</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="red.500">
                      {quickStats.expiringSoon}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} shadow="sm">
                <CardBody p={4}>
                  <VStack spacing={2}>
                    <HStack spacing={2}>
                      <Icon as={FaDollarSign} color="green.500" />
                      <Text fontSize="sm" color={textSecondary}>Monthly Sales</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                      ${(quickStats.monthlySales / 1000).toFixed(0)}K
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>

          {/* System Status */}
          <Card bg={cardBg} shadow="md">
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md" color={textColor}>System Status</Heading>
                <HStack spacing={2}>
                  <Badge colorScheme="green" variant="subtle">
                    All Systems Operational
                  </Badge>
                  <Icon as={FaSync} color="gray.400" cursor="pointer" />
                </HStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <HStack spacing={3} p={3} bg="green.50" borderRadius="md">
                  <Icon as={FaCheckCircle} color="green.500" />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color="green.700">Database</Text>
                    <Text fontSize="sm" color="green.600">Connected & Healthy</Text>
                  </VStack>
                </HStack>

                <HStack spacing={3} p={3} bg="blue.50" borderRadius="md">
                  <Icon as={FaCheckCircle} color="blue.500" />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color="blue.700">API Services</Text>
                    <Text fontSize="sm" color="blue.600">All Endpoints Active</Text>
                  </VStack>
                </HStack>

                <HStack spacing={3} p={3} bg="green.50" borderRadius="md">
                  <Icon as={FaCheckCircle} color="green.500" />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color="green.700">Security</Text>
                    <Text fontSize="sm" color="green.600">All Systems Secure</Text>
                  </VStack>
                </HStack>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Module Selection */}
          <Card bg={cardBg} shadow="md">
            <CardHeader>
              <Heading size="md" color={textColor}>Pharmacy Modules</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {modules.map((module) => (
                  <Card
                    key={module.id}
                    bg={selectedModule === module.id ? `${module.color}.50` : cardBg}
                    border={selectedModule === module.id ? `2px solid` : '1px solid'}
                    borderColor={selectedModule === module.id ? `${module.color}.200` : 'gray.200'}
                    shadow="md"
                    cursor="pointer"
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'lg',
                      borderColor: `${module.color}.300`
                    }}
                    transition="all 0.2s"
                    onClick={() => handleModuleSelect(module.id)}
                  >
                    <CardHeader pb={3}>
                      <HStack justify="space-between">
                        <HStack spacing={3}>
                          <Icon
                            as={module.icon}
                            w={6}
                            h={6}
                            color={`${module.color}.500`}
                          />
                          <VStack align="start" spacing={1}>
                            <Heading size="md" color={textColor}>
                              {module.title}
                            </Heading>
                            <Text fontSize="sm" color={textSecondary}>
                              {module.description}
                            </Text>
                          </VStack>
                        </HStack>
                        <Badge
                          colorScheme={getAlertColor(module.alerts)}
                          variant="solid"
                          size="sm"
                        >
                          {module.alerts}
                        </Badge>
                      </HStack>
                    </CardHeader>
                    <CardBody pt={0}>
                      <VStack spacing={3} align="stretch">
                        <VStack spacing={2} align="stretch">
                          {module.features.slice(0, 3).map((feature, index) => (
                            <HStack key={index} spacing={2}>
                              <Icon
                                as={FaCheckCircle}
                                color={`${module.color}.500`}
                                w={4}
                                h={4}
                              />
                              <Text fontSize="sm" color={textColor}>
                                {feature}
                              </Text>
                            </HStack>
                          ))}
                          {module.features.length > 3 && (
                            <Text fontSize="sm" color={textSecondary}>
                              +{module.features.length - 3} more features
                            </Text>
                          )}
                        </VStack>
                        
                        <HStack justify="space-between" pt={2}>
                          <Badge
                            colorScheme={getStatusColor(module.status)}
                            variant="subtle"
                            size="sm"
                          >
                            {module.status}
                          </Badge>
                          <Icon
                            as={FaArrowRight}
                            color={`${module.color}.500`}
                            w={4}
                            h={4}
                          />
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Recent Alerts */}
          <Card bg={cardBg} shadow="md">
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md" color={textColor}>Recent Alerts & Notifications</Heading>
                <Button
                  leftIcon={<FaBell />}
                  variant="outline"
                  size="sm"
                >
                  View All
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Alert status="warning">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Low Stock Alert!</AlertTitle>
                    <AlertDescription>
                      Paracetamol 500mg has only 25 units remaining. Minimum stock level is 50.
                    </AlertDescription>
                  </Box>
                </Alert>

                <Alert status="error">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Expiry Alert!</AlertTitle>
                    <AlertDescription>
                      Amoxicillin 250mg expires in 15 days on 2024-02-15.
                    </AlertDescription>
                  </Box>
                </Alert>

                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>New Supplier Added</AlertTitle>
                    <AlertDescription>
                      HealthPharm Solutions has been added to the supplier database.
                    </AlertDescription>
                  </Box>
                </Alert>

                <Alert status="success">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Monthly Report Generated</AlertTitle>
                    <AlertDescription>
                      January 2024 pharmacy analytics report has been generated successfully.
                    </AlertDescription>
                  </Box>
                </Alert>
              </VStack>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card bg={cardBg} shadow="md">
            <CardHeader>
              <Heading size="md" color={textColor}>Quick Actions</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <Button
                  leftIcon={<FaBarcode />}
                  colorScheme="blue"
                  variant="outline"
                  size="lg"
                  h="80px"
                  onClick={() => handleModuleSelect('inventory')}
                >
                  Scan Barcode
                </Button>

                <Button
                  leftIcon={<FaPlus />}
                  colorScheme="green"
                  variant="outline"
                  size="lg"
                  h="80px"
                  onClick={() => handleModuleSelect('inventory')}
                >
                  Add Item
                </Button>

                <Button
                  leftIcon={<FaFileInvoice />}
                  colorScheme="purple"
                  variant="outline"
                  size="lg"
                  h="80px"
                  onClick={() => handleModuleSelect('orders')}
                >
                  Create Order
                </Button>

                <Button
                  leftIcon={<FaDownload />}
                  colorScheme="orange"
                  variant="outline"
                  size="lg"
                  h="80px"
                  onClick={() => handleModuleSelect('analytics')}
                >
                  Export Report
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default PharmacyRouter;
