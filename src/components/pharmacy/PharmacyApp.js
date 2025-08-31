import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
} from '../ChakraComponents';
import {
  FaPills,
  FaBoxes,
  FaUsers,
  FaChartLine,
  FaHospital,
  FaArrowLeft,
} from 'react-icons/fa';

// Import pharmacy components
import PharmacyRouter from './PharmacyRouter';
import PharmacyDashboard from './PharmacyDashboard';
import InventoryManager from './InventoryManager';
import SupplierManager from './SupplierManager';
import PharmacyAnalytics from './PharmacyAnalytics';

const PharmacyApp = () => {
  const [currentView, setCurrentView] = useState('main');
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === 'main') {
      toast({
        title: 'Returning to Main Menu',
        description: 'You are now back to the main pharmacy menu.',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleTabChange = (index) => {
    const tabs = ['dashboard', 'inventory', 'suppliers', 'analytics'];
    setSelectedTab(tabs[index]);
  };

  if (currentView === 'main') {
    return <PharmacyRouter onModuleSelect={handleViewChange} />;
  }

  const renderCurrentComponent = () => {
    switch (currentView) {
      case 'dashboard':
        return <PharmacyDashboard />;
      case 'inventory':
        return <InventoryManager />;
      case 'suppliers':
        return <SupplierManager />;
      case 'analytics':
        return <PharmacyAnalytics />;
      default:
        return <PharmacyRouter onModuleSelect={handleViewChange} />;
    }
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Container maxW="7xl">
          <HStack justify="space-between" py={4}>
            <HStack spacing={3}>
              <Icon as={FaHospital} w={8} h={8} color="blue.500" />
              <VStack align="start" spacing={1}>
                <Heading size="lg" color={textColor}>Pharmacy Management</Heading>
                <Text color={textSecondary} fontSize="sm">
                  {currentView.charAt(0).toUpperCase() + currentView.slice(1)} Module
                </Text>
              </VStack>
            </HStack>
            
            <Button
              leftIcon={<FaArrowLeft />}
              variant="outline"
              onClick={() => handleViewChange('main')}
            >
              Back to Main Menu
            </Button>
          </HStack>
        </Container>
      </Box>

      {/* Navigation Tabs */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200">
        <Container maxW="7xl">
          <Tabs index={['dashboard', 'inventory', 'suppliers', 'analytics'].indexOf(selectedTab)} onChange={handleTabChange}>
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaPills} />
                  <Text>Dashboard</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaBoxes} />
                  <Text>Inventory</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaUsers} />
                  <Text>Suppliers</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaChartLine} />
                  <Text>Analytics</Text>
                </HStack>
              </Tab>
            </TabList>
          </Tabs>
        </Container>
      </Box>

      {/* Main Content */}
      <Box py={6}>
        <Container maxW="7xl">
          <Tabs index={['dashboard', 'inventory', 'suppliers', 'analytics'].indexOf(selectedTab)} onChange={handleTabChange}>
            <TabPanels>
              <TabPanel>
                <PharmacyDashboard />
              </TabPanel>
              <TabPanel>
                <InventoryManager />
              </TabPanel>
              <TabPanel>
                <SupplierManager />
              </TabPanel>
              <TabPanel>
                <PharmacyAnalytics />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </Box>
  );
};

export default PharmacyApp;
