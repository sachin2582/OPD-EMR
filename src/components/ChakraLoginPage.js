import React, { useState } from 'react';
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

const ChakraLoginPage = () => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const toast = useToast();

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (formData.email === 'admin@hospital.com' && formData.password === 'admin123') {
        toast({
          title: 'Login Successful',
          description: 'Welcome to OPD-EMR System',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Redirect logic here
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
