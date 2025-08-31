import React, { useState } from 'react';
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
  useToast,
} from '../../ChakraComponents';

const AddSupplierForm = ({ onSubmit, onCancel }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    website: '',
    paymentTerms: '',
    creditLimit: '',
    taxId: '',
    rating: '',
    notes: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.contactPerson || !formData.email) {
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

  const paymentTerms = [
    'Net 30',
    'Net 45',
    'Net 60',
    'Net 90',
    'Due on Receipt',
    '2/10 Net 30',
    '1/15 Net 45',
    'COD',
    'Advance Payment',
    'Letter of Credit'
  ];

  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Germany',
    'France',
    'Italy',
    'Spain',
    'Netherlands',
    'Belgium',
    'Switzerland',
    'Austria',
    'Sweden',
    'Norway',
    'Denmark',
    'Finland',
    'Poland',
    'Czech Republic',
    'Hungary',
    'Romania',
    'Bulgaria',
    'Greece',
    'Portugal',
    'Ireland',
    'Luxembourg',
    'Malta',
    'Cyprus',
    'Estonia',
    'Latvia',
    'Lithuania',
    'Slovenia',
    'Slovakia',
    'Croatia',
    'Australia',
    'New Zealand',
    'Japan',
    'South Korea',
    'China',
    'India',
    'Brazil',
    'Mexico',
    'Argentina',
    'Chile',
    'Colombia',
    'Peru',
    'Venezuela',
    'Uruguay',
    'Paraguay',
    'Ecuador',
    'Bolivia',
    'Guyana',
    'Suriname',
    'Other'
  ];

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {/* Basic Information */}
        <FormControl isRequired>
          <FormLabel>Supplier Name</FormLabel>
          <Input
            placeholder="Enter supplier company name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Contact Person</FormLabel>
          <Input
            placeholder="Enter primary contact person name"
            value={formData.contactPerson}
            onChange={(e) => handleChange('contactPerson', e.target.value)}
          />
        </FormControl>

        {/* Contact Information */}
        <HStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </FormControl>
        </HStack>

        <FormControl>
          <FormLabel>Website</FormLabel>
          <Input
            type="url"
            placeholder="Enter website URL"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
          />
        </FormControl>

        {/* Address Information */}
        <FormControl>
          <FormLabel>Street Address</FormLabel>
          <Input
            placeholder="Enter street address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
        </FormControl>

        <HStack spacing={4}>
          <FormControl>
            <FormLabel>City</FormLabel>
            <Input
              placeholder="Enter city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>State/Province</FormLabel>
            <Input
              placeholder="Enter state or province"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>ZIP/Postal Code</FormLabel>
            <Input
              placeholder="Enter ZIP or postal code"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
            />
          </FormControl>
        </HStack>

        <FormControl>
          <FormLabel>Country</FormLabel>
          <Select
            placeholder="Select country"
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
          >
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </Select>
        </FormControl>

        {/* Business Information */}
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Payment Terms</FormLabel>
            <Select
              placeholder="Select payment terms"
              value={formData.paymentTerms}
              onChange={(e) => handleChange('paymentTerms', e.target.value)}
            >
              {paymentTerms.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>Credit Limit ($)</FormLabel>
            <NumberInput min={0} precision={2} value={formData.creditLimit}>
              <NumberInputField
                placeholder="0.00"
                onChange={(e) => handleChange('creditLimit', e.target.value)}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </HStack>

        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Tax ID</FormLabel>
            <Input
              placeholder="Enter tax identification number"
              value={formData.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Rating</FormLabel>
            <Select
              placeholder="Select rating"
              value={formData.rating}
              onChange={(e) => handleChange('rating', e.target.value)}
            >
              <option value="5">5 Stars - Excellent</option>
              <option value="4">4 Stars - Very Good</option>
              <option value="3">3 Stars - Good</option>
              <option value="2">2 Stars - Fair</option>
              <option value="1">1 Star - Poor</option>
            </Select>
          </FormControl>
        </HStack>

        {/* Additional Notes */}
        <FormControl>
          <FormLabel>Additional Notes</FormLabel>
          <Textarea
            placeholder="Enter any additional notes about the supplier"
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
          <Button colorScheme="green" type="submit">
            Add Supplier
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

export default AddSupplierForm;
