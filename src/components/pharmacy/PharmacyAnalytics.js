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
  Select,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Badge,
  Progress,
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
  Grid,
  GridItem,
  Flex,
  Spacer,
  Icon,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '../ChakraComponents';
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaTrendingUp,
  FaTrendingDown,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaBox,
  FaUser,
  FaCalendarAlt,
  FaDownload,
  FaEye,
  FaFilter,
  FaRefresh,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaPercentage,
  FaShoppingCart,
  FaTruck,
  FaShieldAlt,
  FaStar,
} from 'react-icons/fa';

const PharmacyAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [analyticsData, setAnalyticsData] = useState({});

  // Mock analytics data
  const mockAnalytics = {
    sales: {
      total: 125000.50,
      change: 12.5,
      trend: 'up',
      monthly: [85000, 92000, 98000, 105000, 112000, 125000],
      categories: {
        'Pain Relief': 35000,
        'Antibiotics': 28000,
        'Gastric': 22000,
        'Cardiovascular': 18000,
        'Diabetes': 12000,
        'Others': 10000
      }
    },
    inventory: {
      totalItems: 1250,
      lowStock: 45,
      expiringSoon: 23,
      totalValue: 450000,
      turnoverRate: 8.5,
      categories: {
        'Pain Relief': 400,
        'Antibiotics': 250,
        'Gastric': 200,
        'Cardiovascular': 150,
        'Diabetes': 100,
        'Others': 150
      }
    },
    suppliers: {
      total: 25,
      active: 22,
      performance: {
        excellent: 8,
        good: 10,
        average: 3,
        poor: 1,
        review: 3
      },
      topSuppliers: [
        { name: 'PharmaCorp', rating: 4.8, orders: 156, spent: 45600 },
        { name: 'MedSupply Inc', rating: 4.5, orders: 89, spent: 23400 },
        { name: 'HealthPharm', rating: 4.2, orders: 45, spent: 12800 }
      ]
    },
    customers: {
      total: 1250,
      new: 45,
      returning: 1205,
      satisfaction: 4.6,
      topProducts: [
        { name: 'Paracetamol 500mg', sales: 1250, revenue: 3125 },
        { name: 'Amoxicillin 250mg', sales: 890, revenue: 7787.5 },
        { name: 'Omeprazole 20mg', sales: 650, revenue: 8125 }
      ]
    },
    trends: {
      topGrowing: ['Pain Relief', 'Antibiotics', 'Gastric'],
      declining: ['Diabetes', 'Others'],
      seasonal: {
        'Pain Relief': 'High in winter',
        'Antibiotics': 'Consistent year-round',
        'Gastric': 'Peak in spring'
      }
    }
  };

  useEffect(() => {
    setAnalyticsData(mockAnalytics);
  }, []);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <FaTrendingUp color="green" />;
      case 'down': return <FaTrendingDown color="red" />;
      default: return <FaEquals color="gray" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'green';
      case 'down': return 'red';
      default: return 'gray';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value}%`;
  };

  return (
    <Box minH="100vh" bg={bgColor} py={6}>
      <Container maxW="7xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <VStack align="start" spacing={2}>
              <Heading size="xl" color={textColor}>Pharmacy Analytics Dashboard</Heading>
              <Text color={textSecondary}>Comprehensive insights and performance metrics</Text>
            </VStack>
            <HStack spacing={3}>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                maxW="150px"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </Select>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                maxW="150px"
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
              >
                Export Report
              </Button>
            </HStack>
          </HStack>

          {/* Key Metrics */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Total Sales</StatLabel>
                  <StatNumber color={textColor}>
                    {formatCurrency(analyticsData.sales?.total || 0)}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {analyticsData.sales?.change || 0}% from last period
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Inventory Value</StatLabel>
                  <StatNumber color={textColor}>
                    {formatCurrency(analyticsData.inventory?.totalValue || 0)}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {analyticsData.inventory?.turnoverRate || 0}% turnover rate
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Total Items</StatLabel>
                  <StatNumber color={textColor}>
                    {analyticsData.inventory?.totalItems || 0}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    {analyticsData.inventory?.lowStock || 0} low stock items
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Customer Satisfaction</StatLabel>
                  <StatNumber color={textColor}>
                    {analyticsData.customers?.satisfaction || 0}/5.0
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Based on {analyticsData.customers?.total || 0} customers
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Main Analytics Tabs */}
          <Card bg={cardBg} shadow="md">
            <CardHeader>
              <Tabs>
                <TabList>
                  <Tab>Sales Analytics</Tab>
                  <Tab>Inventory Insights</Tab>
                  <Tab>Supplier Performance</Tab>
                  <Tab>Customer Analytics</Tab>
                  <Tab>Trends & Forecasts</Tab>
                </TabList>
              </Tabs>
            </CardHeader>
            <CardBody>
              <Tabs>
                <TabPanels>
                  {/* Sales Analytics Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {/* Sales Overview */}
                      <Box>
                        <Heading size="md" color={textColor} mb={4}>Sales Performance Overview</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <Card bg="blue.50" border="1px" borderColor="blue.200">
                            <CardBody>
                              <VStack spacing={3}>
                                <HStack spacing={2}>
                                  <FaChartLine color="blue.500" />
                                  <Text fontWeight="bold" color="blue.700">Monthly Sales Trend</Text>
                                </HStack>
                                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                                  {formatCurrency(analyticsData.sales?.total || 0)}
                                </Text>
                                <Text color="blue.600">Total Sales This Period</Text>
                                <HStack spacing={2}>
                                  {getTrendIcon(analyticsData.sales?.trend)}
                                  <Text color="blue.600">
                                    {analyticsData.sales?.change || 0}% change
                                  </Text>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>

                          <Card bg="green.50" border="1px" borderColor="green.200">
                            <CardBody>
                              <VStack spacing={3}>
                                <HStack spacing={2}>
                                  <FaChartPie color="green.500" />
                                  <Text fontWeight="bold" color="green.700">Category Distribution</Text>
                                </HStack>
                                <VStack spacing={2} align="stretch">
                                  {Object.entries(analyticsData.sales?.categories || {}).map(([category, amount]) => (
                                    <Box key={category}>
                                      <HStack justify="space-between">
                                        <Text fontSize="sm" color="green.700">{category}</Text>
                                        <Text fontSize="sm" fontWeight="bold" color="green.700">
                                          {formatCurrency(amount)}
                                        </Text>
                                      </HStack>
                                      <Progress
                                        size="sm"
                                        value={(amount / analyticsData.sales.total) * 100}
                                        colorScheme="green"
                                        borderRadius="full"
                                      />
                                    </Box>
                                  ))}
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        </SimpleGrid>
                      </Box>

                      {/* Top Products */}
                      <Box>
                        <Heading size="md" color={textColor} mb={4}>Top Selling Products</Heading>
                        <TableContainer>
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th>Product Name</Th>
                                <Th>Units Sold</Th>
                                <Th>Revenue</Th>
                                <Th>Performance</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {analyticsData.customers?.topProducts?.map((product, index) => (
                                <Tr key={index}>
                                  <Td>
                                    <HStack spacing={2}>
                                      <Badge colorScheme="blue" variant="subtle">
                                        #{index + 1}
                                      </Badge>
                                      <Text fontWeight="bold" color={textColor}>{product.name}</Text>
                                    </HStack>
                                  </Td>
                                  <Td>
                                    <Text color={textColor}>{product.sales.toLocaleString()}</Text>
                                  </Td>
                                  <Td>
                                    <Text fontWeight="bold" color="green.600">
                                      {formatCurrency(product.revenue)}
                                    </Text>
                                  </Td>
                                  <Td>
                                    <Progress
                                      size="sm"
                                      value={(product.revenue / analyticsData.sales.total) * 100}
                                      colorScheme="green"
                                      borderRadius="full"
                                      w="100px"
                                    />
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* Inventory Insights Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {/* Inventory Overview */}
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <Card bg="orange.50" border="1px" borderColor="orange.200">
                          <CardBody textAlign="center">
                            <VStack spacing={3}>
                              <FaExclamationTriangle color="orange.500" size="2em" />
                              <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                                {analyticsData.inventory?.lowStock || 0}
                              </Text>
                              <Text color="orange.700">Low Stock Items</Text>
                              <Text fontSize="sm" color="orange.600">
                                Requires immediate attention
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card bg="red.50" border="1px" borderColor="red.200">
                          <CardBody textAlign="center">
                            <VStack spacing={3}>
                              <FaClock color="red.500" size="2em" />
                              <Text fontSize="2xl" fontWeight="bold" color="red.600">
                                {analyticsData.inventory?.expiringSoon || 0}
                              </Text>
                              <Text color="red.700">Expiring Soon</Text>
                              <Text fontSize="sm" color="red.600">
                                Within 90 days
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card bg="blue.50" border="1px" borderColor="blue.200">
                          <CardBody textAlign="center">
                            <VStack spacing={3}>
                              <FaChartBar color="blue.500" size="2em" />
                              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                                {analyticsData.inventory?.turnoverRate || 0}%
                              </Text>
                              <Text color="blue.700">Turnover Rate</Text>
                              <Text fontSize="sm" color="blue.600">
                                Annual inventory turnover
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>

                      {/* Category Distribution */}
                      <Box>
                        <Heading size="md" color={textColor} mb={4}>Inventory by Category</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          {Object.entries(analyticsData.inventory?.categories || {}).map(([category, count]) => (
                            <Card key={category} bg={cardBg}>
                              <CardBody>
                                <VStack spacing={2} align="stretch">
                                  <HStack justify="space-between">
                                    <Text fontWeight="bold" color={textColor}>{category}</Text>
                                    <Text color={textColor}>{count} items</Text>
                                  </HStack>
                                  <Progress
                                    size="lg"
                                    value={(count / analyticsData.inventory.totalItems) * 100}
                                    colorScheme="blue"
                                    borderRadius="full"
                                  />
                                  <Text fontSize="sm" color={textSecondary}>
                                    {((count / analyticsData.inventory.totalItems) * 100).toFixed(1)}% of total inventory
                                  </Text>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* Supplier Performance Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {/* Performance Overview */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Card bg={cardBg}>
                          <CardHeader>
                            <Heading size="md" color={textColor}>Supplier Performance Ratings</Heading>
                          </CardHeader>
                          <CardBody>
                            <VStack spacing={4} align="stretch">
                              {Object.entries(analyticsData.suppliers?.performance || {}).map(([rating, count]) => (
                                <Box key={rating}>
                                  <HStack justify="space-between" mb={2}>
                                    <Text color={textColor} textTransform="capitalize">{rating}</Text>
                                    <Text fontWeight="bold" color={textColor}>{count}</Text>
                                  </HStack>
                                  <Progress
                                    size="sm"
                                    value={(count / analyticsData.suppliers.total) * 100}
                                    colorScheme={rating === 'excellent' ? 'green' : rating === 'good' ? 'blue' : rating === 'average' ? 'yellow' : 'red'}
                                    borderRadius="full"
                                  />
                                </Box>
                              ))}
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card bg={cardBg}>
                          <CardHeader>
                            <Heading size="md" color={textColor}>Top Suppliers</Heading>
                          </CardHeader>
                          <CardBody>
                            <VStack spacing={4} align="stretch">
                              {analyticsData.suppliers?.topSuppliers?.map((supplier, index) => (
                                <Box key={index} p={3} bg="gray.50" borderRadius="md">
                                  <HStack justify="space-between" mb={2}>
                                    <Text fontWeight="bold" color={textColor}>{supplier.name}</Text>
                                    <Badge colorScheme="blue" variant="subtle">
                                      #{index + 1}
                                    </Badge>
                                  </HStack>
                                  <SimpleGrid columns={2} spacing={2}>
                                    <VStack align="start" spacing={1}>
                                      <Text fontSize="sm" color={textSecondary}>Rating</Text>
                                      <HStack spacing={1}>
                                        <FaStar color="yellow.400" />
                                        <Text fontSize="sm" color={textColor}>{supplier.rating}</Text>
                                      </HStack>
                                    </VStack>
                                    <VStack align="start" spacing={1}>
                                      <Text fontSize="sm" color={textSecondary}>Orders</Text>
                                      <Text fontSize="sm" color={textColor}>{supplier.orders}</Text>
                                    </VStack>
                                  </SimpleGrid>
                                  <Text fontSize="sm" color="green.600" mt={2}>
                                    {formatCurrency(supplier.spent)} spent
                                  </Text>
                                </Box>
                              ))}
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  {/* Customer Analytics Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {/* Customer Overview */}
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <Card bg="purple.50" border="1px" borderColor="purple.200">
                          <CardBody textAlign="center">
                            <VStack spacing={3}>
                              <FaUser color="purple.500" size="2em" />
                              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                                {analyticsData.customers?.total || 0}
                              </Text>
                              <Text color="purple.700">Total Customers</Text>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card bg="green.50" border="1px" borderColor="green.200">
                          <CardBody textAlign="center">
                            <VStack spacing={3}>
                              <FaCheckCircle color="green.500" size="2em" />
                              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                {analyticsData.customers?.returning || 0}
                              </Text>
                              <Text color="green.700">Returning Customers</Text>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card bg="blue.50" border="1px" borderColor="blue.200">
                          <CardBody textAlign="center">
                            <VStack spacing={3}>
                              <FaStar color="blue.500" size="2em" />
                              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                                {analyticsData.customers?.satisfaction || 0}
                              </Text>
                              <Text color="blue.700">Satisfaction Rating</Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>

                      {/* Customer Satisfaction */}
                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md" color={textColor}>Customer Satisfaction Trends</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <Text color={textColor}>Overall Rating</Text>
                              <HStack spacing={2}>
                                <Text fontWeight="bold" color={textColor}>
                                  {analyticsData.customers?.satisfaction || 0}/5.0
                                </Text>
                                <Badge colorScheme="green">Excellent</Badge>
                              </HStack>
                            </HStack>
                            <Progress
                              size="lg"
                              value={(analyticsData.customers?.satisfaction || 0) * 20}
                              colorScheme="green"
                              borderRadius="full"
                            />
                            <Text fontSize="sm" color={textSecondary}>
                              Based on customer feedback and ratings
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>

                  {/* Trends & Forecasts Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {/* Growth Trends */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Card bg="green.50" border="1px" borderColor="green.200">
                          <CardHeader>
                            <Heading size="md" color="green.700">Growing Categories</Heading>
                          </CardHeader>
                          <CardBody>
                            <VStack spacing={3} align="stretch">
                              {analyticsData.trends?.topGrowing?.map((category, index) => (
                                <HStack key={index} justify="space-between">
                                  <Text color="green.700">{category}</Text>
                                  <FaTrendingUp color="green.500" />
                                </HStack>
                              ))}
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card bg="red.50" border="1px" borderColor="red.200">
                          <CardHeader>
                            <Heading size="md" color="red.700">Declining Categories</Heading>
                          </CardHeader>
                          <CardBody>
                            <VStack spacing={3} align="stretch">
                              {analyticsData.trends?.declining?.map((category, index) => (
                                <HStack key={index} justify="space-between">
                                  <Text color="red.700">{category}</Text>
                                  <FaTrendingDown color="red.500" />
                                </HStack>
                              ))}
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>

                      {/* Seasonal Trends */}
                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="md" color={textColor}>Seasonal Patterns</Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            {Object.entries(analyticsData.trends?.seasonal || {}).map(([category, pattern]) => (
                              <Box key={category} p={4} bg="gray.50" borderRadius="md">
                                <Text fontWeight="bold" color={textColor} mb={2}>{category}</Text>
                                <Text color={textSecondary}>{pattern}</Text>
                              </Box>
                            ))}
                          </SimpleGrid>
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

export default PharmacyAnalytics;
