import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  SimpleGrid,
  Checkbox,
  InputGroup,
  InputLeftElement,
  Icon,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import useLabTests from '../hooks/useLabTests';

const LabTestSelector = ({ 
  selectedTests = [], 
  onTestsChange, 
  onTotalChange,
  disabled = false,
  maxSelections = null 
}) => {
  const {
    labTests,
    groupedTests,
    categories,
    loading,
    error,
    searchLabTests,
    clearError,
    refresh
  } = useLabTests();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  const { isOpen: isExpanded, onToggle: toggleExpanded } = useDisclosure();
  const toast = useToast();

  // Memoized filtered tests
  const filteredTests = useMemo(() => {
    if (searchTerm.trim()) {
      return searchResults;
    }
    
    if (selectedCategory) {
      return groupedTests[selectedCategory] || [];
    }
    
    return labTests;
  }, [searchTerm, selectedCategory, searchResults, groupedTests, labTests]);

  // Handle search
  const handleSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const result = await searchLabTests(term);
      
      if (result.success) {
        setSearchResults(result.tests);
      } else {
        setSearchError(result.error);
        setSearchResults([]);
      }
    } catch (err) {
      setSearchError(err.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle test selection
  const handleTestToggle = (test) => {
    if (disabled) return;

    const isSelected = selectedTests.some(t => t.id === test.id);
    
    if (isSelected) {
      // Remove test
      const newSelectedTests = selectedTests.filter(t => t.id !== test.id);
      onTestsChange(newSelectedTests);
    } else {
      // Check max selections
      if (maxSelections && selectedTests.length >= maxSelections) {
        toast({
          title: 'Maximum selections reached',
          description: `You can only select up to ${maxSelections} tests.`,
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
        return;
      }
      
      // Add test
      const newSelectedTests = [...selectedTests, {
        id: test.id,
        testId: test.testId,
        testName: test.testName,
        testCode: test.testCode,
        category: test.category,
        subcategory: test.subcategory,
        price: test.price,
        description: test.description,
        preparation: test.preparation,
        turnaroundTime: test.turnaroundTime
      }];
      onTestsChange(newSelectedTests);
    }
  };

  // Calculate total
  useEffect(() => {
    const total = selectedTests.reduce((sum, test) => sum + (test.price || 0), 0);
    onTotalChange(total);
  }, [selectedTests, onTotalChange]);

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchError(null);
  };

  // Clear category filter
  const clearCategory = () => {
    setSelectedCategory('');
  };

  // Handle retry
  const handleRetry = () => {
    clearError();
    refresh();
  };

  // Render test item
  const renderTestItem = (test) => {
    const isSelected = selectedTests.some(t => t.id === test.id);
    
    return (
      <Card
        key={test.id}
        size="sm"
        variant={isSelected ? "filled" : "outline"}
        bg={isSelected ? "blue.50" : "white"}
        borderColor={isSelected ? "blue.200" : "gray.200"}
        cursor={disabled ? "not-allowed" : "pointer"}
        opacity={disabled ? 0.6 : 1}
        _hover={!disabled ? { shadow: "md", borderColor: "blue.300" } : {}}
        onClick={() => handleTestToggle(test)}
      >
        <CardBody p={3}>
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1} flex={1}>
              <HStack>
                <Checkbox
                  isChecked={isSelected}
                  isDisabled={disabled}
                  onChange={() => handleTestToggle(test)}
                />
                <Text fontWeight="medium" fontSize="sm">
                  {test.testName}
                </Text>
                <Badge size="sm" colorScheme="blue">
                  {test.testCode}
                </Badge>
              </HStack>
              
              {test.description && (
                <Text fontSize="xs" color="gray.600" noOfLines={2}>
                  {test.description}
                </Text>
              )}
              
              <HStack spacing={2}>
                <Badge size="sm" colorScheme="green">
                  {test.category}
                </Badge>
                {test.subcategory && (
                  <Badge size="sm" colorScheme="purple">
                    {test.subcategory}
                  </Badge>
                )}
                <Text fontSize="xs" color="gray.500">
                  {test.turnaroundTime || '24-48 hours'}
                </Text>
              </HStack>
            </VStack>
            
            <VStack align="end" spacing={1}>
              <Text fontWeight="bold" color="green.600">
                ₹{test.price || 0}
              </Text>
              {isSelected && (
                <Badge size="sm" colorScheme="blue">
                  Selected
                </Badge>
              )}
            </VStack>
          </HStack>
        </CardBody>
      </Card>
    );
  };

  // Render category section
  const renderCategorySection = (category, tests) => (
    <Box key={category}>
      <HStack justify="space-between" mb={2}>
        <Heading size="sm" color="gray.700">
          {category} ({tests.length})
        </Heading>
        <Badge colorScheme="blue">{tests.length}</Badge>
      </HStack>
      <VStack spacing={2} align="stretch">
        {tests.map(renderTestItem)}
      </VStack>
      <Divider my={4} />
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Heading size="md">Select Laboratory Tests</Heading>
          <HStack>
            <Text fontSize="sm" color="gray.600">
              {selectedTests.length} selected
            </Text>
            {maxSelections && (
              <Text fontSize="sm" color="gray.500">
                / {maxSelections} max
              </Text>
            )}
          </HStack>
        </HStack>

        {/* Search and Filters */}
        <VStack spacing={3} align="stretch">
          <InputGroup>
            <InputLeftElement>
              <Icon as={SearchIcon} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search tests by name, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              isDisabled={disabled}
            />
          </InputGroup>

          <HStack spacing={3}>
            <Select
              placeholder="Filter by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              isDisabled={disabled}
              flex={1}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            
            {selectedCategory && (
              <Button size="sm" onClick={clearCategory} variant="outline">
                Clear
              </Button>
            )}
          </HStack>
        </VStack>

        {/* Error Display */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Failed to load lab tests!</AlertTitle>
              <AlertDescription>
                {error}
                <Button size="sm" ml={2} onClick={handleRetry}>
                  Retry
                </Button>
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {searchError && (
          <Alert status="warning">
            <AlertIcon />
            <AlertDescription>
              Search failed: {searchError}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {(loading || isSearching) && (
          <HStack justify="center" py={4}>
            <Spinner size="sm" />
            <Text fontSize="sm" color="gray.600">
              {isSearching ? 'Searching...' : 'Loading lab tests...'}
            </Text>
          </HStack>
        )}

        {/* Results */}
        {!loading && !error && (
          <Box>
            {/* Search Results */}
            {searchTerm && (
              <Box mb={6}>
                <HStack justify="space-between" mb={3}>
                  <Heading size="sm" color="gray.700">
                    Search Results ({searchResults.length})
                  </Heading>
                  <Button size="sm" onClick={clearSearch} variant="outline">
                    Clear Search
                  </Button>
                </HStack>
                
                {searchResults.length > 0 ? (
                  <VStack spacing={2} align="stretch">
                    {searchResults.map(renderTestItem)}
                  </VStack>
                ) : (
                  <Text color="gray.500" textAlign="center" py={4}>
                    No tests found for "{searchTerm}"
                  </Text>
                )}
              </Box>
            )}

            {/* Category Results */}
            {!searchTerm && (
              <Box>
                <HStack justify="space-between" mb={3}>
                  <Heading size="sm" color="gray.700">
                    {selectedCategory ? `${selectedCategory} Tests` : 'All Tests'}
                  </Heading>
                  <Button
                    size="sm"
                    onClick={toggleExpanded}
                    rightIcon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    variant="outline"
                  >
                    {isExpanded ? 'Collapse' : 'Expand'} All
                  </Button>
                </HStack>

                <Collapse in={isExpanded || selectedCategory} animateOpacity>
                  <VStack spacing={4} align="stretch">
                    {selectedCategory ? (
                      renderCategorySection(selectedCategory, filteredTests)
                    ) : (
                      Object.entries(groupedTests).map(([category, tests]) =>
                        renderCategorySection(category, tests)
                      )
                    )}
                  </VStack>
                </Collapse>
              </Box>
            )}
          </Box>
        )}

        {/* Selected Tests Summary */}
        {selectedTests.length > 0 && (
          <Card bg="blue.50" borderColor="blue.200">
            <CardHeader pb={2}>
              <Heading size="sm" color="blue.700">
                Selected Tests ({selectedTests.length})
              </Heading>
            </CardHeader>
            <CardBody pt={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                {selectedTests.map(test => (
                  <HStack key={test.id} justify="space-between">
                    <Text fontSize="sm">{test.testName}</Text>
                    <Text fontSize="sm" fontWeight="bold" color="green.600">
                      ₹{test.price}
                    </Text>
                  </HStack>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default LabTestSelector;
