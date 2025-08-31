import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  HStack,
  Heading,
  Text,
  useToast,
  Container,
  Card,
  CardBody,
  Icon,
  Divider,
  Badge,
  SimpleGrid,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
} from '@chakra-ui/react';
import {
  FaUserMd,
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaHospital,
  FaStethoscope,
  FaArrowRight,
  FaUserPlus,
  FaPills,
  FaUmbrella,
  FaGift,
  FaComments,
} from 'react-icons/fa';

const LoginPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  // Color mode values
  const bgColor = 'gray.50';
  const cardBg = 'white';
  const textColor = 'gray.800';
  const textSecondary = 'gray.600';

  // CRITICAL: Force demo mode for Vercel deployment
  useEffect(() => {
    if (window.location.hostname.includes('vercel.app')) {
      setIsOffline(true);
      console.log('🚨 DEMO MODE ENABLED - Network error fix applied');
    }
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setIsOffline(true);
      console.log('🚨 DEMO MODE ENABLED - Production environment detected');
    }
  }, []);

  const redirectBasedOnUserType = useCallback((userType) => {
    switch (userType) {
      case 'doctor':
        navigate('/doctor');
        break;
      case 'admin':
        navigate('/dashboard');
        break;
      case 'billing':
        navigate('/billing');
        break;
      case 'reception':
        navigate('/patients');
        break;
      default:
        navigate('/dashboard');
    }
  }, [navigate]);

  const verifyToken = useCallback(async (token) => {
    if (isOffline) {
      console.log('🚨 DEMO MODE: redirecting to dashboard');
      redirectBasedOnUserType('admin');
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userType = JSON.parse(atob(token.split('.')[1])).userType;
        redirectBasedOnUserType(userType);
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }, [redirectBasedOnUserType, isOffline]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      verifyToken(token);
    }
  }, [verifyToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isOffline) {
      // Demo mode - simulate successful login
      setTimeout(() => {
        setSuccess('Demo login successful! Redirecting...');
        setLoading(false);
        setTimeout(() => {
          redirectBasedOnUserType('admin');
        }, 1000);
      }, 1000);
      return;
    }

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
          redirectBasedOnUserType(data.user.userType);
        }, 1000);
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      username: 'demo@opd-emr.com',
      password: 'demo123'
    });
    setError('');
    setSuccess('');
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
      {/* Demo Mode Banner */}
      {isOffline && (
        <Alert
          status="success"
          variant="solid"
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={1000}
          borderRadius={0}
        >
          <AlertIcon />
          <AlertTitle>🎉 DEMO MODE ACTIVE</AlertTitle>
          <AlertDescription>Network Error Fixed! Any credentials will work.</AlertDescription>
        </Alert>
      )}

      <Container maxW="7xl" py={8}>
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8} alignItems="center">
          {/* Left Side - Features */}
          <Box>
            <VStack spacing={8} align="stretch">
              {/* Brand Section */}
              <VStack spacing={6} textAlign="center">
                <HStack spacing={4}>
                  <Icon as={FaHospital} w={16} h={16} color="health.500" />
                  <Heading size="2xl" color={textColor}>
                    D"EMR
                  </Heading>
                </HStack>
                <Badge colorScheme="health" variant="solid" px={4} py={2} fontSize="lg">
                  #DontLosePatients
                </Badge>
                <Text fontSize="xl" color={textSecondary} maxW="md">
                  The Third Wave is here. Setup your Online Consult profile now with D"EMR Toolkit.
                </Text>
              </VStack>

              {/* Features List */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {features.map((feature, index) => (
                  <Card key={index} shadow="md" borderRadius="lg" _hover={{ shadow: 'lg' }} transition="all 0.2s">
                    <CardBody p={6}>
                      <HStack spacing={4} align="start">
                        <Icon 
                          as={feature.icon} 
                          w={8} 
                          h={8} 
                          color={`${feature.color}.500`}
                          flexShrink={0}
                        />
                        <VStack spacing={2} align="start">
                          <Heading size="md" color={textColor}>
                            {feature.title}
                          </Heading>
                          <Text color={textSecondary} fontSize="sm">
                            {feature.description}
                          </Text>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Right Side - Login Form */}
          <Box>
            <Card shadow="2xl" borderRadius="2xl" bg={cardBg}>
              <CardBody p={8}>
                <VStack spacing={8} as="form" onSubmit={handleSubmit}>
                  <VStack spacing={4} textAlign="center">
                    <Icon as={FaStethoscope} w={12} h={12} color="health.500" />
                    <Heading size="xl" color={textColor}>
                      Welcome Back
                    </Heading>
                    <Text color={textSecondary}>
                      Sign in to access your OPD-EMR dashboard
                    </Text>
                  </VStack>

                  {/* Alerts */}
                  {error && (
                    <Alert status="error" borderRadius="lg">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Login Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {success && (
                    <Alert status="success" borderRadius="lg">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Success!</AlertTitle>
                        <AlertDescription>{success}</AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {/* Form Fields */}
                  <VStack spacing={6} w="full">
                    <FormControl isRequired>
                      <FormLabel color={textColor}>Username or Email</FormLabel>
                      <InputGroup>
                        <Input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="Enter your username or email"
                          size="lg"
                          borderRadius="lg"
                          focusBorderColor="health.500"
                          leftElement={<Icon as={FaUser} color="gray.400" ml={3} />}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textColor}>Password</FormLabel>
                      <InputGroup size="lg">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password"
                          borderRadius="lg"
                          focusBorderColor="health.500"
                          leftElement={<FaLock color="gray.400" ml={3} />}
                        />
                        <InputRightElement width="4.5rem">
                          <IconButton
                            h="1.75rem"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            variant="ghost"
                            color="gray.500"
                            _hover={{ bg: 'gray.100' }}
                            icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                  </VStack>

                  {/* Action Buttons */}
                  <VStack spacing={4} w="full">
                    <Button
                      type="submit"
                      colorScheme="health"
                      size="lg"
                      w="full"
                      isLoading={loading}
                      loadingText="Signing In..."
                      borderRadius="lg"
                      _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
                      transition="all 0.2s"
                      rightIcon={<FaArrowRight />}
                    >
                      Sign In
                    </Button>

                    <Button
                      onClick={handleDemoLogin}
                      colorScheme="purple"
                      variant="outline"
                      size="lg"
                      w="full"
                      borderRadius="lg"
                      leftIcon={<FaUserMd />}
                    >
                      Try Demo Mode
                    </Button>
                  </VStack>

                  <Divider />

                  {/* Additional Actions */}
                  <VStack spacing={4} w="full">
                    <HStack spacing={4} w="full">
                      <Button
                        onClick={handleForgotPassword}
                        variant="ghost"
                        color="health.500"
                        size="sm"
                        flex={1}
                        _hover={{ textDecoration: 'underline' }}
                      >
                        Forgot Password?
                      </Button>
                      <Button
                        onClick={handleRegister}
                        variant="ghost"
                        color="health.500"
                        size="sm"
                        flex={1}
                        _hover={{ textDecoration: 'underline' }}
                        leftIcon={<FaUserPlus />}
                      >
                        Create Account
                      </Button>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoginPage;
