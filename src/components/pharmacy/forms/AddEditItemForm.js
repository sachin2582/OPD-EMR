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
  Switch,
  Text,
  SimpleGrid,
  useToast,
} from '../../ChakraComponents';

const AddEditItemForm = ({ item, onSubmit, onCancel }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    costPrice: '',
    price: '',
    minStock: '',
    reorderPoint: '',
    maxStock: '',
    unit: '',
    barcode: '',
    location: '',
    supplier: '',
    expiryDate: '',
    prescription: false,
    taxRate: '',
    notes: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        description: item.description || '',
        costPrice: item.costPrice || '',
        price: item.price || '',
        minStock: item.minStock || '',
        reorderPoint: item.reorderPoint || '',
        maxStock: item.maxStock || '',
        unit: item.unit || '',
        barcode: item.barcode || '',
        location: item.location || '',
        supplier: item.supplier || '',
        expiryDate: item.expiryDate || '',
        prescription: item.prescription || false,
        taxRate: item.taxRate || '',
        notes: item.notes || ''
      });
    }
  }, [item]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category || !formData.price) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onSubmit(formData);
  };

  const categories = [
    'Pain Relief',
    'Antibiotics',
    'Gastric',
    'Cardiovascular',
    'Diabetes',
    'Respiratory',
    'Dermatology',
    'Neurology',
    'Oncology',
    'Pediatrics',
    'Gynecology',
    'Ophthalmology',
    'ENT',
    'Orthopedics',
    'Psychiatry',
    'Emergency Medicine',
    'Surgical Supplies',
    'Medical Devices',
    'Laboratory',
    'Nutrition',
    'Vitamins',
    'Herbal Supplements',
    'OTC Products',
    'Prescription Only'
  ];

  const units = [
    'Tablets',
    'Capsules',
    'Liquid (ml)',
    'Injection (ml)',
    'Cream (g)',
    'Ointment (g)',
    'Drops',
    'Inhaler',
    'Suppository',
    'Patch',
    'Powder (g)',
    'Suspension (ml)',
    'Syrup (ml)',
    'Granules (g)',
    'Lozenges',
    'Gel (g)',
    'Spray',
    'Wipes',
    'Bandages',
    'Tape (m)',
    'Gauze (m²)',
    'Catheters',
    'Syringes',
    'Needles',
    'Tubes',
    'Bottles',
    'Boxes',
    'Packs',
    'Units'
  ];

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {/* Basic Information */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Item Name</FormLabel>
            <Input
              placeholder="Enter item name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Category</FormLabel>
            <Select
              placeholder="Select category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </FormControl>
        </SimpleGrid>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            placeholder="Enter item description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
          />
        </FormControl>

        {/* Pricing Information */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Cost Price ($)</FormLabel>
            <NumberInput min={0} precision={2} value={formData.costPrice}>
              <NumberInputField
                placeholder="0.00"
                onChange={(e) => handleChange('costPrice', e.target.value)}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Selling Price ($)</FormLabel>
            <NumberInput min={0} precision={2} value={formData.price}>
              <NumberInputField
                placeholder="0.00"
                onChange={(e) => handleChange('price', e.target.value)}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          
          <FormControl>
            <FormLabel>Tax Rate (%)</FormLabel>
            <NumberInput min={0} max={100} precision={1} value={formData.taxRate}>
              <NumberInputField
                placeholder="0.0"
                onChange={(e) => handleChange('taxRate', e.target.value)}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </SimpleGrid>

        {/* Stock Management */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Min Stock Level</FormLabel>
            <NumberInput min={0} value={formData.minStock}>
              <NumberInputField
                placeholder="0"
                onChange={(e) => handleChange('minStock', e.target.value)}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          
          <FormControl>
            <FormLabel>Reorder Point</FormLabel>
            <NumberInput min={0} value={formData.reorderPoint}>
              <NumberInputField
                placeholder="0"
                onChange={(e) => handleChange('reorderPoint', e.target.value)}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          
          <FormControl>
            <FormLabel>Max Stock Level</FormLabel>
            <NumberInput min={0} value={formData.maxStock}>
              <NumberInputField
                placeholder="0"
                onChange={(e) => handleChange('maxStock', e.target.value)}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Unit</FormLabel>
            <Select
              placeholder="Select unit"
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
            >
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </Select>
          </FormControl>
        </SimpleGrid>

        {/* Additional Information */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel>Barcode</FormLabel>
            <Input
              placeholder="Enter barcode number"
              value={formData.barcode}
              onChange={(e) => handleChange('barcode', e.target.value)}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Location</FormLabel>
            <Input
              placeholder="e.g., Shelf A1, Storage Room"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </FormControl>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel>Supplier</FormLabel>
            <Input
              placeholder="Enter supplier name"
              value={formData.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Expiry Date</FormLabel>
            <Input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
            />
          </FormControl>
        </SimpleGrid>

        {/* Prescription and Notes */}
        <FormControl>
          <FormLabel>Prescription Required</FormLabel>
          <HStack spacing={4}>
            <Switch
              isChecked={formData.prescription}
              onChange={(e) => handleChange('prescription', e.target.checked)}
            />
            <Text>{formData.prescription ? 'Yes' : 'No'}</Text>
          </HStack>
        </FormControl>

        <FormControl>
          <FormLabel>Additional Notes</FormLabel>
          <Textarea
            placeholder="Enter any additional notes or special instructions"
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
          <Button colorScheme="blue" type="submit">
            {item ? 'Update Item' : 'Add Item'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

export default AddEditItemForm;
