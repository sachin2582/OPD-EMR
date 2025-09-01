import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Flex,
  Icon,
  SimpleGrid,
  Container,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  HStack,
  Badge,
  Image,
  Center
} from '@chakra-ui/react';
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPills,
  FaUmbrella,
  FaGift,
  FaComments,
  FaHospital,
  FaUserMd,
  FaShieldAlt,
  FaChartLine,
  FaMobileAlt,
  FaGlobe,
  FaCheckCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test', password: 'test' })
      });
      
      if (response.status === 401) {
        // Backend is working (401 is expected for invalid credentials)
        setBackendStatus('online');
        setIsOffline(false);
        console.log('✅ Backend is online and responding');
      } else {
        setBackendStatus('online');
        setIsOffline(false);
        console.log('✅ Backend is online');
      }
    } catch (error) {
      console.error('❌ Backend connection error:', error);
      setBackendStatus('offline');
      setIsOffline(true);
    }
  };

  const redirectBasedOnUserType = (role) => {
    switch (role) {
      case 'admin':
        navigate('/dashboard'); // Use the main dashboard route
        break;
      case 'doctor':
        navigate('/doctor'); // Use the existing doctor route
        break;
      case 'pharmacist':
        navigate('/pharmacy'); // Use the existing pharmacy route
        break;
      case 'lab_technician':
        navigate('/lab-tests'); // Use the existing lab-tests route
        break;
      case 'receptionist':
        navigate('/patients'); // Use the existing patients route
        break;
      default:
        navigate('/dashboard'); // Default to main dashboard
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), 
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Login successful! Redirecting...');
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        setTimeout(() => {
          redirectBasedOnUserType(data.user.role);
        }, 1000);
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleForgotPassword = () => {
    toast({
      title: 'Password Reset',
      description: 'Password reset functionality will be available soon. Please contact your administrator.',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  const features = [
    {
      icon: FaPills,
      title: 'e-Rx in 14 Regional Languages',
      description: 'Prescribe in multiple regional languages for better patient understanding',
      color: 'blue'
    },
    {
      icon: FaUmbrella,
      title: 'Free Medico-Legal Insurance',
      description: 'Comprehensive protection for medical professionals',
      color: 'green'
    },
    {
      icon: FaGift,
      title: 'Instant Payouts For Online Consultations',
      description: 'NEW: Get paid instantly for your online consultations',
      color: 'purple'
    },
    {
      icon: FaComments,
      title: 'Bulk SMS and WhatsApp Feature',
      description: 'Stay connected with patients through multiple communication channels',
      color: 'teal'
    }
  ];

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Backend Status Banner */}
      {backendStatus === 'offline' && (
        <Alert
          status="error"
          variant="solid"
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={1000}
          borderRadius={0}
        >
          <AlertIcon />
          <AlertTitle>⚠️ Backend Connection Error</AlertTitle>
          <AlertDescription>
            Cannot connect to the database server. Please ensure the backend is running on port 3001.
          </AlertDescription>
        </Alert>
      )}

      <Container maxW="7xl" py={8}>
        <Flex direction={{ base: 'column', lg: 'row' }} gap={8} align="center">
          {/* Left Side - Features */}
          <Box flex="1" textAlign="center" order={{ base: 2, lg: 1 }}>
            <Heading size="2xl" mb={6} color="blue.600">
              OPD-EMR System
            </Heading>
            <Text fontSize="lg" color="gray.600" mb={8}>
              Comprehensive Electronic Medical Records Management System
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  p={6}
                  bg={cardBg}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                  textAlign="center"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  transition="all 0.3s"
                >
                  <Icon as={feature.icon} boxSize={8} color={`${feature.color}.500`} mb={4} />
                  <Heading size="md" mb={2}>
                    {feature.title}
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    {feature.description}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>

            <Box
              p={6}
              bg={cardBg}
              borderRadius="lg"
              border="1px solid"
              borderColor={borderColor}
            >
              <Heading size="md" mb={4} color="green.600">
                System Features
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Flex align="center" justify="center">
                  <Icon as={FaHospital} color="blue.500" mr={2} />
                  <Text>Patient Management</Text>
                </Flex>
                <Flex align="center" justify="center">
                  <Icon as={FaUserMd} color="green.500" mr={2} />
                  <Text>Doctor Portal</Text>
                </Flex>
                <Flex align="center" justify="center">
                  <Icon as={FaPills} color="purple.500" mr={2} />
                  <Text>Pharmacy System</Text>
                </Flex>
                <Flex align="center" justify="center">
                  <Icon as={FaShieldAlt} color="orange.500" mr={2} />
                  <Text>Lab Management</Text>
                </Flex>
                <Flex align="center" justify="center">
                  <Icon as={FaChartLine} color="teal.500" mr={2} />
                  <Text>Billing & Reports</Text>
                </Flex>
                <Flex align="center" justify="center">
                  <Icon as={FaMobileAlt} color="pink.500" mr={2} />
                  <Text>Mobile Responsive</Text>
                </Flex>
              </SimpleGrid>
            </Box>
          </Box>

          {/* Right Side - Login Form */}
          <Box flex="1" order={{ base: 1, lg: 2 }}>
            <Box
              bg={cardBg}
              p={8}
              borderRadius="xl"
              border="1px solid"
              borderColor={borderColor}
              shadow="xl"
              maxW="md"
              mx="auto"
            >
              <VStack spacing={6}>
                <Box textAlign="center">
                  <Icon as={FaUserMd} boxSize={12} color="blue.500" mb={4} />
                  <Heading size="lg" mb={2}>
                    Welcome Back
                  </Heading>
                  <Text color="gray.600">
                    Sign in to access your OPD-EMR account
                  </Text>
                </Box>

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Username</FormLabel>
                      <InputGroup>
                        <Input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="Enter your username"
                          size="lg"
                        />
                        <InputRightElement>
                          <Icon as={FaUser} color="gray.400" />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Password</FormLabel>
                      <InputGroup>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Enter your password"
                          size="lg"
                        />
                        <InputRightElement>
                          <IconButton
                            icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                            onClick={() => setShowPassword(!showPassword)}
                            variant="ghost"
                            aria-label="Toggle password visibility"
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    {error && (
                      <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <Text>{error}</Text>
                      </Alert>
                    )}

                    {success && (
                      <Alert status="success" borderRadius="md">
                        <AlertIcon />
                        <Text>{success}</Text>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      width="100%"
                      isLoading={loading}
                      loadingText="Signing In..."
                    >
                      Sign In
                    </Button>
                  </VStack>
                </form>

                <Divider />

                <VStack spacing={3} width="100%">
                  <Button
                    variant="ghost"
                    onClick={handleForgotPassword}
                    width="100%"
                    size="sm"
                  >
                    Forgot Password?
                  </Button>
                  
                  <HStack spacing={2}>
                    <Text color="gray.600">Don't have an account?</Text>
                    <Button
                      variant="link"
                      colorScheme="blue"
                      onClick={handleRegister}
                      size="sm"
                    >
                      Sign Up
                    </Button>
                  </HStack>
                </VStack>

                {/* Backend Status Indicator */}
                <Box
                  p={3}
                  bg={backendStatus === 'online' ? 'green.50' : 'red.50'}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={backendStatus === 'online' ? 'green.200' : 'red.200'}
                  width="100%"
                >
                  <HStack justify="center" spacing={2}>
                    <Icon 
                      as={backendStatus === 'online' ? FaCheckCircle : FaHospital} 
                      color={backendStatus === 'online' ? 'green.500' : 'red.500'} 
                    />
                    <Text fontSize="sm" color={backendStatus === 'online' ? 'green.700' : 'red.700'}>
                      {backendStatus === 'online' 
                        ? '✅ Backend Connected - Real Database Authentication' 
                        : '❌ Backend Disconnected - Check Server Status'
                      }
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default LoginPage;
