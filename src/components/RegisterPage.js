import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { 
  FaUserPlus, 
  FaUserMd, 
  FaIdCardAlt, 
  FaPhone, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaHospital,
  FaStethoscope,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaArrowRight,
  FaSignInAlt
} from 'react-icons/fa';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Card,
  CardBody,
  Icon,
  Divider,
  Badge,
  SimpleGrid,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Grid,
} from './ChakraComponents';

const RegisterPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    license: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isOffline, setIsOffline] = useState(false);

  // Check if we're in production (Vercel) and set offline mode
  useEffect(() => {
    if (window.location.hostname.includes('vercel.app')) {
      setIsOffline(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.specialization || !formData.license || 
        !formData.phone || !formData.email || !formData.password || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return false;
    }
    
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (isOffline) {
      // Demo mode - simulate successful registration
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Demo registration successful! Redirecting to login...' });
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Registration successful! Please login with your credentials.' }
          });
        }, 2000);
      }, 1500);
      return;
    }
    
    try {
      const response = await api.post('/api/auth/register', {
        ...formData,
        userType: 'doctor'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Registration successful! Redirecting to login...' });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setFormData({
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiology',
      license: 'MD12345',
      phone: '+91-9876543210',
      email: 'sarah.johnson@demo.com',
      password: 'demo123',
      confirmPassword: 'demo123'
    });
  };

  const features = [
    {
      icon: FaUserMd,
      title: 'Professional Registration',
      description: 'Get verified as a healthcare professional with our secure registration process',
      color: 'blue'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Compliant',
      description: 'HIPAA compliant platform with enterprise-grade security',
      color: 'green'
    },
    {
      icon: FaStethoscope,
      title: 'Complete EMR Solution',
      description: 'Everything you need to manage your practice efficiently',
      color: 'health'
    }
  ];

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Demo Mode Banner */}
      {isOffline && (
        <Alert
          status="warning"
          variant="solid"
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={1000}
          borderRadius={0}
        >
          <AlertIcon />
          <AlertTitle>🔄 Demo Mode Active</AlertTitle>
          <AlertDescription>Backend Offline. Registration will simulate success.</AlertDescription>
        </Alert>
      )}

      <Container maxW="7xl" py={8}>
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8} alignItems="center">
          {/* Left Side - Branding & Features */}
          <Box>
            <VStack spacing={8} align="stretch">
              {/* Brand Section */}
              <VStack spacing={6} textAlign="center">
                <HStack spacing={4}>
                  <Icon as={FaHospital} w={16} h={16} color="health.500" />
                  <Heading size="2xl" color="gray.800">
                    D"EMR
                  </Heading>
                </HStack>
                <Badge colorScheme="health" variant="solid" px={4} py={2} fontSize="lg">
                  #DontLosePatients
                </Badge>
                <Text fontSize="xl" color="gray.600" maxW="md">
                  Join thousands of healthcare professionals using D"EMR for better patient care.
                </Text>
              </VStack>

              {/* Features List */}
              <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6}>
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
                          <Heading size="md" color="gray.800">
                            {feature.title}
                          </Heading>
                          <Text color="gray.600" fontSize="sm">
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

          {/* Right Side - Registration Form */}
          <Box>
            <Card shadow="2xl" borderRadius="2xl" bg="white">
              <CardBody p={8}>
                <VStack spacing={8} as="form" onSubmit={handleSubmit}>
                  {/* Form Header */}
                  <VStack spacing={4} textAlign="center">
                    <HStack spacing={3}>
                      <Icon as={FaHospital} w={8} h={8} color="health.500" />
                      <Heading size="lg" color="gray.800">D"EMR</Heading>
                    </HStack>
                    <Heading size="xl" color="gray.800">REGISTER</Heading>
                    {isOffline && (
                      <Text fontSize="sm" color="warning.600" textAlign="center">
                        Demo Mode - Form will simulate successful registration
                      </Text>
                    )}
                  </VStack>

                  {/* Message Display */}
                  {message.text && (
                    <Alert 
                      status={message.type === 'error' ? 'error' : 'success'} 
                      borderRadius="lg"
                      w="full"
                    >
                      <AlertIcon />
                      <Box>
                        <AlertTitle>
                          {message.type === 'error' ? 'Error' : 'Success'}
                        </AlertTitle>
                        <AlertDescription>{message.text}</AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {/* Registration Form */}
                  <VStack spacing={6} w="full">
                    {/* Name Field */}
                    <FormControl isRequired>
                      <FormLabel color="gray.700">
                        <HStack spacing={2}>
                          <Icon as={FaUserMd} color="gray.500" />
                          <Text>Full Name</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Dr. Sarah Johnson"
                        disabled={loading}
                        size="lg"
                        borderRadius="lg"
                        focusBorderColor="health.500"
                      />
                    </FormControl>

                    {/* Specialization Field */}
                    <FormControl isRequired>
                      <FormLabel color="gray.700">
                        <HStack spacing={2}>
                          <Icon as={FaStethoscope} color="gray.500" />
                          <Text>Specialization</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        placeholder="Cardiology"
                        disabled={loading}
                        size="lg"
                        borderRadius="lg"
                        focusBorderColor="health.500"
                      />
                    </FormControl>

                    {/* License Field */}
                    <FormControl isRequired>
                      <FormLabel color="gray.700">
                        <HStack spacing={2}>
                          <Icon as={FaIdCardAlt} color="gray.500" />
                          <Text>Medical License Number</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        type="text"
                        name="license"
                        value={formData.license}
                        onChange={handleInputChange}
                        placeholder="MD12345"
                        disabled={loading}
                        size="lg"
                        borderRadius="lg"
                        focusBorderColor="health.500"
                      />
                    </FormControl>

                    {/* Phone Field */}
                    <FormControl isRequired>
                      <FormLabel color="gray.700">
                        <HStack spacing={2}>
                          <Icon as={FaPhone} color="gray.500" />
                          <Text>Phone Number</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91-9876543210"
                        disabled={loading}
                        size="lg"
                        borderRadius="lg"
                        focusBorderColor="health.500"
                      />
                    </FormControl>

                    {/* Email Field */}
                    <FormControl isRequired>
                      <FormLabel color="gray.700">
                        <HStack spacing={2}>
                          <Icon as={FaEnvelope} color="gray.500" />
                          <Text>Email Address</Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="sarah.johnson@email.com"
                        disabled={loading}
                        size="lg"
                        borderRadius="lg"
                        focusBorderColor="health.500"
                      />
                    </FormControl>

                    {/* Password Field */}
                    <FormControl isRequired>
                      <FormLabel color="gray.700">
                        <HStack spacing={2}>
                          <Icon as={FaLock} color="gray.500" />
                          <Text>Password</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup size="lg">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="********"
                          disabled={loading}
                          minLength="6"
                          borderRadius="lg"
                          focusBorderColor="health.500"
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

                    {/* Confirm Password Field */}
                    <FormControl isRequired>
                      <FormLabel color="gray.700">
                        <HStack spacing={2}>
                          <Icon as={FaLock} color="gray.500" />
                          <Text>Confirm Password</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup size="lg">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="********"
                          disabled={loading}
                          minLength="6"
                          borderRadius="lg"
                          focusBorderColor="health.500"
                        />
                        <InputRightElement width="4.5rem">
                          <IconButton
                            h="1.75rem"
                            size="sm"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            variant="ghost"
                            color="gray.500"
                            _hover={{ bg: 'gray.100' }}
                            icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                  </VStack>

                  {/* Demo Fill Button */}
                  {isOffline && (
                    <Button
                      onClick={handleDemoFill}
                      colorScheme="gray"
                      variant="outline"
                      size="lg"
                      w="full"
                      borderRadius="lg"
                      leftIcon={<FaUserMd />}
                      disabled={loading}
                    >
                      🎯 Fill Demo Data
                    </Button>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    colorScheme="health"
                    size="lg"
                    w="full"
                    isLoading={loading}
                    loadingText="Registering..."
                    borderRadius="lg"
                    _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
                    transition="all 0.2s"
                    leftIcon={<FaUserPlus />}
                  >
                    {isOffline ? 'Demo Register' : 'Register'}
                  </Button>

                  <Divider />

                  {/* Login Link */}
                  <VStack spacing={4} w="full">
                    <Text color="gray.600" textAlign="center">
                      Already have an account?
                    </Text>
                    <Button
                      onClick={() => navigate('/login')}
                      variant="ghost"
                      colorScheme="health"
                      size="lg"
                      borderRadius="lg"
                      leftIcon={<FaSignInAlt />}
                      disabled={loading}
                    >
                      Login here
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
            
            {/* Copyright */}
            <Box textAlign="center" mt={6}>
              <Text color="gray.500" fontSize="sm">
                D"EMR © 2014-21
              </Text>
            </Box>
          </Box>
        </Grid>
      </Container>
    </Box>
  );
};

export default RegisterPage;
