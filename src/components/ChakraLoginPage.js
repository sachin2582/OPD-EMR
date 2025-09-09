import React, { useState } from 'react';
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
  Heading,
  Text,
  useToast,
  Container,
  Card,
  CardBody,
  Icon,
  HStack,
  Divider,
  Link,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaHospital } from 'react-icons/fa';
import appConfig from '../config/appConfig';

const ChakraLoginPage = () => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const toast = useToast();
  const navigate = useNavigate();

  const handleClick = () => setShow(!show);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the actual login API
      const response = await fetch(`${appConfig.apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.email, // Using email as username
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store user data in localStorage for session management
        const userData = {
          email: formData.email,
          name: data.data.user.fullName || data.data.user.username,
          role: data.data.user.role,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', data.data.user.role);
        localStorage.setItem('username', data.data.user.username);
        localStorage.setItem('userId', data.data.user.id);
        
        toast({
          title: 'Login Successful',
          description: `Welcome ${data.data.user.fullName || data.data.user.username}!`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="md">
        <VStack spacing={8}>
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Icon as={FaHospital} w={12} h={12} color="health.500" />
            <Heading size="xl" color="gray.800">
              OPD-EMR System
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Hospital Management & Patient Care
            </Text>
          </VStack>

          {/* Login Card */}
          <Card w="full" shadow="lg" borderRadius="xl">
            <CardBody p={8}>
              <VStack spacing={6} as="form" onSubmit={handleSubmit}>
                <Heading size="md" color="gray.700" textAlign="center">
                  Sign In
                </Heading>

                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <FormControl isRequired>
                  <FormLabel color="gray.700">
                    <HStack spacing={2}>
                      <Icon as={FaUser} color="gray.500" />
                      <Text>Email Address</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    size="lg"
                    borderRadius="md"
                    focusBorderColor="health.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.700">
                    <HStack spacing={2}>
                      <Icon as={FaLock} color="gray.500" />
                      <Text>Password</Text>
                    </HStack>
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={show ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      borderRadius="md"
                      focusBorderColor="health.500"
                    />
                    <InputRightElement width="4.5rem">
                      <Button
                        h="1.75rem"
                        size="sm"
                        onClick={handleClick}
                        variant="ghost"
                        color="gray.500"
                        _hover={{ bg: 'gray.100' }}
                      >
                        {show ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="health"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Signing In..."
                  borderRadius="md"
                  _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Sign In
                </Button>

                <Divider />

                <VStack spacing={3} w="full">
                  <Link color="health.500" fontSize="sm" _hover={{ textDecoration: 'underline' }}>
                    Forgot Password?
                  </Link>
                  <HStack spacing={1} fontSize="sm">
                    <Text color="gray.600">Don't have an account?</Text>
                    <Link color="health.500" _hover={{ textDecoration: 'underline' }}>
                      Contact Administrator
                    </Link>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Footer */}
          <Text color="gray.500" fontSize="sm" textAlign="center">
            © 2024 OPD-EMR System. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default ChakraLoginPage;
