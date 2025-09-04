import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Badge,
  Button,
  Spinner,
  SimpleGrid,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Container,
  Flex,
  Progress,
} from '@chakra-ui/react';
import {
  FaUserInjured,
  FaCalendarAlt,
  FaNotesMedical,
  FaPills,
  FaPlus,
  FaPrescriptionBottle,
  FaStethoscope,
  FaHospital,
  FaUserMd,
  FaChartLine,
  FaUsers,
  FaDatabase,
  FaServer,
  FaHdd,
  FaCloud,
} from 'react-icons/fa';

const Dashboard = () => {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    clinicalNotes: 0,
    prescriptions: 0,
    labTests: 0,
    revenue: 0,
  });

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userData')) || {};
    if (user) {
      setUserData(user);
    }
    
    // Simulate loading and fetch stats
    setTimeout(() => {
      setStats({
        totalPatients: 156,
        todayAppointments: 8,
        clinicalNotes: 23,
        prescriptions: 45,
        labTests: 12,
        revenue: 12500,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="health.500" thickness="4px" />
          <Text color={textSecondary} fontSize="lg">
            Loading dashboard...
          </Text>
        </VStack>
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: FaUserInjured,
      color: 'blue',
      change: '+12%',
      changeType: 'increase',
      description: 'from last month',
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: FaCalendarAlt,
      color: 'green',
      change: '+25%',
      changeType: 'increase',
      description: 'from yesterday',
    },
    {
      title: 'Clinical Notes',
      value: stats.clinicalNotes,
      icon: FaNotesMedical,
      color: 'orange',
      change: '+8%',
      changeType: 'increase',
      description: 'from last week',
    },
    {
      title: 'Prescriptions',
      value: stats.prescriptions,
      icon: FaPills,
      color: 'purple',
      change: '+15%',
      changeType: 'increase',
      description: 'from last week',
    },
    {
      title: 'Lab Tests',
      value: stats.labTests,
      icon: FaStethoscope,
      color: 'teal',
      change: '+5%',
      changeType: 'increase',
      description: 'from last week',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: FaChartLine,
      color: 'green',
      change: '+18%',
      changeType: 'increase',
      description: 'from last month',
    },
  ];

  const quickActions = [
    {
      title: 'Add Patient',
      description: 'Register a new patient',
      icon: FaPlus,
      color: 'blue',
      link: '/add-patient',
      buttonText: 'Add Patient',
    },
    {
      title: 'Schedule Appointment',
      description: 'Book patient appointments',
      icon: FaCalendarAlt,
      color: 'green',
      link: '/appointments',
      buttonText: 'Schedule',
    },
    {
      title: 'Write Prescription',
      description: 'Create e-prescriptions',
      icon: FaPills,
      color: 'purple',
      link: '/e-prescription/new',
      buttonText: 'Write Rx',
    },
    {
      title: 'Lab Tests',
      description: 'Order and manage lab tests',
      icon: FaStethoscope,
      color: 'teal',
      link: '/lab-tests',
      buttonText: 'Order Tests',
    },
    {
      title: 'Manage Doctors',
      description: 'Add and manage doctors',
      icon: FaUserMd,
      color: 'orange',
      link: '/doctors',
      buttonText: 'Manage',
    },
  ];

  const systemStatus = [
    { name: 'Database', status: 'Online', icon: FaDatabase, color: 'green' },
    { name: 'API Services', status: 'Online', icon: FaServer, color: 'green' },
    { name: 'File Storage', status: 'Online', icon: FaHdd, color: 'green' },
    { name: 'Backup System', status: 'Online', icon: FaCloud, color: 'green' },
  ];

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="7xl">
        <VStack spacing={8} align="stretch">
          {/* Welcome Section */}
          <Card shadow="lg" borderRadius="xl" bg={cardBg}>
            <CardBody p={8}>
              <Flex alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={4}>
                <VStack align="start" spacing={2}>
                  <HStack spacing={3}>
                    <Icon as={FaHospital} w={8} h={8} color="health.500" />
                    <Heading size="xl" color={textColor}>
                      Welcome back, {userData.name || userData.username || 'Doctor'}! 👋
                    </Heading>
                  </HStack>
                  <Text color={textSecondary} fontSize="lg">
                    Here's what's happening in your practice today
                  </Text>
                </VStack>
                <Badge colorScheme="health" variant="solid" px={4} py={2} fontSize="lg">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Badge>
              </Flex>
            </CardBody>
          </Card>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {statCards.map((stat, index) => (
              <Card key={index} shadow="md" borderRadius="lg" bg={cardBg} _hover={{ shadow: 'lg' }} transition="all 0.2s">
                <CardBody p={6}>
                  <HStack spacing={4} align="start">
                    <Box
                      w={12}
                      h={12}
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg={`${stat.color}.100`}
                      color={`${stat.color}.600`}
                    >
                      <Icon as={stat.icon} w={6} h={6} />
                    </Box>
                    <Box flex={1}>
                      <Stat>
                        <StatNumber fontSize="2xl" fontWeight="bold" color={textColor}>
                          {stat.value}
                        </StatNumber>
                        <StatLabel color={textSecondary} fontSize="sm">
                          {stat.title}
                        </StatLabel>
                        <StatHelpText color={`${stat.color}.600`} fontSize="xs">
                          <StatArrow type={stat.changeType} />
                          {stat.change} {stat.description}
                        </StatHelpText>
                      </Stat>
                    </Box>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Quick Actions */}
          <Card shadow="lg" borderRadius="xl" bg={cardBg}>
            <CardHeader pb={4}>
              <Heading size="md" color={textColor}>
                Quick Actions
              </Heading>
            </CardHeader>
            <CardBody pt={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                {quickActions.map((action, index) => (
                  <Card key={index} shadow="sm" borderRadius="lg" _hover={{ shadow: 'md' }} transition="all 0.2s">
                    <CardBody p={6} textAlign="center">
                      <VStack spacing={4}>
                        <Icon as={action.icon} w={10} h={10} color={`${action.color}.500`} />
                        <VStack spacing={2}>
                          <Heading size="sm" color={textColor}>
                            {action.title}
                          </Heading>
                          <Text color={textSecondary} fontSize="sm">
                            {action.description}
                          </Text>
                        </VStack>
                        <Button
                          as={Link}
                          to={action.link}
                          colorScheme={action.color}
                          size="sm"
                          w="full"
                          borderRadius="lg"
                        >
                          {action.buttonText}
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Recent Activity & System Status */}
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
            {/* Recent Patients */}
            <Card shadow="lg" borderRadius="xl" bg={cardBg}>
              <CardHeader pb={4}>
                <Flex alignItems="center" justifyContent="space-between">
                  <Heading size="md" color={textColor}>
                    Recent Patients
                  </Heading>
                  <Button as={Link} to="/patients" variant="ghost" color="health.500" size="sm">
                    View All
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={6} py={8}>
                  <Icon as={FaUserInjured} w={16} h={16} color="gray.400" />
                  <VStack spacing={4}>
                    <Text color={textSecondary} fontSize="lg">
                      No recent patients
                    </Text>
                    <HStack spacing={3}>
                      <Button as={Link} to="/add-patient" colorScheme="health" size="sm" borderRadius="lg">
                        <Icon as={FaPlus} mr={2} />
                        Add First Patient
                      </Button>
                      <Button as={Link} to="/patient-dashboard" variant="outline" size="sm" borderRadius="lg">
                        View Sample Patient
                      </Button>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* System Status */}
            <Card shadow="lg" borderRadius="xl" bg={cardBg}>
              <CardHeader pb={4}>
                <Heading size="md" color={textColor}>
                  System Status
                </Heading>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={4}>
                  {systemStatus.map((system, index) => (
                    <Flex
                      key={index}
                      w="full"
                      alignItems="center"
                      justifyContent="space-between"
                      p={4}
                      borderRadius="lg"
                      bg="gray.50"
                      _dark={{ bg: 'gray.700' }}
                    >
                      <HStack spacing={3}>
                        <Icon as={system.icon} color={`${system.color}.500`} />
                        <Text fontWeight="medium" color={textColor}>
                          {system.name}
                        </Text>
                      </HStack>
                      <Badge colorScheme={system.color} variant="solid">
                        {system.status}
                      </Badge>
                    </Flex>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </Grid>

          {/* Pharmacy Operations */}
          <Card shadow="lg" borderRadius="xl" bg={cardBg}>
            <CardHeader pb={4}>
              <Flex alignItems="center" justifyContent="space-between">
                <Heading size="md" color={textColor}>
                  Pharmacy Operations
                </Heading>
                <Button as={Link} to="/pharmacy" variant="ghost" color="health.500" size="sm">
                  View All
                </Button>
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={6} py={8}>
                <Icon as={FaPrescriptionBottle} w={16} h={16} color="gray.400" />
                <VStack spacing={4}>
                  <Text color={textSecondary} fontSize="lg">
                    Manage pharmacy operations
                  </Text>
                  <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} w="full">
                    <Button as={Link} to="/pharmacy/pos" colorScheme="health" size="sm" borderRadius="lg">
                      🏥 POS
                    </Button>
                    <Button as={Link} to="/pharmacy/purchases" variant="outline" size="sm" borderRadius="lg">
                      📦 Purchases
                    </Button>
                    <Button as={Link} to="/pharmacy/returns" variant="outline" size="sm" borderRadius="lg">
                      🔄 Returns
                    </Button>
                  </SimpleGrid>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Performance Overview */}
          <Card shadow="lg" borderRadius="xl" bg={cardBg}>
            <CardHeader pb={4}>
              <Heading size="md" color={textColor}>
                Performance Overview
              </Heading>
            </CardHeader>
            <CardBody pt={0}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <VStack spacing={3} align="start">
                  <Text color={textSecondary} fontSize="sm">Patient Satisfaction</Text>
                  <Progress value={95} colorScheme="green" size="lg" borderRadius="lg" w="full" />
                  <Text color="green.600" fontWeight="bold">95%</Text>
                </VStack>
                <VStack spacing={3} align="start">
                  <Text color={textSecondary} fontSize="sm">Appointment Completion</Text>
                  <Progress value={88} colorScheme="blue" size="lg" borderRadius="lg" w="full" />
                  <Text color="blue.600" fontWeight="bold">88%</Text>
                </VStack>
                <VStack spacing={3} align="start">
                  <Text color={textSecondary} fontSize="sm">Revenue Growth</Text>
                  <Progress value={72} colorScheme="purple" size="lg" borderRadius="lg" w="full" />
                  <Text color="purple.600" fontWeight="bold">72%</Text>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Settings & Administration */}
          <Card shadow="lg" borderRadius="xl" bg={cardBg}>
            <CardHeader pb={4}>
              <Flex alignItems="center" justifyContent="space-between">
                <Heading size="md" color={textColor}>
                  Settings & Administration
                </Heading>
                <Badge colorScheme="orange" variant="subtle" px={3} py={1}>
                  Admin Panel
                </Badge>
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <Card shadow="sm" borderRadius="lg" _hover={{ shadow: 'md' }} transition="all 0.2s">
                  <CardBody p={6} textAlign="center">
                    <VStack spacing={4}>
                      <Icon as={FaUserMd} w={10} h={10} color="orange.500" />
                      <VStack spacing={2}>
                        <Heading size="sm" color={textColor}>
                          Manage Doctors
                        </Heading>
                        <Text color={textSecondary} fontSize="sm">
                          Add, edit, and manage doctor profiles
                        </Text>
                      </VStack>
                      <Button
                        as={Link}
                        to="/doctors"
                        colorScheme="orange"
                        size="sm"
                        w="full"
                        borderRadius="lg"
                      >
                        Manage Doctors
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                <Card shadow="sm" borderRadius="lg" _hover={{ shadow: 'md' }} transition="all 0.2s">
                  <CardBody p={6} textAlign="center">
                    <VStack spacing={4}>
                      <Icon as={FaHospital} w={10} h={10} color="blue.500" />
                      <VStack spacing={2}>
                        <Heading size="sm" color={textColor}>
                          Clinic Setup
                        </Heading>
                        <Text color={textSecondary} fontSize="sm">
                          Configure clinic information and settings
                        </Text>
                      </VStack>
                      <Button
                        as={Link}
                        to="/clinic-setup"
                        colorScheme="blue"
                        size="sm"
                        w="full"
                        borderRadius="lg"
                      >
                        Setup Clinic
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                <Card shadow="sm" borderRadius="lg" _hover={{ shadow: 'md' }} transition="all 0.2s">
                  <CardBody p={6} textAlign="center">
                    <VStack spacing={4}>
                      <Icon as={FaUsers} w={10} h={10} color="green.500" />
                      <VStack spacing={2}>
                        <Heading size="sm" color={textColor}>
                          User Management
                        </Heading>
                        <Text color={textSecondary} fontSize="sm">
                          Manage staff and user accounts
                        </Text>
                      </VStack>
                      <Button
                        as={Link}
                        to="/admin"
                        colorScheme="green"
                        size="sm"
                        w="full"
                        borderRadius="lg"
                      >
                        Manage Users
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default Dashboard;
