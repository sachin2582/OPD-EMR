import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  Textarea,
  Text,
  Box,
  Badge,
  useToast,
} from '../../ChakraComponents';

const StockAdjustmentForm = ({ item, onSubmit, onCancel }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    adjustmentType: 'add',
    quantity: '',
    reason: '',
    notes: '',
    reference: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (item) {
      setFormData(prev => ({
        ...prev,
        date: new Date().toISOString().split('T')[0]
      }));
    }
  }, [item]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.quantity || !formData.reason) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid quantity',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Calculate adjustment amount
    const adjustment = formData.adjustmentType === 'add' ? quantity : -quantity;
    
    // Check if removal would result in negative stock
    if (formData.adjustmentType === 'remove' && (item.stock - quantity) < 0) {
      toast({
        title: 'Validation Error',
        description: 'Cannot remove more stock than available',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onSubmit(item.id, adjustment, formData.reason);
  };

  const adjustmentTypes = [
    { value: 'add', label: 'Add Stock', color: 'green' },
    { value: 'remove', label: 'Remove Stock', color: 'red' },
    { value: 'adjust', label: 'Adjust to Specific Amount', color: 'blue' }
  ];

  const reasons = [
    'Purchase Order Received',
    'Return from Customer',
    'Damaged/Expired Items',
    'Inventory Count Adjustment',
    'Theft/Loss',
    'Transfer In',
    'Transfer Out',
    'Sample/Donation',
    'Quality Control',
    'System Correction',
    'Manual Count',
    'Other'
  ];

  const getNewStock = () => {
    if (!item || !formData.quantity) return item?.stock || 0;
    
    const quantity = parseFloat(formData.quantity);
    if (formData.adjustmentType === 'add') {
      return item.stock + quantity;
    } else if (formData.adjustmentType === 'remove') {
      return Math.max(0, item.stock - quantity);
    } else if (formData.adjustmentType === 'adjust') {
      return quantity;
    }
    return item.stock;
  };

  if (!item) {
    return (
      <Box textAlign="center" py={8}>
        <Text>No item selected for stock adjustment</Text>
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {/* Item Information */}
        <Box p={4} bg="gray.50" borderRadius="md">
          <VStack spacing={2} align="start">
            <Text fontWeight="bold" fontSize="lg">{item.name}</Text>
            <HStack spacing={4}>
              <Badge colorScheme="blue">{item.category}</Badge>
              <Badge colorScheme="green">{item.supplier}</Badge>
            </HStack>
            <HStack spacing={6}>
              <Text><strong>Current Stock:</strong> {item.stock} {item.unit}</Text>
              <Text><strong>Min Stock:</strong> {item.minStock} {item.unit}</Text>
              <Text><strong>Location:</strong> {item.location}</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Adjustment Type */}
        <FormControl isRequired>
          <FormLabel>Adjustment Type</FormLabel>
          <Select
            value={formData.adjustmentType}
            onChange={(e) => handleChange('adjustmentType', e.target.value)}
          >
            {adjustmentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </FormControl>

        {/* Quantity */}
        <FormControl isRequired>
          <FormLabel>
            {formData.adjustmentType === 'add' ? 'Quantity to Add' :
             formData.adjustmentType === 'remove' ? 'Quantity to Remove' :
             'New Stock Level'} ({item.unit})
          </FormLabel>
          <NumberInput min={0} precision={0} value={formData.quantity}>
            <NumberInputField
              placeholder="Enter quantity"
              onChange={(e) => handleChange('quantity', e.target.value)}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        {/* New Stock Preview */}
        <Box p={3} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
          <HStack justify="space-between">
            <Text fontWeight="bold">New Stock Level:</Text>
            <Badge colorScheme={getNewStock() >= item.minStock ? 'green' : 'red'} fontSize="md">
              {getNewStock()} {item.unit}
            </Badge>
          </HStack>
          {getNewStock() < item.minStock && (
            <Text color="red.600" fontSize="sm" mt={1}>
              ⚠️ Stock will be below minimum level
            </Text>
          )}
        </Box>

        {/* Reason */}
        <FormControl isRequired>
          <FormLabel>Reason for Adjustment</FormLabel>
          <Select
            placeholder="Select reason"
            value={formData.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
          >
            {reasons.map(reason => (
              <option key={reason} value={reason}>{reason}</option>
            ))}
          </Select>
        </FormControl>

        {/* Reference */}
        <FormControl>
          <FormLabel>Reference Number</FormLabel>
          <Input
            placeholder="Enter PO number, invoice, or other reference"
            value={formData.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
          />
        </FormControl>

        {/* Date */}
        <FormControl>
          <FormLabel>Adjustment Date</FormLabel>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
        </FormControl>

        {/* Additional Notes */}
        <FormControl>
          <FormLabel>Additional Notes</FormLabel>
          <Textarea
            placeholder="Enter any additional details about this adjustment"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
          />
        </FormControl>

        {/* Action Buttons */}
        <HStack spacing={4} justify="flex-end">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            colorScheme={formData.adjustmentType === 'add' ? 'green' : 
                        formData.adjustmentType === 'remove' ? 'red' : 'blue'} 
            type="submit"
          >
            {formData.adjustmentType === 'add' ? 'Add Stock' :
             formData.adjustmentType === 'remove' ? 'Remove Stock' :
             'Adjust Stock'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

export default StockAdjustmentForm;
