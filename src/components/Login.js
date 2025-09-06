import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Icon,
  Divider,
  Link,
  useColorModeValue
} from '@chakra-ui/react';
import { FaUser, FaLock, FaSignInAlt, FaUserMd, FaShieldAlt } from 'react-icons/fa';
import api from '../config/api';

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simple validation - you can customize this
      if (formData.username === 'admin' && formData.password === 'admin') {
        // Store basic auth info
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('username', formData.username);
        
        toast({
          title: "Login Successful",
          description: "Welcome to OPD-EMR System!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
      
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg={bg} display="flex" alignItems="center" justifyContent="center" p={4}>
      <Card maxW="md" w="full" bg={cardBg} shadow="xl">
        <CardHeader textAlign="center" pb={4}>
          <VStack spacing={4}>
            <Icon as={FaUserMd} boxSize={12} color="health.500" />
            <Heading size="lg" color="health.600">
              Doctor Login
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Sign in to access your EMR dashboard
            </Text>
          </VStack>
        </CardHeader>
        
        <CardBody pt={0}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertTitle>Login Error:</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FaUser} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={FaLock} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="health"
                size="lg"
                w="full"
                leftIcon={<Icon as={FaSignInAlt} />}
                isLoading={loading}
                loadingText="Signing in..."
              >
                Sign In
              </Button>

              <Divider />

              <VStack spacing={2} textAlign="center">
                <Text fontSize="sm" color="gray.600">
                  Demo Credentials:
                </Text>
                <VStack spacing={1} fontSize="xs" color="gray.500">
                  <HStack>
                    <Icon as={FaShieldAlt} />
                    <Text>Admin: admin / admin</Text>
                  </HStack>
                </VStack>
              </VStack>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Login;