import React from 'react';
import { FaSearch, FaFilter, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeartbeat } from 'react-icons/fa';

// Import all Chakra UI components
import {
  // Layout components
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  HStack,
  VStack,
  Stack,
  SimpleGrid,
  Wrap,
  WrapItem,
  Center,
  Square,
  Circle,
  Spacer,
  Divider,
  
  // Typography components
  Text,
  Heading,
  Link,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  
  // Form components
  Button,
  ButtonGroup,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  InputLeftAddon,
  InputRightAddon,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Select,
  Textarea,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  PinInput,
  PinInputField,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  
  // Data display components
  Badge,
  Code,
  Kbd,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  TagCloseButton,
  Card,
  CardBody,
  CardHeader,
  Progress,
  
  // Feedback components
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CircularProgress,
  CircularProgressLabel,
  Spinner,
  Toast,
  useToast,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  
  // Overlay components
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Tooltip,
  
  // Navigation components
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  LinkBox,
  LinkOverlay,
  
  // Media components
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Image,
  AspectRatio,
  
  // Disclosure components
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Collapse,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  VisuallyHidden,
  
  // Other components
  Portal,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useBoolean,
  useClipboard,
  useCounter,
  useNumberInput,
  usePinInput,
  useSlider,
  useBreakpointValue,
  useMediaQuery,
  usePrefersReducedMotion,
  useUpdateEffect,
  useWhyDidYouUpdate,
  Icon,
} from '@chakra-ui/react';

// Re-export all Chakra UI components for convenience
export {
  // Layout components
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  HStack,
  VStack,
  Stack,
  SimpleGrid,
  Wrap,
  WrapItem,
  Center,
  Square,
  Circle,
  Spacer,
  Divider,
  
  // Typography components
  Text,
  Heading,
  Link,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  
  // Form components
  Button,
  ButtonGroup,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  InputLeftAddon,
  InputRightAddon,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Select,
  Textarea,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  PinInput,
  PinInputField,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  
  // Data display components
  Badge,
  Code,
  Kbd,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  TagCloseButton,
  Card,
  CardBody,
  CardHeader,
  Progress,
  
  // Feedback components
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CircularProgress,
  CircularProgressLabel,
  Spinner,
  Toast,
  useToast,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  
  // Overlay components
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Tooltip,
  
  // Navigation components
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  LinkBox,
  LinkOverlay,
  
  // Media components
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Image,
  AspectRatio,
  
  // Disclosure components
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Collapse,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  VisuallyHidden,
  
  // Other components
  Portal,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useBoolean,
  useClipboard,
  useCounter,
  useNumberInput,
  usePinInput,
  useSlider,
  useBreakpointValue,
  useMediaQuery,
  usePrefersReducedMotion,
  useUpdateEffect,
  useWhyDidYouUpdate,
  Icon,
};

// Custom healthcare-specific components

// Patient Card Component
export const PatientCard = ({ patient, onView, onEdit, onDelete }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Card shadow="md" borderRadius="lg" _hover={{ shadow: 'lg' }} transition="all 0.2s">
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <Avatar
              size="lg"
              name={`${patient.firstName} ${patient.lastName}`}
              bg={patient.gender === 'Male' ? 'blue.500' : 'pink.500'}
            />
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="md" color={textColor}>
                {patient.firstName} {patient.lastName}
              </Heading>
              <HStack spacing={2}>
                <Badge colorScheme={patient.gender === 'Male' ? 'blue' : 'pink'} variant="subtle">
                  {patient.gender}
                </Badge>
                <Text fontSize="sm" color={textSecondary}>
                  {calculateAge(patient.dateOfBirth)} years
                </Text>
              </HStack>
            </VStack>
          </HStack>
          
          <VStack spacing={2} align="start">
            <HStack spacing={2} fontSize="sm">
              <Icon as={FaPhone} color="gray.500" />
              <Text color={textColor}>{patient.phone}</Text>
            </HStack>
            <HStack spacing={2} fontSize="sm">
              <Icon as={FaEnvelope} color="gray.500" />
              <Text color={textColor}>{patient.email}</Text>
            </HStack>
            <HStack spacing={2} fontSize="sm">
              <Icon as={FaMapMarkerAlt} color="gray.500" />
              <Text color={textColor}>{patient.city}, {patient.state}</Text>
            </HStack>
          </VStack>
          
          <HStack spacing={2}>
            <Button size="sm" colorScheme="blue" variant="ghost" onClick={() => onView(patient)}>
              View
            </Button>
            <Button size="sm" colorScheme="green" variant="ghost" onClick={() => onEdit(patient)}>
              Edit
            </Button>
            <Button size="sm" colorScheme="red" variant="ghost" onClick={() => onDelete(patient.id)}>
              Delete
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Vital Signs Display Component
export const VitalSignsDisplay = ({ vitals }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Card shadow="md" borderRadius="lg" bg={cardBg}>
      <CardHeader pb={3}>
        <Heading size="md" color={textColor}>Vital Signs</Heading>
      </CardHeader>
      <CardBody pt={0}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <VStack spacing={1}>
            <Text fontSize="sm" color="gray.600">Blood Pressure</Text>
            <Text fontWeight="bold" color={textColor}>
              {vitals?.bloodPressure || 'N/A'}
            </Text>
          </VStack>
          <VStack spacing={1}>
            <Text fontSize="sm" color="gray.600">Heart Rate</Text>
            <Text fontWeight="bold" color={textColor}>
              {vitals?.heartRate || 'N/A'} bpm
            </Text>
          </VStack>
          <VStack spacing={1}>
            <Text fontSize="sm" color="gray.600">Temperature</Text>
            <Text fontWeight="bold" color={textColor}>
              {vitals?.temperature || 'N/A'}°F
            </Text>
          </VStack>
          <VStack spacing={1}>
            <Text fontSize="sm" color="gray.600">Oxygen</Text>
            <Text fontWeight="bold" color={textColor}>
              {vitals?.oxygenSaturation || 'N/A'}%
            </Text>
          </VStack>
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};

// Appointment Card Component
export const AppointmentCard = ({ appointment, onEdit, onCancel }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'green';
      case 'pending': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Card shadow="md" borderRadius="lg" bg={cardBg}>
      <CardBody p={4}>
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" color={textColor}>
                {appointment.patientName}
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                {appointment.doctorName}
              </Text>
            </VStack>
            <Badge colorScheme={getStatusColor(appointment.status)} variant="solid">
              {appointment.status}
            </Badge>
          </HStack>
          
          <Text fontSize="sm" color={textColor}>
            {new Date(appointment.dateTime).toLocaleString()}
          </Text>
          
          <HStack spacing={2}>
            <Button size="sm" colorScheme="blue" variant="ghost" onClick={() => onEdit(appointment)}>
              Edit
            </Button>
            <Button size="sm" colorScheme="red" variant="ghost" onClick={() => onCancel(appointment.id)}>
              Cancel
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Search and Filter Component
export const SearchAndFilter = ({ searchTerm, onSearchChange, filters, onFilterChange, onClearFilters }) => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Card shadow="md" borderRadius="lg" bg={cardBg}>
      <CardBody p={4}>
        <VStack spacing={4}>
          <InputGroup>
            <InputLeftElement>
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              borderRadius="lg"
            />
          </InputGroup>
          
          <HStack spacing={4} wrap="wrap">
            {filters.map((filter) => (
              <FormControl key={filter.key} maxW="200px">
                <FormLabel fontSize="sm">{filter.label}</FormLabel>
                <Select
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  borderRadius="lg"
                  placeholder={filter.placeholder}
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            ))}
            
            <Button
              onClick={onClearFilters}
              variant="outline"
              colorScheme="gray"
              borderRadius="lg"
              leftIcon={<FaFilter />}
            >
              Clear Filters
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Data Table Component
export const DataTable = ({ columns, data, onRowClick, onEdit, onDelete, loading }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  if (loading) {
    return (
      <Card shadow="md" borderRadius="lg" bg={cardBg}>
        <CardBody p={6}>
          <VStack spacing={4}>
            <Spinner size="xl" color="health.500" />
            <Text color="gray.600">Loading data...</Text>
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card shadow="md" borderRadius="lg" bg={cardBg}>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              {columns.map((column) => (
                <Th key={column.key} color={textColor}>
                  {column.label}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, index) => (
              <Tr
                key={row.id || index}
                _hover={{ bg: 'gray.50' }}
                cursor={onRowClick ? 'pointer' : 'default'}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <Td key={column.key} color={textColor}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Card>
  );
};

// Form Field Component
export const FormField = ({ label, children, error, isRequired, helperText }) => {
  return (
    <FormControl isRequired={isRequired} isInvalid={!!error}>
      <FormLabel>{label}</FormLabel>
      {children}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

// Status Alert Component
export const StatusAlert = ({ status, title, description, onClose }) => {
  const getStatusProps = (status) => {
    switch (status) {
      case 'success':
        return { colorScheme: 'green', icon: 'check-circle' };
      case 'error':
        return { colorScheme: 'red', icon: 'warning' };
      case 'warning':
        return { colorScheme: 'yellow', icon: 'warning' };
      case 'info':
        return { colorScheme: 'blue', icon: 'info' };
      default:
        return { colorScheme: 'gray', icon: 'info' };
    }
  };

  const { colorScheme, icon } = getStatusProps(status);

  return (
    <Alert status={status} colorScheme={colorScheme} borderRadius="lg">
      <AlertIcon />
      <Box>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Box>
    </Alert>
  );
};

// Loading Skeleton Component
export const LoadingSkeleton = ({ rows = 5, columns = 4 }) => {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Card shadow="md" borderRadius="lg" bg={cardBg}>
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <HStack key={rowIndex} spacing={4}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} height="20px" flex={1} />
              ))}
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

// Page Header Component
export const PageHeader = ({ title, subtitle, actions, icon }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');

  return (
    <Card shadow="lg" borderRadius="xl" bg={cardBg}>
      <CardBody p={8}>
        <Flex alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={4}>
          <VStack align="start" spacing={2}>
            <HStack spacing={3}>
              {icon && <Icon as={icon} w={8} h={8} color="health.500" />}
              <Heading size="xl" color={textColor}>
                {title}
              </Heading>
            </HStack>
            {subtitle && (
              <Text color={textSecondary} fontSize="lg">
                {subtitle}
              </Text>
            )}
          </VStack>
          {actions && (
            <HStack spacing={3}>
              {actions}
            </HStack>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
};

// Stats Grid Component
export const StatsGrid = ({ stats }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
      {stats.map((stat, index) => (
        <Card key={index} shadow="md" borderRadius="lg" bg={cardBg}>
          <CardBody p={6} textAlign="center">
            <VStack spacing={2}>
              {stat.icon && (
                <Icon as={stat.icon} w={8} h={8} color={stat.color || 'health.500'} />
              )}
              <Stat>
                <StatNumber fontSize="3xl" color={stat.color || 'health.600'}>
                  {stat.value}
                </StatNumber>
                <StatLabel color={textSecondary}>{stat.label}</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
};
