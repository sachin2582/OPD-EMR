import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { FaPrescription, FaPrint, FaSave, FaArrowLeft, FaPlus, FaTrash, FaStethoscope, FaPills, FaNotesMedical, FaUser, FaHeartbeat, FaFlask } from 'react-icons/fa';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Flex,
  Spacer,
  Icon,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Container,
  Grid,
  GridItem,
  Avatar,
  Tag,
  TagLabel,
  TagLeftIcon,
  useToast,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  CheckboxGroup,
  Stack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Switch,
  Radio,
  RadioGroup,
  RadioStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  Editable,
  EditablePreview,
  EditableInput,
  EditableTextarea,
  Code,
  Kbd,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Link,
  LinkBox,
  LinkOverlay,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  CloseButton,
  Portal,
  useBreakpointValue,
  useMediaQuery,
  useClipboard,
  useDisclosure as useDisclosureHook
} from '@chakra-ui/react';
import './EPrescription.css';

const EPrescription = () => {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Debug logging
  console.log('🔍 EPrescription component mounted with patientId:', patientId);
  console.log('🔍 Location state:', location.state);
  
  // Color mode values
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [patientData, setPatientData] = useState(null);
  const [clinicData, setClinicData] = useState(null);
  const [mode, setMode] = useState('new');
  const [prescription, setPrescription] = useState({
    prescriptionId: '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    symptoms: '',
    examination: '',
    medications: [],
    instructions: '',
    followUp: '',
    doctorName: 'Dr. [Your Name]',
    doctorSpecialization: 'General Physician',
    doctorLicense: 'MD[Your License]',
    notes: '',
    status: 'in-progress'
  });

  const [pastPrescriptions, setPastPrescriptions] = useState([]);
  const [showPastPrescriptions, setShowPastPrescriptions] = useState(false);

  // Debug logging after state is defined
  console.log('🔍 Current pastPrescriptions state:', pastPrescriptions);
  console.log('🔍 Current pastPrescriptions length:', pastPrescriptions.length);
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  
  // New state for dynamic lab tests from database
  const [labTestsFromDB, setLabTestsFromDB] = useState([]);
  const [labTestCategories, setLabTestCategories] = useState([]);
  const [labTestsLoading, setLabTestsLoading] = useState(true);
  const [labTestsError, setLabTestsError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTests, setFilteredTests] = useState([]);
  
  // ICD-10 functionality
  const [icd10Codes, setIcd10Codes] = useState([]);
  const [icd10SearchTerm, setIcd10SearchTerm] = useState('');
  const [filteredIcd10Codes, setFilteredIcd10Codes] = useState([]);
  const [selectedIcd10Codes, setSelectedIcd10Codes] = useState([]);
  const [icd10Loading, setIcd10Loading] = useState(false);
  
  // Dose patterns functionality
  const [dosePatterns, setDosePatterns] = useState([]);
  const [dosePatternsLoading, setDosePatternsLoading] = useState(false);
  const [dosePatternsError, setDosePatternsError] = useState(null);
  
  // Fallback dose patterns in case API fails
  const fallbackDosePatterns = [
    { id: 'fallback-1', pattern: '1-0-0', description: 'Once a day, morning' },
    { id: 'fallback-2', pattern: '0-0-1', description: 'Once a day, night' },
    { id: 'fallback-3', pattern: '1-0-1', description: 'Twice a day, morning and night' },
    { id: 'fallback-4', pattern: '1-1-1', description: 'Thrice a day, morning, noon, and night' },
    { id: 'fallback-5', pattern: '0.5-0-0', description: 'Half tablet once daily, morning' }
  ];
  


     // Fetch lab tests from database
   useEffect(() => {
     console.log('🚀 EPrescription component mounted - useEffect running');
     
     const fetchLabTests = async () => {
       try {
         setLabTestsLoading(true);
         
                             // Fetch ALL lab tests from the API without pagination
          let testUrl = '/api/lab-tests/tests?all=true';
          let response = await fetch(testUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          // If the 'all' parameter doesn't work, try with a very high limit
          if (!response.ok) {
            console.log('⚠️ First attempt failed, trying with high limit...');
            testUrl = '/api/lab-tests/tests?limit=10000&page=1';
            response = await fetch(testUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
          }
         
                   if (response.ok) {
            const data = await response.json();
            const tests = data.tests || [];
            
            console.log('🔍 API Response:', data);
            console.log('🧪 Total tests fetched:', tests.length);
            console.log('📊 Sample tests:', tests.slice(0, 3));
            
            // Check for duplicates in the response
            const testCodes = tests.map(t => t.testCode);
            const uniqueCodes = new Set(testCodes);
            console.log('🔍 Duplicate check:', {
              totalTests: tests.length,
              uniqueCodes: uniqueCodes.size,
              hasDuplicates: tests.length !== uniqueCodes.size
            });
            
            if (tests.length === 0) {
              setLabTestsError('No tests available in the database.');
            } else {
              // Set all tests from database
              setLabTestsFromDB(tests);
              // Initialize filteredTests with all tests
              setFilteredTests(tests);
              console.log('✅ Tests set to state:', tests.length);
              console.log('✅ Filtered tests initialized with:', tests.length, 'tests');
              
              // Try to organize tests by category and subcategory
              try {
                const organizedTests = organizeTestsByCategory(tests);
                setLabTestCategories(organizedTests);
                console.log('📁 Organized categories:', organizedTests.length);
              } catch (orgError) {
                // If organization fails, still show tests in simple list
                console.log('Test organization failed, showing simple list:', orgError);
                setLabTestCategories([]);
              }
            }
          } else {
            throw new Error(`Failed to fetch lab tests: ${response.status} ${response.statusText}`);
          }
       } catch (error) {
         setLabTestsError(`Failed to load laboratory tests: ${error.message}`);
         setLabTestsFromDB([]);
         setLabTestCategories([]);
       } finally {
         setLabTestsLoading(false);
       }
     };

                                       fetchLabTests();
           
           // Fetch ICD-10 codes
           fetchICD10Codes();
           
           // Fetch dose patterns
           fetchDosePatterns();
    }, []);
 
       // Filter tests based on search term
    useEffect(() => {
      console.log('🔍 Filter useEffect triggered:', {
        searchTerm,
        labTestsFromDBLength: labTestsFromDB.length,
        currentFilteredLength: filteredTests.length
      });
      
      if (labTestsFromDB.length > 0) {
        if (searchTerm.trim() === '') {
          setFilteredTests(labTestsFromDB);
          console.log('🔍 No search term - showing all tests:', labTestsFromDB.length);
        } else {
          const filtered = labTestsFromDB.filter(test => 
            test.testCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (test.subcategory && test.subcategory.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          setFilteredTests(filtered);
          console.log('🔍 Search term:', searchTerm, '- filtered to:', filtered.length, 'tests');
        }
      } else {
        // Initialize filteredTests when labTestsFromDB is empty
        setFilteredTests([]);
      }
    }, [searchTerm, labTestsFromDB]);

  // Filter ICD-10 codes based on search term
  useEffect(() => {
    if (icd10Codes.length > 0) {
      if (icd10SearchTerm.trim() === '') {
        setFilteredIcd10Codes(icd10Codes);
      } else {
        const filtered = icd10Codes.filter(code => 
          code.code.toLowerCase().includes(icd10SearchTerm.toLowerCase()) ||
          code.description.toLowerCase().includes(icd10SearchTerm.toLowerCase()) ||
          code.category.toLowerCase().includes(icd10SearchTerm.toLowerCase()) ||
          code.commonNames.some(name => name.toLowerCase().includes(icd10SearchTerm.toLowerCase()))
        );
        setFilteredIcd10Codes(filtered);
      }
    }
  }, [icd10SearchTerm, icd10Codes]);

  // Debug useEffect to monitor ICD-10 state changes
  useEffect(() => {
    console.log('🔍 ICD-10 State Debug:', {
      icd10Codes: icd10Codes.length,
      filteredIcd10Codes: filteredIcd10Codes.length,
      selectedIcd10Codes: selectedIcd10Codes.length,
      icd10Loading,
      icd10SearchTerm
    });
  }, [icd10Codes, filteredIcd10Codes, selectedIcd10Codes, icd10Loading, icd10SearchTerm]);

  // Function to fetch ICD-10 codes
  const fetchICD10Codes = useCallback(async () => {
    try {
      setIcd10Loading(true);
      console.log('🔍 Fetching ICD-10 codes...');
      
      let response = await fetch('/api/icd10/all');
      console.log('📡 ICD-10 API Response status:', response.status);
      
      // If proxy fails, try direct URL
      if (!response.ok) {
        console.log('⚠️ Proxy failed, trying direct URL...');
        response = await fetch('/api/icd10/all');
        console.log('📡 Direct URL Response status:', response.status);
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ ICD-10 data received:', data);
        console.log('📊 ICD-10 codes count:', data.codes?.length || 0);
        
        setIcd10Codes(data.codes || []);
        setFilteredIcd10Codes(data.codes || []);
        
        console.log('✅ ICD-10 codes set to state');
      } else {
        console.error('❌ Failed to fetch ICD-10 codes:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching ICD-10 codes:', error);
    } finally {
      setIcd10Loading(false);
      console.log('🏁 ICD-10 fetch completed');
    }
  }, []);

  // Function to fetch dose patterns
  const fetchDosePatterns = useCallback(async () => {
    try {
      setDosePatternsLoading(true);
      
      let response = await fetch('/api/dose-patterns/all');
      
      // If proxy fails, try direct URL
      if (!response.ok) {
        response = await fetch('/api/dose-patterns/all');
      }
      
      if (response.ok) {
        const data = await response.json();
        
        // Check if we have patterns in the response
        if (data.patterns && data.patterns.length > 0) {
          setDosePatterns(data.patterns);
          setDosePatternsError(null);
        } else {
          setDosePatterns(fallbackDosePatterns);
          setDosePatternsError('Using fallback patterns - no data from API');
        }
      } else {
        setDosePatternsError(`Failed to load dose patterns: ${response.status}`);
        // Use fallback patterns if API fails
        setDosePatterns(fallbackDosePatterns);
      }
    } catch (error) {
      setDosePatternsError(`Failed to load dose patterns: ${error.message}`);
      // Use fallback patterns if there's an error
      setDosePatterns(fallbackDosePatterns);
    } finally {
      setDosePatternsLoading(false);
    }
  }, []);

  // Function to organize tests by category and subcategory
  const organizeTestsByCategory = (tests) => {
    const categories = {};
    
    tests.forEach(test => {
      // Handle cases where subcategory might be null or empty
      const subcategory = test.subcategory || 'General';
      
      if (!categories[test.category]) {
        categories[test.category] = {};
      }
      
      if (!categories[test.category][subcategory]) {
        categories[test.category][subcategory] = [];
      }
      
      categories[test.category][subcategory].push({
        id: test.testCode, // Use testCode as the unique identifier
        name: test.testName,
        code: test.testCode,
        price: test.price,
        description: test.description,
        preparation: test.preparation,
        turnaroundTime: test.turnaroundTime
      });
    });

    // Convert to array format for rendering
    return Object.entries(categories).map(([category, subcategories]) => ({
      category,
      subcategories: Object.entries(subcategories).map(([subcategory, tests]) => ({
        name: subcategory,
        tests
      }))
    }));
  };

  

  const commonMedications = [
    { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: '3-5 days' },
    { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 8 hours', duration: '5-7 days' },
    { name: 'Amoxicillin', dosage: '500mg', frequency: 'Every 8 hours', duration: '7-10 days' },
    { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '4-8 weeks' }
  ];

  // Fetch patient data based on patientId from URL
  useEffect(() => {
    const fetchPatientData = async () => {
      if (patientId) {
        try {
          console.log('🚀 EPrescription: Fetching patient data for ID:', patientId);
          const response = await api.get(`/api/patients/${patientId}`);
          console.log('📡 Response status:', response.status);
          
          if (response.status === 200) {
            const data = response.data;
            console.log('✅ Patient data fetched:', data);
            console.log('📊 Patient data type:', typeof data);
            console.log('📊 Patient data keys:', Object.keys(data));
            setPatientData(data);
            setMode('new');
            
            // Initialize prescription data for new prescriptions
            const newPrescription = {
              prescriptionId: `PRESC-${Date.now().toString().slice(-6)}`,
              date: new Date().toISOString().split('T')[0],
              diagnosis: '',
              symptoms: data.chiefComplaint || '',
              examination: '',
              medications: [],
              instructions: '',
              followUp: '',
              doctorName: 'Dr. [Your Name]',
              doctorSpecialization: 'General Physician',
              doctorLicense: 'MD[Your License]',
              notes: '',
              status: 'in-progress'
            };
            setPrescription(newPrescription);
            
            // Load past prescriptions for this patient
            loadPastPrescriptions();
          } else {
            console.error('Failed to fetch patient data');
            toast({
              title: 'Error',
              description: 'Failed to load patient data',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
            navigate('/doctor');
          }
        } catch (error) {
          console.error('Error fetching patient data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load patient data',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          navigate('/doctor');
        }
      }
    };

    // If patient data is passed through location.state, use it
    if (location.state?.patientData) {
      setPatientData(location.state.patientData);
      setMode(location.state.mode || 'new');
      
      // Initialize prescription data based on mode
      if (location.state.mode === 'edit' && location.state.prescriptionData) {
        // Load existing prescription data for editing
        const existingPrescription = {
          prescriptionId: location.state.prescriptionData.prescriptionId,
          date: location.state.prescriptionData.date,
          diagnosis: location.state.prescriptionData.diagnosis || '',
          symptoms: location.state.prescriptionData.symptoms || '',
          examination: location.state.prescriptionData.examination || '',
          medications: location.state.prescriptionData.medications || [],
          instructions: location.state.prescriptionData.instructions || '',
          followUp: location.state.prescriptionData.followUp || '',
          doctorName: location.state.prescriptionData.doctorName || 'Dr. [Your Name]',
          doctorSpecialization: location.state.prescriptionData.doctorSpecialization || 'General Physician',
          doctorLicense: location.state.prescriptionData.doctorLicense || 'MD[Your License]',
          notes: location.state.prescriptionData.notes || '',
          status: location.state.prescriptionData.status || 'in-progress'
        };
        setPrescription(existingPrescription);
        
        // Load lab test recommendations if they exist
        if (location.state.prescriptionData.labTestRecommendations) {
          try {
            const labTests = JSON.parse(location.state.prescriptionData.labTestRecommendations);
            setSelectedLabTests(labTests);
          } catch (error) {
            console.warn('Failed to parse lab test recommendations:', error);
          }
        }
      } else if (location.state.mode === 'new') {
        // Initialize new prescription
        const newPrescription = {
          prescriptionId: `PRESC-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString().split('T')[0],
          diagnosis: '',
          symptoms: location.state.patientData.chiefComplaint || '',
          examination: '',
          medications: [],
          instructions: '',
          followUp: '',
          doctorName: 'Dr. [Your Name]',
          doctorSpecialization: 'General Physician',
          doctorLicense: 'MD[Your License]',
          notes: '',
          status: 'in-progress'
        };
        setPrescription(newPrescription);
      }
      
      // Load past prescriptions for this patient
      loadPastPrescriptions();
    } else if (patientId) {
      // If no patient data is passed but patientId exists, fetch it
      fetchPatientData();
    } else {
      // If no patient data and no patientId, redirect back to doctor dashboard
      navigate('/doctor');
    }
  }, [patientId, location.state, navigate, toast]);

  const loadPastPrescriptions = useCallback(async () => {
    try {
      console.log('🔄 Loading past prescriptions for patient:', patientId);
      console.log('🔄 Current mode:', mode);
      console.log('🔄 Current prescription ID:', prescription.prescriptionId);
      
      const response = await api.get(`/api/prescriptions/patient/${patientId}`);
      
      if (response.status === 200) {
        const prescriptions = response.data;
        console.log('✅ Past prescriptions loaded:', prescriptions);
        console.log('✅ Number of prescriptions found:', prescriptions.length);
        
        // Filter out the current prescription if we're editing
        const pastPrescriptions = prescriptions.filter(p => 
          mode !== 'edit' || p.prescriptionId !== prescription.prescriptionId
        );
        
        console.log('✅ Filtered past prescriptions:', pastPrescriptions);
        console.log('✅ Number of past prescriptions after filtering:', pastPrescriptions.length);
        
        setPastPrescriptions(pastPrescriptions);
      } else {
        console.warn('⚠️ Failed to load past prescriptions:', response.status);
        setPastPrescriptions([]);
      }
    } catch (error) {
      console.error('❌ Error loading past prescriptions:', error);
      setPastPrescriptions([]);
    }
  }, [patientId, mode, prescription.prescriptionId]);

  // Debug effect to monitor pastPrescriptions changes
  useEffect(() => {
    console.log('📊 pastPrescriptions state changed:', pastPrescriptions);
    console.log('📊 pastPrescriptions length:', pastPrescriptions.length);
  }, [pastPrescriptions]);

  // Fetch clinic data
  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        console.log('🏥 Fetching clinic data...');
        const response = await api.get('/api/clinic');
        console.log('📡 Response status:', response.status);
        
        if (response.status === 200) {
          const data = response.data;
          console.log('✅ Clinic data fetched:', data);
          console.log('📊 Data type:', typeof data);
          console.log('📊 Data keys:', Object.keys(data));
          
          // Handle both direct data and wrapped data formats
          if (data.success && data.data) {
            setClinicData(data.data);
            console.log('🎯 Clinic data set from data.data:', data.data);
          } else if (data.clinicName || data.id) {
            setClinicData(data);
            console.log('🎯 Clinic data set directly:', data);
          } else {
            console.log('⚠️ No valid clinic data in response');
            // Set fallback data
            setClinicData({
              clinicName: 'Your Clinic Name',
              address: 'Your Clinic Address',
              city: 'Your City',
              state: 'Your State',
              pincode: '123456',
              phone: 'Your Phone Number',
              email: 'clinic@email.com',
              website: 'www.yourclinic.com',
              license: 'CLINIC-LICENSE-001',
              prescriptionValidity: 30
            });
          }
        } else {
          console.error('❌ Failed to fetch clinic data, status:', response.status);
          // Set fallback data
          setClinicData({
            clinicName: 'Your Clinic Name',
            address: 'Your Clinic Address',
            city: 'Your City',
            state: 'Your State',
            pincode: '123456',
            phone: 'Your Phone Number',
            email: 'clinic@email.com',
            website: 'www.yourclinic.com',
            license: 'CLINIC-LICENSE-001',
            prescriptionValidity: 30
          });
        }
      } catch (error) {
        console.error('❌ Error fetching clinic data:', error);
        // Set fallback data
        setClinicData({
          clinicName: 'Your Clinic Name',
          address: 'Your Clinic Address',
          city: 'Your City',
          state: 'Your State',
          pincode: '123456',
          phone: 'Your Phone Number',
          email: 'clinic@email.com',
          website: 'www.yourclinic.com',
          license: 'CLINIC-LICENSE-001',
          prescriptionValidity: 30
        });
      }
    };

    fetchClinicData();
  }, []);

     // Load existing prescription data if editing or viewing
   useEffect(() => {
     if (mode === 'edit' || mode === 'view') {
       const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
       const existingPrescription = savedPrescriptions.find(p => 
         p.prescriptionId === prescription.prescriptionId && p.patientId === parseInt(patientId)
       );
       
               if (existingPrescription) {
          setPrescription(existingPrescription);
          if (existingPrescription.labTestRecommendations) {
            setSelectedLabTests(existingPrescription.labTestRecommendations);
          }
          if (existingPrescription.icd10Codes) {
            setSelectedIcd10Codes(existingPrescription.icd10Codes);
          }
        }
     }
   }, [mode, prescription.prescriptionId, patientId, loadPastPrescriptions]);

  const addMedication = () => {
    const newMedication = {
      id: Date.now(),
      name: '',
      type: 'TAB',
      dosage: '',
      frequency: '',
      durationValue: 1,
      durationUnit: 'Month',
      instructions: '',
      beforeMeal: false,
      afterMeal: false
    };
    setPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));
  };

  const updateMedication = (id, field, value) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.map(med => 
        med.id === id ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedication = (id) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== id)
    }));
  };

     const addCommonMedication = (med) => {
     const newMedication = {
       id: Date.now(),
       name: med.name,
       type: 'TAB',
       dosage: med.dosage,
       when: 'After Food',
       frequency: med.frequency,
       durationValue: 1,
       durationUnit: 'Month',
       instructions: '',
       beforeMeal: false,
       afterMeal: false
     };
     setPrescription(prev => ({
       ...prev,
       medications: [...prev.medications, newMedication]
     }));
   };

     const copyFromPastPrescription = (pastPrescription) => {
     if (pastPrescription.medications && pastPrescription.medications.length > 0) {
       const copiedMedications = pastPrescription.medications.map(med => ({
         ...med,
         id: Date.now() + Math.random(), // Ensure unique ID
         type: med.type || 'TAB',
         when: med.when || 'After Food',
         durationValue: med.durationValue || 1,
         durationUnit: med.durationUnit || 'Month',
         instructions: med.instructions || ''
       }));
        
              setPrescription(prev => ({
          ...prev,
          medications: [...prev.medications, ...copiedMedications],
          diagnosis: pastPrescription.diagnosis || prev.diagnosis,
          symptoms: pastPrescription.symptoms || prev.symptoms,
          instructions: pastPrescription.instructions || prev.instructions,
          followUp: pastPrescription.followUp || prev.followUp
        }));
        
                // Also copy lab test recommendations if available
         if (pastPrescription.labTestRecommendations) {
           setSelectedLabTests(pastPrescription.labTestRecommendations);
         }
         
         // Also copy ICD-10 codes if available
         if (pastPrescription.icd10Codes) {
           setSelectedIcd10Codes(pastPrescription.icd10Codes);
         }
        
        alert('Medications and details copied from previous prescription!');
     }
   };

  const handleSave = async () => {
    // Validate required fields
    if (!prescription.diagnosis || prescription.diagnosis.trim() === '') {
      alert('Please fill in the diagnosis field.');
      return;
    }
    
    if (prescription.medications.length === 0) {
      alert('Please add at least one medication.');
      return;
    }
    
    // Validate that all medications have required fields
    const invalidMedications = prescription.medications.filter(med => 
      !med.name || !med.dosage || !med.frequency || !med.durationValue || !med.durationUnit
    );
    
    if (invalidMedications.length > 0) {
      alert('Please fill in all required fields for medications (name, dosage, frequency, duration).');
      return;
    }

    try {
      // First, save prescription to backend database
      const prescriptionData = {
        patientId: parseInt(patientId),
        doctorId: 1, // Default doctor ID - should be replaced with actual logged-in doctor
        date: prescription.date,
        diagnosis: prescription.diagnosis,
        symptoms: prescription.symptoms,
        examination: prescription.examination,
        medications: prescription.medications,
        instructions: prescription.instructions,
        followUp: prescription.followUp,
        notes: prescription.notes
      };

      console.log('Saving prescription to backend:', prescriptionData);

      // Determine if this is a new prescription or an update
      const isUpdate = mode === 'edit' && prescription.id;
      const url = isUpdate ? `/api/prescriptions/${prescription.id}` : '/api/prescriptions';
      const method = isUpdate ? 'PUT' : 'POST';

      const prescriptionResponse = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      });

      if (!prescriptionResponse.ok) {
        const errorText = await prescriptionResponse.text();
        console.error('Failed to save prescription:', prescriptionResponse.status, errorText);
        alert(`Failed to save prescription (${prescriptionResponse.status}). Please try again.`);
        return;
      }

      const savedPrescription = await prescriptionResponse.json();
      console.log('Prescription saved successfully:', savedPrescription);

      // Handle response format for both POST and PUT
      const savedPrescriptionData = isUpdate ? savedPrescription.prescription : savedPrescription.prescription;

      // Update the current prescription state with the saved data from backend
      const updatedPrescription = {
        ...prescription,
        prescriptionId: savedPrescriptionData.prescriptionId,
        id: savedPrescriptionData.id,
        patientId: parseInt(patientId),
        patientData,
        labTestRecommendations: selectedLabTests,
        icd10Codes: selectedIcd10Codes,
        createdAt: savedPrescriptionData.createdAt,
        updatedAt: savedPrescriptionData.updatedAt,
        status: 'completed'
      };
      
      setPrescription(updatedPrescription);

      // Also save to localStorage for local reference
      const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      if (mode === 'edit') {
        const index = savedPrescriptions.findIndex(p => p.prescriptionId === prescription.prescriptionId);
        if (index !== -1) {
          savedPrescriptions[index] = updatedPrescription;
        }
      } else {
        savedPrescriptions.push(updatedPrescription);
      }
      localStorage.setItem('prescriptions', JSON.stringify(savedPrescriptions));
      
      // Create lab test orders if tests are selected
      if (selectedLabTests.length > 0) {
        await createLabTestOrders(updatedPrescription);
      }
      
      // Reload past prescriptions to show the updated list
      loadPastPrescriptions();
      
      alert('Prescription saved successfully! You can now print it.');
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Error saving prescription. Please try again.');
    }
  };

  // Function to create lab test orders
  const createLabTestOrders = async (prescriptionData) => {
    try {
      if (!selectedLabTests || selectedLabTests.length === 0) {
        console.log('No lab tests selected, skipping order creation');
        return;
      }

      console.log('Creating lab test orders for:', selectedLabTests);
      
      // Get test details for selected lab tests
      const testDetails = selectedLabTests.map(testId => {
        // Find test in the database data
        const test = labTestsFromDB.find(t => t.testCode === testId);
        
        if (test) {
          return {
            testId: test.id, // Use the database ID, not testCode
            testName: test.testName,
            testCode: test.testCode,
            clinicalNotes: prescriptionData.diagnosis || '',
            instructions: prescriptionData.instructions || ''
          };
        } else {
          console.warn(`Test not found for ID: ${testId}`);
          return {
            testId: testId,
            testName: testId,
            testCode: testId,
            clinicalNotes: prescriptionData.diagnosis || '',
            instructions: prescriptionData.instructions || ''
          };
        }
      });

      console.log('Test details prepared:', testDetails);

      // Create lab test order using the prescription ID from backend
      const orderData = {
        prescriptionId: prescriptionData.id, // Use the database ID from backend
        patientId: parseInt(patientId),
        doctorId: 1, // Default doctor ID - should be replaced with actual logged-in doctor
        tests: testDetails,
        clinicalNotes: prescriptionData.diagnosis || '',
        instructions: prescriptionData.instructions || '',
        priority: 'routine'
      };

      console.log('Sending order data:', orderData);

      const response = await fetch('/api/lab-tests/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const orderResult = await response.json();
        console.log('Lab test order created successfully:', orderResult);
        alert(`Lab test order created successfully! Order ID: ${orderResult.orderId}`);
      } else {
        const errorText = await response.text();
        console.error('Failed to create lab test order:', response.status, errorText);
        alert(`Prescription saved but lab test order creation failed (${response.status}). Please contact lab staff.`);
      }
    } catch (error) {
      console.error('Error creating lab test order:', error);
      alert('Prescription saved but lab test order creation failed. Please contact lab staff.');
    }
  };

  const handleNewPrescription = () => {
    const newPrescription = {
      prescriptionId: `PRESC-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      diagnosis: '',
      symptoms: patientData.chiefComplaint || '',
      examination: '',
      medications: [],
      instructions: '',
      followUp: '',
      doctorName: 'Dr. [Your Name]',
      doctorSpecialization: 'General Physician',
      doctorLicense: 'MD[Your License]',
      notes: '',
      status: 'in-progress' // Mark as in progress
    };
         setPrescription(newPrescription);
     setSelectedLabTests([]);
     setSelectedIcd10Codes([]);
     setMode('new');
  };

     // Check if prescription is ready to be saved
   const isPrescriptionReady = () => {
     return prescription.diagnosis && 
            prescription.diagnosis.trim() !== '' && 
            prescription.medications.length > 0 &&
            prescription.medications.every(med => 
              med.name && med.dosage && med.frequency && med.durationValue && med.durationUnit
            );
   };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-prescription').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        ${printContent}
      </div>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (!patientData) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="loading-spinner"></div>
        <p>Loading patient information...</p>
      </div>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <Container maxW="7xl" flex="1" p={6} pb={24}>
        <VStack spacing={6} align="stretch">
      {/* Header */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Button
                  leftIcon={<Icon as={FaArrowLeft} />}
                  variant="outline"
                  colorScheme="gray"
              onClick={() => navigate('/doctor')} 
                  alignSelf="flex-start"
            >
              Back to Doctor Dashboard
                </Button>
                
                <HStack justify="space-between" align="flex-start" w="full">
                  <VStack align="start" spacing={2}>
                    <Heading size="xl" color="health.600">
                      <HStack>
                        <Icon as={FaPrescription} />
                        <Text>
              {mode === 'new' ? 'New E-Prescription' : mode === 'edit' ? 'Edit E-Prescription' : 'View E-Prescription'}
                        </Text>
                      </HStack>
                    </Heading>
                    
                    <HStack spacing={4} wrap="wrap">
                      <Text color="gray.600" fontSize="lg">
               🆔 Patient #{patientData.patientId || patientData.id} • {patientData.firstName} {patientData.lastName} • {patientData.age} years • {patientData.gender}
                      </Text>
                      
               {pastPrescriptions.length > 0 && (
                        <Badge colorScheme="success" variant="solid" fontSize="sm">
                   🔄 Follow-up Patient ({pastPrescriptions.length} previous)
                        </Badge>
                      )}
                      
                      <Badge 
                        colorScheme={prescription.status === 'completed' ? 'success' : 'warning'} 
                        variant="solid" 
                        fontSize="sm"
                      >
                        {prescription.status === 'completed' ? '✅ Completed' : '⏳ In Progress'}
                      </Badge>
                    </HStack>
                  </VStack>
                  
                  <HStack spacing={3} wrap="wrap">
                    <Text fontSize="sm" color="gray.500">
                      💡 Use the action bar at the bottom to save, print, or create new prescriptions
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        {/* Left Column - Prescription Form */}
            <GridItem>
              <VStack spacing={6} align="stretch">
          {/* Patient Information */}
                <Card>
                  <CardHeader>
                    <Heading size="md" color="health.600">
                      <HStack>
                        <Icon as={FaUser} />
                        <Text>Patient Information</Text>
                      </HStack>
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">🆔 Patient ID</Text>
                        <Text fontWeight="semibold">#{patientData.patientId || patientData.id}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Name</Text>
                        <Text fontWeight="semibold">{patientData.firstName} {patientData.middleName} {patientData.lastName}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Age</Text>
                        <Text fontWeight="semibold">{patientData.age} years</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Gender</Text>
                        <Text fontWeight="semibold">{patientData.gender}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Blood Group</Text>
                        <Text fontWeight="semibold">{patientData.bloodGroup}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">Phone</Text>
                        <Text fontWeight="semibold">{patientData.phone}</Text>
                      </VStack>
                      <VStack align="start" spacing={1} colSpan={{ base: 1, md: 2, lg: 3 }}>
                        <Text fontSize="sm" color="gray.500">Address</Text>
                        <Text fontWeight="semibold">{patientData.address}</Text>
                      </VStack>
                    </SimpleGrid>
                  </CardBody>
                </Card>

          {/* Debug Section - Always show */}
          <div className="card" style={{ marginBottom: '1rem', backgroundColor: '#f0f8ff', border: '1px solid #007acc' }}>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#007acc' }}>🔍 Debug Information</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem' }}>
                <strong>Patient ID:</strong> {patientId}<br/>
                <strong>Past Prescriptions Count:</strong> {pastPrescriptions.length}<br/>
                <strong>Show Past Prescriptions:</strong> {showPastPrescriptions ? 'Yes' : 'No'}<br/>
                <strong>Mode:</strong> {mode}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={loadPastPrescriptions}
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#007acc', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  🔄 Reload Past Prescriptions
                </button>
                <button 
                  onClick={async () => {
                    try {
                      const response = await api.get(`/api/prescriptions/patient/${patientId}`);
                      const data = response.data;
                      console.log('🧪 Manual API Test Result:', data);
                      alert(`API returned ${data.length} prescriptions. Check console for details.`);
                    } catch (error) {
                      console.error('🧪 Manual API Test Error:', error);
                      alert('API test failed. Check console for details.');
                    }
                  }}
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  🧪 Test API Direct
                </button>
              </div>
            </div>
          </div>

          {/* Completed Prescriptions Section */}
          {pastPrescriptions.length > 0 && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section-title" style={{ margin: 0 }}>
                  <FaPrescription style={{ marginRight: '0.75rem' }} />
                  Completed Prescriptions ({pastPrescriptions.length})
                </h2>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowPastPrescriptions(!showPastPrescriptions)}
                >
                  {showPastPrescriptions ? 'Hide' : 'Show'} All Prescriptions
                </button>
              </div>
              
              {showPastPrescriptions && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {/* Show all completed prescriptions */}
                  {pastPrescriptions.map((prescription, index) => (
                      <div 
                        key={prescription.prescriptionId}
                        style={{
                          border: '1px solid var(--border-color)',
                          borderRadius: '0.5rem',
                          padding: '1rem',
                          background: 'rgba(255, 255, 255, 0.8)',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                              Prescription #{prescription.prescriptionId}
                            </h4>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                              <strong>Date:</strong> {new Date(prescription.date).toLocaleDateString()} • 
                              <strong>Diagnosis:</strong> {prescription.diagnosis || 'Not specified'}
                            </div>
                          </div>
                          {mode !== 'view' && (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => copyFromPastPrescription(prescription)}
                              title="Copy medications and details from this prescription"
                            >
                              <FaPlus style={{ marginRight: '0.25rem' }} />
                              Copy
                            </button>
                          )}
                        </div>
                        
                        {prescription.medications && prescription.medications.length > 0 && (
                          <div style={{ marginBottom: '0.75rem' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Medications:</strong>
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                              gap: '0.5rem',
                              marginTop: '0.5rem',
                              fontSize: '0.875rem'
                            }}>
                              {prescription.medications.map((med, medIndex) => (
                                <div 
                                  key={medIndex}
                                  style={{
                                    padding: '0.5rem',
                                    background: 'rgba(37, 99, 235, 0.05)',
                                    borderRadius: '0.25rem',
                                    border: '1px solid rgba(37, 99, 235, 0.1)'
                                  }}
                                >
                                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{med.name}</div>
                                  <div style={{ color: 'var(--text-secondary)' }}>
                                    {med.dosage} • {med.frequency} • {med.durationValue || 1} {med.durationUnit || 'Month'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {(prescription.instructions || prescription.followUp) && (
                          <div style={{ fontSize: '0.875rem' }}>
                            {prescription.instructions && (
                              <div style={{ marginBottom: '0.5rem' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>Instructions:</strong> {prescription.instructions}
                              </div>
                            )}
                            {prescription.followUp && (
                              <div>
                                <strong style={{ color: 'var(--text-primary)' }}>Follow-up:</strong> {prescription.followUp}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {prescription.labTestRecommendations && (
                          <div style={{ fontSize: '0.875rem', marginTop: '0.75rem' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Lab Tests:</strong>
                            <div style={{ 
                              marginTop: '0.25rem',
                              padding: '0.5rem',
                              background: 'rgba(37, 99, 235, 0.05)',
                              borderRadius: '0.25rem',
                              border: '1px solid rgba(37, 99, 235, 0.1)',
                              color: 'var(--text-secondary)'
                            }}>
                              {Array.isArray(prescription.labTestRecommendations) 
                                ? prescription.labTestRecommendations.map(testId => {
                                    // Try to find test in organized categories first
                                    let test = labTestCategories.flatMap(cat => cat.subcategories).flatMap(sub => sub.tests).find(t => t.id === testId);
                                    
                                    // If not found in organized categories, try raw data
                                    if (!test && labTestsFromDB.length > 0) {
                                      const rawTest = labTestsFromDB.find(t => t.testCode === testId);
                                      if (rawTest) {
                                        test = {
                                          id: rawTest.testCode,
                                          name: rawTest.testName,
                                          code: rawTest.testCode
                                        };
                                      }
                                    }
                                    
                                    return test ? `${test.name} (${test.code})` : testId;
                                  }).join(', ')
                                : prescription.labTestRecommendations
                              }
                            </div>
                          </div>
                        )}
                        
                        {prescription.icd10Codes && prescription.icd10Codes.length > 0 && (
                          <div style={{ fontSize: '0.875rem', marginTop: '0.75rem' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>ICD-10 Codes:</strong>
                            <div style={{ 
                              marginTop: '0.25rem',
                              padding: '0.5rem',
                              background: 'rgba(37, 99, 235, 0.05)',
                              borderRadius: '0.25rem',
                              border: '1px solid rgba(37, 99, 235, 0.1)',
                              color: 'var(--text-secondary)'
                            }}>
                              {prescription.icd10Codes.map(code => 
                                `${code.code}: ${code.description}`
                              ).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  
                  {/* Add a status badge for each prescription */}
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '0.5rem', 
                    background: 'rgba(34, 197, 94, 0.1)', 
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                    color: 'rgb(22, 163, 74)',
                    fontSize: '0.875rem'
                  }}>
                    ✅ <strong>All prescriptions completed successfully</strong>
                  </div>
                  
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '1rem', 
                    background: 'rgba(37, 99, 235, 0.05)', 
                    borderRadius: '0.5rem',
                    border: '1px dashed rgba(37, 99, 235, 0.3)'
                  }}>
                    <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      💡 <strong>Tip:</strong> Use the "Copy" button to quickly add medications and details from any previous prescription
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Prescriptions Message */}
          {pastPrescriptions.length === 0 && patientId && (
            <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#fff3cd', border: '1px solid #ffc107' }}>
              <div style={{ padding: '1rem', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>📋 No Previous Prescriptions</h3>
                <p style={{ margin: '0', fontSize: '0.875rem', color: '#856404' }}>
                  This is the first prescription for this patient.
                </p>
              </div>
            </div>
          )}

          {/* Vital Signs */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 className="section-title">
              <FaHeartbeat style={{ marginRight: '0.75rem' }} />
              Vital Signs
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div><strong>Temperature:</strong> {patientData.vitalSigns?.temperature || 'Not recorded'}</div>
              <div><strong>Blood Pressure:</strong> {patientData.vitalSigns?.bloodPressure || 'Not recorded'}</div>
              <div><strong>Pulse:</strong> {patientData.vitalSigns?.pulse || 'Not recorded'}</div>
              <div><strong>Weight:</strong> {patientData.vitalSigns?.weight || 'Not recorded'}</div>
            </div>
          </div>

                     {/* Diagnosis */}
           <div className="card" style={{ marginBottom: '2rem' }}>
             <h2 className="section-title">
               <FaStethoscope style={{ marginRight: '0.75rem' }} />
               Diagnosis & Symptoms
             </h2>
             <div className="form-group">
               <label className="form-label">Chief Complaint</label>
               <input 
                 type="text" 
                 className="form-input" 
                 value={prescription.symptoms} 
                 onChange={(e) => setPrescription(prev => ({ ...prev, symptoms: e.target.value }))}
                 disabled={mode === 'view'}
                 placeholder="Enter patient's main symptoms"
               />
             </div>
             <div className="form-group">
               <label className="form-label">Diagnosis</label>
               <input 
                 type="text" 
                 className="form-input" 
                 value={prescription.diagnosis} 
                 onChange={(e) => setPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                 disabled={mode === 'view'}
                 placeholder="Enter diagnosis"
               />
             </div>
             
                              {/* ICD-10 Codes Section */}
             <div style={{ marginTop: '1.5rem' }}>
               {/* Debug Info */}
               <div style={{ 
                 padding: '0.5rem', 
                 background: '#f0f0f0', 
                 border: '1px solid #ccc', 
                 borderRadius: '0.25rem', 
                 marginBottom: '0.5rem',
                 fontSize: '0.75rem',
                 fontFamily: 'monospace'
               }}>
                 🔍 ICD-10 Debug: Codes={icd10Codes.length} | Filtered={filteredIcd10Codes.length} | Loading={icd10Loading ? 'Yes' : 'No'}
                 <br />
                 🧪 Test Data: Backend working ✅ | Component rendered ✅ | State initialized ✅
               </div>
               
               <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                 🏷️ ICD-10 Diagnosis Codes
                 <span style={{ 
                   fontSize: '0.875rem', 
                   color: 'var(--text-secondary)', 
                   fontWeight: 'normal',
                   marginLeft: '0.5rem'
                 }}>
                   ({icd10Codes.length} codes available)
                 </span>
                 <button
                   type="button"
                   onClick={fetchICD10Codes}
                   disabled={icd10Loading}
                   style={{
                     fontSize: '0.75rem',
                     padding: '0.25rem 0.5rem',
                     marginLeft: '0.5rem',
                     background: 'var(--primary-color)',
                     color: 'white',
                     border: 'none',
                     borderRadius: '0.25rem',
                     cursor: icd10Loading ? 'not-allowed' : 'pointer'
                   }}
                 >
                   {icd10Loading ? '🔄' : '🔄 Refresh'}
                 </button>
                 <span style={{ 
                   fontSize: '0.75rem', 
                   color: 'var(--text-secondary)', 
                   fontWeight: 'normal',
                   marginLeft: '0.5rem'
                 }}>
                   [Debug: {icd10Loading ? 'Loading...' : 'Loaded'} | Filtered: {filteredIcd10Codes.length}]
                 </span>
               </h4>
               
               {/* ICD-10 Search */}
               <div style={{ marginBottom: '0.75rem' }}>
                 <div style={{ position: 'relative' }}>
                   <input
                     type="text"
                     placeholder="Search ICD-10 codes by diagnosis, symptoms, or code..."
                     className="form-input"
                     value={icd10SearchTerm}
                     onChange={(e) => setIcd10SearchTerm(e.target.value)}
                     style={{ 
                       fontSize: '0.875rem',
                       padding: '0.5rem 0.75rem',
                       paddingRight: icd10SearchTerm ? '2.5rem' : '0.75rem'
                     }}
                   />
                   {icd10SearchTerm && (
                     <button
                       type="button"
                       onClick={() => setIcd10SearchTerm('')}
                       style={{
                         position: 'absolute',
                         right: '0.5rem',
                         top: '50%',
                         transform: 'translateY(-50%)',
                         background: 'none',
                         border: 'none',
                         color: 'var(--text-secondary)',
                         cursor: 'pointer',
                         fontSize: '1rem',
                         padding: '0.25rem'
                       }}
                       title="Clear search"
                     >
                       ✕
                     </button>
                   )}
                 </div>
                 {icd10SearchTerm && (
                   <div style={{ 
                     fontSize: '0.75rem', 
                     color: 'var(--text-secondary)', 
                     marginTop: '0.25rem',
                     fontStyle: 'italic'
                   }}>
                     🔍 Found {filteredIcd10Codes.length} ICD-10 code{filteredIcd10Codes.length !== 1 ? 's' : ''} matching "{icd10SearchTerm}"
                   </div>
                 )}
               </div>
               
               {/* ICD-10 Codes List */}
               <div style={{ 
                 maxHeight: '200px', 
                 overflowY: 'auto',
                 border: '1px solid var(--border-color)',
                 borderRadius: '0.5rem',
                 padding: '0.75rem',
                 background: 'white'
               }}>
                 {icd10Loading ? (
                   <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>
                     <div className="loading-spinner"></div>
                     <p>Loading ICD-10 codes...</p>
                   </div>
                 ) : filteredIcd10Codes.length > 0 ? (
                   <div style={{ display: 'grid', gap: '0.5rem' }}>
                     {filteredIcd10Codes.slice(0, 20).map(code => {
                       const isSelected = selectedIcd10Codes.some(selected => selected.code === code.code);
                       return (
                         <div
                           key={code.code}
                           className={`icd10-option ${isSelected ? 'selected' : ''}`}
                           style={{
                             padding: '0.5rem',
                             borderRadius: '0.25rem',
                             cursor: mode === 'view' ? 'default' : 'pointer',
                             background: isSelected ? 'var(--primary-color)' : 'transparent',
                             color: isSelected ? 'white' : 'var(--text-primary)',
                             border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                             transition: 'all 0.2s ease',
                             display: 'flex',
                             justifyContent: 'space-between',
                             alignItems: 'center'
                           }}
                           onClick={() => {
                             if (mode === 'view') return;
                             
                             if (isSelected) {
                               setSelectedIcd10Codes(prev => prev.filter(c => c.code !== code.code));
                             } else {
                               setSelectedIcd10Codes(prev => [...prev, code]);
                             }
                           }}
                         >
                           <div style={{ flex: 1 }}>
                             <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                               <span style={{ 
                                 background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--primary-color)', 
                                 color: isSelected ? 'white' : 'white', 
                                 padding: '0.25rem 0.5rem', 
                                 borderRadius: '0.25rem',
                                 fontSize: '0.75rem',
                                 marginRight: '0.5rem',
                                 fontFamily: 'monospace'
                               }}>
                                 {code.code}
                               </span>
                               {code.description}
                             </div>
                             <div style={{ 
                               fontSize: '0.75rem', 
                               opacity: isSelected ? 0.9 : 0.7 
                             }}>
                               {code.category} • Common: {code.commonNames.slice(0, 2).join(', ')}
                             </div>
                           </div>
                           
                           <div style={{ 
                             fontSize: '1.25rem',
                             fontWeight: 'bold',
                             marginLeft: '0.5rem'
                           }}>
                             {isSelected ? '✓' : '○'}
                           </div>
                         </div>
                       );
                     })}
                     {filteredIcd10Codes.length > 20 && (
                       <div style={{ 
                         textAlign: 'center', 
                         padding: '0.5rem', 
                         color: 'var(--text-secondary)', 
                         fontSize: '0.75rem',
                         fontStyle: 'italic'
                       }}>
                         Showing first 20 results. Use search to find specific codes.
                       </div>
                     )}
                   </div>
                 ) : (
                   <div style={{ 
                     textAlign: 'center', 
                     padding: '1rem', 
                     color: 'var(--text-secondary)' 
                   }}>
                     {icd10Codes.length === 0 ? (
                       <div>
                         <p>No ICD-10 codes loaded from API.</p>
                         <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                           🧪 Test: If you see this message, the component is working but no data loaded.
                         </p>
                         <button
                           type="button"
                           onClick={fetchICD10Codes}
                           style={{
                             fontSize: '0.75rem',
                             padding: '0.5rem 1rem',
                             background: 'var(--primary-color)',
                             color: 'white',
                             border: 'none',
                             borderRadius: '0.25rem',
                             cursor: 'pointer',
                             marginTop: '0.5rem'
                           }}
                         >
                           🔄 Retry Load ICD-10 Codes
                         </button>
                       </div>
                     ) : (
                       'No ICD-10 codes found matching your search.'
                     )}
                   </div>
                 )}
               </div>
               
               {/* Selected ICD-10 Codes */}
               {selectedIcd10Codes.length > 0 && (
                 <div style={{ marginTop: '1rem' }}>
                   <h5 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                     Selected ICD-10 Codes ({selectedIcd10Codes.length}):
                   </h5>
                   <div style={{ display: 'grid', gap: '0.5rem' }}>
                     {selectedIcd10Codes.map(code => (
                       <div
                         key={code.code}
                         style={{
                           padding: '0.75rem',
                           background: 'rgba(37, 99, 235, 0.05)',
                           border: '1px solid rgba(37, 99, 235, 0.2)',
                           borderRadius: '0.5rem',
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center'
                         }}
                       >
                         <div>
                           <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                             <span style={{ 
                               background: 'var(--primary-color)', 
                               color: 'white', 
                               padding: '0.25rem 0.5rem', 
                               borderRadius: '0.25rem',
                               fontSize: '0.75rem',
                               marginRight: '0.5rem',
                               fontFamily: 'monospace'
                             }}>
                               {code.code}
                             </span>
                             {code.description}
                           </div>
                           <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                             {code.category}
                           </div>
                         </div>
                         
                         {mode !== 'view' && (
                           <button
                             type="button"
                             onClick={() => setSelectedIcd10Codes(prev => prev.filter(c => c.code !== code.code))}
                             style={{
                               background: 'var(--danger-color)',
                               color: 'white',
                               border: 'none',
                               borderRadius: '0.25rem',
                               padding: '0.25rem 0.5rem',
                               cursor: 'pointer',
                               fontSize: '0.75rem'
                             }}
                             title="Remove ICD-10 code"
                           >
                             ✕
                           </button>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               
               {/* ICD-10 Tips */}
               <div style={{ 
                 fontSize: '0.75rem', 
                 color: 'var(--text-secondary)', 
                 marginTop: '0.75rem',
                 padding: '0.5rem',
                 background: 'rgba(37, 99, 235, 0.05)',
                 borderRadius: '0.25rem',
                 border: '1px solid rgba(37, 99, 235, 0.1)'
               }}>
                 💡 <strong>Tip:</strong> Select relevant ICD-10 codes for proper diagnosis coding and billing. Search by symptoms, diagnosis, or code.
               </div>
             </div>
           </div>

          {/* Medications */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                             <h2 className="section-title" style={{ margin: 0 }}>
                 <FaPills style={{ marginRight: '0.75rem' }} />
                 Medicine Prescription
               </h2>
              {mode !== 'view' && (
                <button className="btn btn-primary btn-sm" onClick={addMedication}>
                  <FaPlus style={{ marginRight: '0.5rem' }} />
                  Add Medication
                </button>
              )}
            </div>

            {/* Common Medications */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Quick Add Common Medications</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
                {commonMedications.map(med => (
                  <div 
                    key={med.name}
                    className="medication-card"
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      cursor: mode === 'view' ? 'default' : 'pointer',
                      transition: 'all 0.3s ease',
                      background: 'rgba(255, 255, 255, 0.8)',
                      opacity: mode === 'view' ? 0.6 : 1
                    }}
                    onClick={() => mode !== 'view' && addCommonMedication(med)}
                  >
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{med.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {med.dosage} • {med.frequency} • {med.durationValue || 1} {med.durationUnit || 'Month'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

                         {/* Prescribed Medications Table */}
             {prescription.medications.length > 0 && (
               <div style={{ 
                 border: '1px solid var(--border-color)', 
                 borderRadius: '0.5rem', 
                 overflow: 'auto',
                 background: 'white',
                 maxWidth: '100%'
               }}>
                 <table className="medication-table">
                   <thead>
                     <tr>
                                               <th className="action-cell">#</th>
                        <th className="type-cell">Type</th>
                        <th className="medicine-cell">MEDICINE</th>
                        <th className="dose-cell">Dose</th>
                        <th className="frequency-cell">Frequency</th>
                        <th className="duration-cell">Duration</th>
                        <th className="notes-cell">Notes / Instructions</th>
                        <th className="action-cell">Action</th>
                     </tr>
                   </thead>
                                        <tbody>
                       {prescription.medications.map((med, index) => (
                         <tr key={med.id}>
                           <td className="action-cell" style={{ fontWeight: '600' }}>
                             {index + 1}
                           </td>
                           <td className="type-cell">
                           <select
                             className="form-input"
                             value={med.type || 'TAB'}
                             onChange={(e) => updateMedication(med.id, 'type', e.target.value)}
                             disabled={mode === 'view'}
                             style={{ 
                               border: 'none', 
                               background: 'transparent', 
                               width: '100%',
                               fontSize: '0.875rem',
                               padding: '0.5rem'
                             }}
                           >
                             <option value="TAB">TAB.</option>
                             <option value="CAP">CAP.</option>
                             <option value="SYRUP">SYRUP</option>
                             <option value="INJ">INJ.</option>
                             <option value="DROPS">DROPS</option>
                             <option value="CREAM">CREAM</option>
                             <option value="OINT">OINT.</option>
                           </select>
                         </td>
                         <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border-color)' }}>
                           <input 
                             type="text" 
                             className="form-input" 
                             value={med.name} 
                             onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                             disabled={mode === 'view'}
                             placeholder="Enter medicine name"
                             style={{ 
                               border: 'none', 
                               background: 'transparent', 
                               width: '100%',
                               fontSize: '0.875rem',
                               padding: '0.5rem'
                             }}
                           />
                         </td>
                                                   <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border-color)' }}>
                            <select
                              className="form-input"
                              value={med.dosage || ''}
                              onChange={(e) => updateMedication(med.id, 'dosage', e.target.value)}
                              disabled={mode === 'view'}
                              style={{ 
                                border: 'none', 
                                background: 'transparent', 
                                width: '100%',
                                fontSize: '0.875rem',
                                padding: '0.5rem'
                              }}
                            >
                              <option value="">Select dose pattern</option>
                              {dosePatternsLoading ? (
                                <option value="" disabled>Loading patterns...</option>
                              ) : dosePatternsError ? (
                                <>
                                  <option value="" disabled>Error: {dosePatternsError}</option>
                                  {fallbackDosePatterns.map(pattern => (
                                    <option key={pattern.id} value={pattern.pattern}>
                                      {pattern.pattern} ({pattern.description})
                                    </option>
                                  ))}
                                </>
                              ) : dosePatterns && dosePatterns.length > 0 ? (
                                dosePatterns.map(pattern => (
                                  <option key={pattern.id} value={pattern.pattern}>
                                    {pattern.pattern} ({pattern.description})
                                  </option>
                                ))
                              ) : (
                                fallbackDosePatterns.map(pattern => (
                                  <option key={pattern.id} value={pattern.pattern}>
                                    {pattern.pattern} ({pattern.description})
                                  </option>
                                ))
                              )}
                            </select>

                          </td>
                         
                         <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border-color)' }}>
                           <input 
                             type="text" 
                             className="form-input" 
                             value={med.frequency} 
                             onChange={(e) => updateMedication(med.id, 'frequency', e.target.value)}
                             disabled={mode === 'view'}
                             placeholder="e.g., Daily"
                             style={{ 
                               border: 'none', 
                               background: 'transparent', 
                               width: '100%',
                               fontSize: '0.875rem',
                               padding: '0.5rem'
                             }}
                           />
                         </td>
                         <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border-color)' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                             <input 
                               type="number" 
                               className="form-input" 
                               value={med.durationValue || 1} 
                               onChange={(e) => updateMedication(med.id, 'durationValue', e.target.value)}
                               disabled={mode === 'view'}
                               min="1"
                               style={{ 
                                 border: 'none', 
                                 background: 'transparent', 
                                 width: '60px',
                                 fontSize: '0.875rem',
                                 textAlign: 'center',
                                 padding: '0.5rem'
                               }}
                             />
                             <select
                               className="form-input"
                               value={med.durationUnit || 'Month'}
                               onChange={(e) => updateMedication(med.id, 'durationUnit', e.target.value)}
                               disabled={mode === 'view'}
                               style={{ 
                                 border: 'none', 
                                 background: 'transparent', 
                                 fontSize: '0.875rem',
                                 padding: '0.5rem'
                               }}
                             >
                               <option value="Day">Day</option>
                               <option value="Week">Week</option>
                               <option value="Month">Month</option>
                               <option value="Year">Year</option>
                             </select>
                           </div>
                         </td>
                         <td style={{ padding: '0.75rem', borderRight: '1px solid var(--border-color)' }}>
                           <input 
                             type="text" 
                             className="form-input" 
                             value={med.instructions || ''} 
                             onChange={(e) => updateMedication(med.id, 'instructions', e.target.value)}
                             disabled={mode === 'view'}
                             placeholder="Special instructions"
                             style={{ 
                               border: 'none', 
                               background: 'transparent', 
                               width: '100%',
                               fontSize: '0.875rem',
                               padding: '0.5rem'
                             }}
                           />
                         </td>
                         <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                           {mode !== 'view' && (
                             <button 
                               className="btn btn-danger btn-sm"
                               onClick={() => removeMedication(med.id)}
                               style={{ 
                                 padding: '0.25rem 0.5rem',
                                 fontSize: '0.75rem',
                                 minWidth: 'auto'
                               }}
                               title="Remove medication"
                             >
                               <FaTrash />
                             </button>
                           )}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}

                         {prescription.medications.length === 0 && (
               <div style={{ 
                 textAlign: 'center', 
                 padding: '2rem', 
                 color: 'var(--text-secondary)', 
                 fontStyle: 'italic',
                 border: '2px dashed var(--border-color)',
                 borderRadius: '0.5rem',
                 background: '#f8fafc'
               }}>
                 <p style={{ margin: '0' }}>No medications added yet. Click "Add Medication" to start.</p>
               </div>
             )}

             {/* Action Buttons */}
             {prescription.medications.length > 0 && mode !== 'view' && (
               <div style={{ 
                 display: 'flex', 
                 gap: '1rem', 
                 marginTop: '1rem',
                 padding: '1rem',
                 background: '#f8fafc',
                 borderRadius: '0.5rem',
                 border: '1px solid var(--border-color)'
               }}>
                 <button className="btn btn-success btn-sm">
                   <FaSave style={{ marginRight: '0.5rem' }} />
                   Save Rx-Group
                 </button>
                 <button className="btn btn-secondary btn-sm">
                   Rx-Grp
                 </button>
                 <button className="btn btn-info btn-sm">
                   Prev-Rx
                 </button>
               </div>
             )}
          </div>

          {/* Instructions */}
          <div className="card">
            <h2 className="section-title">
              <FaNotesMedical style={{ marginRight: '0.75rem' }} />
              Instructions & Follow-up
            </h2>
            <div className="form-group">
              <label className="form-label">Treatment Instructions</label>
              <textarea 
                className="form-input" 
                rows="3" 
                value={prescription.instructions} 
                onChange={(e) => setPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                disabled={mode === 'view'}
                placeholder="Enter treatment instructions for the patient"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Follow-up Instructions</label>
              <textarea 
                className="form-input" 
                rows="2" 
                value={prescription.followUp} 
                onChange={(e) => setPrescription(prev => ({ ...prev, followUp: e.target.value }))}
                disabled={mode === 'view'}
                placeholder="Enter follow-up instructions"
              />
            </div>
          </div>

          {/* Lab Test Recommendations */}
          <div className="card">
            <h2 className="section-title">
              <FaFlask style={{ marginRight: '0.75rem' }} />
              Laboratory Test Recommendations
            </h2>
            
            {labTestsLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading laboratory tests...</p>
              </div>
            ) : labTestsError ? (
              <div className="error-state">
                <p className="error-message">{labTestsError}</p>
              </div>
            ) : labTestsFromDB.length > 0 ? (
              <div>
                <div className="form-group">
                  <label className="form-label">
                    Select Recommended Tests: 
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--text-secondary)', 
                      fontWeight: 'normal',
                      marginLeft: '0.5rem'
                    }}>
                      ({labTestsFromDB.length} tests available)
                    </span>
                  </label>
                  
                  {/* Search input */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      placeholder="Search tests by name or code..."
                      className="form-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ 
                        fontSize: '0.875rem',
                        padding: '0.5rem 0.75rem'
                      }}
                    />
                  </div>
                  
                  {/* Test selection */}
                  <div style={{ 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    background: 'white'
                  }}>
                    {filteredTests.map(test => {
                      const isSelected = selectedLabTests.includes(test.testCode);
                      return (
                        <div
                          key={test.testCode}
                          style={{
                            padding: '0.5rem',
                            margin: '0.25rem 0',
                            borderRadius: '0.25rem',
                            cursor: mode === 'view' ? 'default' : 'pointer',
                            background: isSelected ? 'var(--primary-color)' : 'transparent',
                            color: isSelected ? 'white' : 'var(--text-primary)',
                            border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onClick={() => {
                            if (mode === 'view') return;
                            
                            if (isSelected) {
                              setSelectedLabTests(prev => prev.filter(id => id !== test.testCode));
                            } else {
                              setSelectedLabTests(prev => [...prev, test.testCode]);
                            }
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                              [{test.testCode}] {test.testName}
                            </div>
                            <div style={{ 
                              fontSize: '0.875rem', 
                              opacity: isSelected ? 0.9 : 0.7 
                            }}>
                              {test.category}/{test.subcategory || 'General'} • ₹{test.price}
                            </div>
                          </div>
                          
                          <div style={{ 
                            fontSize: '1.25rem',
                            fontWeight: 'bold'
                          }}>
                            {isSelected ? '✓' : '○'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Selected tests display */}
                  {selectedLabTests.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                        Selected Tests ({selectedLabTests.length}):
                      </h4>
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {selectedLabTests.map(testId => {
                          const test = labTestsFromDB.find(t => t.testCode === testId);
                          return test ? (
                            <div key={test.testCode} style={{
                              padding: '0.5rem',
                              background: 'rgba(37, 99, 235, 0.05)',
                              border: '1px solid rgba(37, 99, 235, 0.2)',
                              borderRadius: '0.25rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <span style={{ fontWeight: '600' }}>[{test.testCode}]</span> {test.testName}
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  ₹{test.price}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedLabTests(prev => prev.filter(id => id !== testId))}
                                style={{
                                  background: 'var(--danger-color)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.25rem',
                                  padding: '0.25rem 0.5rem',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                      
                      <div style={{ 
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        background: 'rgba(37, 99, 235, 0.05)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(37, 99, 235, 0.1)',
                        textAlign: 'right'
                      }}>
                        <strong style={{ fontSize: '1.1rem' }}>
                          Total Amount: ₹{selectedLabTests.reduce((total, testId) => {
                            const test = labTestsFromDB.find(t => t.testCode === testId);
                            return total + (test ? test.price : 0);
                          }, 0)}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                background: 'rgba(255, 193, 7, 0.1)', 
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 193, 7, 0.3)'
              }}>
                <p style={{ margin: '0', color: 'var(--text-secondary)' }}>
                  ⚠️ <strong>No lab tests available.</strong> The system will automatically load tests from the database.
                </p>
              </div>
            )}
          </div>
                </VStack>
              </GridItem>

        {/* Right Column - Prescription Summary */}
              <GridItem>
          <div className="card" style={{ position: 'sticky', top: '2rem' }}>
            <h2 className="section-title">
              <FaPrescription style={{ marginRight: '0.75rem' }} />
              Prescription Details
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Prescription ID:</strong> {prescription.prescriptionId}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Date:</strong> {new Date(prescription.date).toLocaleDateString()}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Doctor:</strong> {prescription.doctorName}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Specialization:</strong> {prescription.doctorSpecialization}
              </div>
            </div>

              <div style={{ borderTop: '2px solid rgba(37, 99, 235, 0.1)', paddingTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Summary</h4>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Status:</strong> 
                  <span style={{ 
                    color: prescription.status === 'completed' ? 'var(--success-color)' : 'var(--warning-color)',
                    fontWeight: '600',
                    marginLeft: '0.5rem'
                  }}>
                    {prescription.status === 'completed' ? '✅ Completed' : '⏳ In Progress'}
                  </span>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Diagnosis:</strong> {prescription.diagnosis || 'Not specified'}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Medications:</strong> {prescription.medications.length}
                </div>
                                 <div style={{ marginBottom: '0.5rem' }}>
                   <strong>Lab Tests:</strong> {selectedLabTests.length > 0 ? selectedLabTests.length + ' selected' : 'None'}
                 </div>
                 <div style={{ marginBottom: '0.5rem' }}>
                   <strong>ICD-10 Codes:</strong> {selectedIcd10Codes.length > 0 ? selectedIcd10Codes.length + ' selected' : 'None'}
                 </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Follow-up:</strong> {prescription.followUp ? 'Yes' : 'No'}
                </div>
              </div>

             {/* Past Prescriptions Summary */}
             {pastPrescriptions.length > 0 && (
               <div style={{ borderTop: '2px solid rgba(37, 99, 235, 0.1)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                 <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                   <FaPrescription style={{ marginRight: '0.5rem' }} />
                   Last Prescription
                 </h4>
                 <div style={{ marginBottom: '0.5rem' }}>
                   <strong>Date:</strong> {pastPrescriptions.length > 0 ? 
                     new Date(pastPrescriptions[pastPrescriptions.length - 1].date).toLocaleDateString() : 'None'
                   }
                 </div>
                 <div style={{ marginBottom: '0.5rem' }}>
                   <strong>Diagnosis:</strong> {pastPrescriptions.length > 0 ? 
                     pastPrescriptions[pastPrescriptions.length - 1].diagnosis || 'Not specified' : 'None'
                   }
                 </div>
                 <div style={{ marginBottom: '0.5rem' }}>
                   <strong>Follow-up Patient:</strong> {pastPrescriptions.length > 0 ? 'Yes' : 'No'}
                 </div>
                 <button 
                   className="btn btn-secondary btn-sm"
                   style={{ width: '100%', marginTop: '0.5rem' }}
                   onClick={() => setShowPastPrescriptions(!showPastPrescriptions)}
                 >
                   {showPastPrescriptions ? 'Hide' : 'View'} Last Prescription
                 </button>
               </div>
             )}

            {/* Save button moved to fixed action bar at bottom */}
            
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={handlePrint}
                style={{ width: '100%' }}
              >
                <FaPrint style={{ marginRight: '0.5rem' }} />
                Print Prescription
              </button>
            </div>
          </div>
              </GridItem>
            </Grid>

      {/* Printable Prescription */}
            <Box id="printable-prescription" display="none">
        <style>
          {`
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none !important; }
              #printable-prescription { 
                display: block !important; 
                position: relative;
                page-break-inside: avoid;
                height: 100vh;
                overflow: hidden;
              }
              .prescription-page { 
                page-break-after: avoid;
                margin: 0;
                padding: 5px;
                height: 100vh;
                box-sizing: border-box;
              }
              * {
                box-sizing: border-box;
              }
            }
          `}
        </style>
        <Box
          maxW="800px"
          mx="auto"
          p={0.5}
          border="1px solid"
          borderColor="gray.600"
          bg="white"
          position="relative"
          fontSize="6px"
          h="100vh"
          overflow="hidden"
          display="flex"
          flexDirection="column"
          fontFamily="Arial, sans-serif"
        >
          {/* Professional Header */}
          <Box
            textAlign="center"
            borderBottom="1px solid"
            borderBottomColor="blue.600"
            pb={0.5}
            mb={0.5}
            bgGradient="linear(135deg, gray.50 0%, gray.200 100%)"
            flexShrink={0}
          >
            <HStack spacing={1} justify="center" mb={0.5}>
              <Box
                w="16px"
                h="16px"
                bg="blue.600"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="sm"
              >
                <Text color="white" fontSize="8px" fontWeight="bold">🏥</Text>
              </Box>
              <VStack spacing={0} align="start">
                <Heading
                  size="sm"
                  color="gray.800"
                  fontSize="10px"
                  fontWeight="700"
                  textShadow="sm"
                  m={0}
                >
                  {clinicData?.clinicName || 'OPD-EMR HOSPITAL'}
                </Heading>
                <Text
                  fontSize="6px"
                  color="gray.600"
                  fontWeight="600"
                  m={0}
                >
                  Electronic Medical Prescription
                </Text>
              </VStack>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={0.5} mt={0.5} fontSize="5px" color="gray.500">
              <Text>
                <Text as="span" fontWeight="bold">Address:</Text> {clinicData?.address || '123 Healthcare Street'}, {clinicData?.city || 'Medical City'}, {clinicData?.state || 'MC'} {clinicData?.pincode || '12345'}
              </Text>
              <Text>
                <Text as="span" fontWeight="bold">Phone:</Text> {clinicData?.phone || '+1-555-0123'} | <Text as="span" fontWeight="bold">Email:</Text> {clinicData?.email || 'doctor@opd-emr.com'}
              </Text>
              <Text>
                <Text as="span" fontWeight="bold">Website:</Text> {clinicData?.website || 'www.opd-emr.com'} | <Text as="span" fontWeight="bold">License:</Text> {clinicData?.license || 'HOSP-2024-001'}
              </Text>
            </SimpleGrid>
          </Box>

          {/* Prescription Details Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            mb={0.5}
            p={0.5}
            bgGradient="linear(135deg, gray.100 0%, gray.200 100%)"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.300"
            flexShrink={0}
          >
            <Box flex={1}>
              <Heading
                size="xs"
                color="gray.800"
                fontSize="8px"
                fontWeight="600"
                borderBottom="1px solid"
                borderBottomColor="blue.600"
                pb={0.5}
                mb={0.5}
              >
                📋 Patient Information
              </Heading>
              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={0.5} fontSize="5px">
                <Text><Text as="span" fontWeight="bold">Name:</Text> <Text as="span" color="gray.800" fontWeight="600">{patientData.firstName} {patientData.middleName} {patientData.lastName}</Text></Text>
                <Text><Text as="span" fontWeight="bold">Age:</Text> <Text as="span" color="gray.800">{patientData.age} years</Text></Text>
                <Text><Text as="span" fontWeight="bold">Gender:</Text> <Text as="span" color="gray.800">{patientData.gender}</Text></Text>
                <Text><Text as="span" fontWeight="bold">Blood Group:</Text> <Text as="span" color="gray.800">{patientData.bloodGroup}</Text></Text>
                <Text><Text as="span" fontWeight="bold">Phone:</Text> <Text as="span" color="gray.800">{patientData.phone}</Text></Text>
                <Text><Text as="span" fontWeight="bold">Address:</Text> <Text as="span" color="gray.800">{patientData.address}</Text></Text>
              </SimpleGrid>
            </Box>
            <Box
              textAlign="right"
              flex={1}
              borderLeft="2px solid"
              borderLeftColor="gray.200"
              pl={5}
            >
              <Heading
                size="xs"
                color="gray.800"
                fontSize="8px"
                fontWeight="600"
                borderBottom="1px solid"
                borderBottomColor="blue.600"
                pb={0.5}
                mb={0.5}
              >
                📄 Prescription Details
              </Heading>
              <VStack spacing={0} align="stretch" fontSize="5px" lineHeight="1.1">
                <Text><Text as="span" fontWeight="bold">Prescription ID:</Text> <Text as="span" color="blue.600" fontWeight="600">{prescription.prescriptionId}</Text></Text>
                <Text><Text as="span" fontWeight="bold">Date:</Text> <Text as="span" color="gray.800">{new Date(prescription.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text></Text>
                <Text><Text as="span" fontWeight="bold">Time:</Text> <Text as="span" color="gray.800">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text></Text>
                <Text><Text as="span" fontWeight="bold">Doctor:</Text> <Text as="span" color="gray.800" fontWeight="600">{prescription.doctorName}</Text></Text>
                <Text><Text as="span" fontWeight="bold">Specialization:</Text> <Text as="span" color="gray.800">{prescription.doctorSpecialization}</Text></Text>
              </VStack>
            </Box>
          </Box>

          {/* Vital Signs Section */}
          <Box
            mb={0.5}
            p={0.5}
            bgGradient="linear(135deg, red.50 0%, red.100 100%)"
            borderRadius="md"
            border="1px solid"
            borderColor="red.200"
            flexShrink={0}
          >
            <Heading
              size="xs"
              color="red.800"
              fontSize="8px"
              fontWeight="600"
              borderBottom="1px solid"
              borderBottomColor="red.600"
              pb={0.5}
              mb={0.5}
            >
              💓 Vital Signs
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={0.5} fontSize="5px">
              <Box
                textAlign="center"
                p={0.5}
                bg="white"
                borderRadius="sm"
                border="1px solid"
                borderColor="red.200"
              >
                <Text fontWeight="600" color="red.800" fontSize="4px">Temperature</Text>
                <Text fontSize="6px" fontWeight="700" color="red.600">{patientData.vitalSigns?.temperature || 'N/A'}</Text>
              </Box>
              <Box
                textAlign="center"
                p={0.5}
                bg="white"
                borderRadius="sm"
                border="1px solid"
                borderColor="red.200"
              >
                <Text fontWeight="600" color="red.800" fontSize="4px">Blood Pressure</Text>
                <Text fontSize="6px" fontWeight="700" color="red.600">{patientData.vitalSigns?.bloodPressure || 'N/A'}</Text>
              </Box>
              <Box
                textAlign="center"
                p={0.5}
                bg="white"
                borderRadius="sm"
                border="1px solid"
                borderColor="red.200"
              >
                <Text fontWeight="600" color="red.800" fontSize="4px">Pulse</Text>
                <Text fontSize="6px" fontWeight="700" color="red.600">{patientData.vitalSigns?.pulse || 'N/A'}</Text>
              </Box>
              <Box
                textAlign="center"
                p={0.5}
                bg="white"
                borderRadius="sm"
                border="1px solid"
                borderColor="red.200"
              >
                <Text fontWeight="600" color="red.800" fontSize="4px">Weight</Text>
                <Text fontSize="6px" fontWeight="700" color="red.600">{patientData.vitalSigns?.weight || 'N/A'}</Text>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Diagnosis Section */}
          <Box
            mb={0.5}
            p={0.5}
            bgGradient="linear(135deg, blue.50 0%, blue.100 100%)"
            borderRadius="md"
            border="1px solid"
            borderColor="blue.200"
            flexShrink={0}
          >
            <Heading
              size="xs"
              color="blue.800"
              fontSize="8px"
              fontWeight="600"
              borderBottom="1px solid"
              borderBottomColor="blue.600"
              pb={0.5}
              mb={0.5}
            >
              🔍 Clinical Assessment
            </Heading>
            <SimpleGrid columns={2} spacing={0.5} fontSize="5px">
              <Box>
                <Text fontWeight="bold" color="blue.800">Chief Complaint:</Text>
                <Box
                  mt={0.5}
                  p={0.5}
                  bg="white"
                  borderRadius="sm"
                  border="1px solid"
                  borderColor="blue.200"
                  color="gray.800"
                  fontSize="5px"
                >
                  {prescription.symptoms || 'Not specified'}
                </Box>
              </Box>
              <Box>
                <Text fontWeight="bold" color="blue.800">Diagnosis:</Text>
                <Box
                  mt={0.5}
                  p={0.5}
                  bg="white"
                  borderRadius="sm"
                  border="1px solid"
                  borderColor="blue.200"
                  color="gray.800"
                  fontSize="5px"
                >
                  {prescription.diagnosis || 'Not specified'}
                </Box>
              </Box>
            </SimpleGrid>
          </Box>

          {/* Medications Section */}
          <Box
            mb={0.5}
            p={0.5}
            bgGradient="linear(135deg, green.50 0%, green.100 100%)"
            borderRadius="md"
            border="1px solid"
            borderColor="green.200"
            flex={1}
            overflow="hidden"
          >
            <Heading
              size="xs"
              color="green.800"
              fontSize="8px"
              fontWeight="600"
              borderBottom="1px solid"
              borderBottomColor="green.600"
              pb={0.5}
              mb={0.5}
            >
              💊 Prescribed Medications
            </Heading>
                      <Box
              maxH="80px"
              overflowY="auto"
              border="1px solid"
              borderColor="green.200"
              borderRadius="md"
            >
              <Table size="sm" variant="simple" fontSize="5px">
                <Thead>
                  <Tr bgGradient="linear(135deg, green.600 0%, green.700 100%)">
                    <Th
                      border="1px solid"
                      borderColor="green.200"
                      px={0.5}
                      py={0.5}
                      textAlign="left"
                      color="white"
                      fontWeight="600"
                      fontSize="4px"
                    >
                      Medication
                    </Th>
                    <Th
                      border="1px solid"
                      borderColor="green.200"
                      px={0.5}
                      py={0.5}
                      textAlign="center"
                      color="white"
                      fontWeight="600"
                      fontSize="4px"
                    >
                      Dosage
                    </Th>
                    <Th
                      border="1px solid"
                      borderColor="green.200"
                      px={0.5}
                      py={0.5}
                      textAlign="center"
                      color="white"
                      fontWeight="600"
                      fontSize="4px"
                    >
                      Frequency
                    </Th>
                    <Th
                      border="1px solid"
                      borderColor="green.200"
                      px={0.5}
                      py={0.5}
                      textAlign="center"
                      color="white"
                      fontWeight="600"
                      fontSize="4px"
                    >
                      Duration
                    </Th>
                  </Tr>
                </Thead>
                              <Tbody>
                  {prescription.medications.map((med, index) => (
                    <Tr
                      key={med.id}
                      bg={index % 2 === 0 ? 'gray.50' : 'white'}
                    >
                      <Td
                        border="1px solid"
                        borderColor="green.200"
                        p={0.5}
                        fontWeight="600"
                        color="green.800"
                        fontSize="4px"
                      >
                        {med.name}
                      </Td>
                      <Td
                        border="1px solid"
                        borderColor="green.200"
                        p={0.5}
                        textAlign="center"
                        color="gray.800"
                        fontSize="4px"
                      >
                        {med.dosage}
                      </Td>
                      <Td
                        border="1px solid"
                        borderColor="green.200"
                        p={0.5}
                        textAlign="center"
                        color="gray.800"
                        fontSize="4px"
                      >
                        {med.frequency}
                      </Td>
                      <Td
                        border="1px solid"
                        borderColor="green.200"
                        p={0.5}
                        textAlign="center"
                        color="gray.800"
                        fontSize="4px"
                      >
                        {med.durationValue || 1} {med.durationUnit || 'Month'}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            {prescription.medications.length === 0 && (
              <Text
                textAlign="center"
                p={1}
                color="gray.500"
                fontStyle="italic"
                fontSize="5px"
              >
                No medications prescribed
              </Text>
            )}
          </Box>

          {/* Instructions Section */}
          {(prescription.instructions || prescription.followUp) && (
            <Box
              mb={0.5}
              p={0.5}
              bgGradient="linear(135deg, yellow.50 0%, yellow.100 100%)"
              borderRadius="md"
              border="1px solid"
              borderColor="yellow.200"
              flexShrink={0}
            >
              <Heading
                size="xs"
                color="yellow.800"
                fontSize="8px"
                fontWeight="600"
                borderBottom="1px solid"
                borderBottomColor="yellow.600"
                pb={0.5}
                mb={0.5}
              >
                📝 Treatment Instructions
              </Heading>
              <SimpleGrid columns={2} spacing={0.5} fontSize="5px">
                {prescription.instructions && (
                  <Box>
                    <Text fontWeight="bold" color="yellow.800">Treatment Instructions:</Text>
                    <Box
                      mt={0.5}
                      p={0.5}
                      bg="white"
                      borderRadius="sm"
                      border="1px solid"
                      borderColor="yellow.200"
                      color="gray.800"
                      fontSize="5px"
                    >
                      {prescription.instructions}
                    </Box>
                  </Box>
                )}
                {prescription.followUp && (
                  <Box>
                    <Text fontWeight="bold" color="yellow.800">Follow-up Instructions:</Text>
                    <Box
                      mt={0.5}
                      p={0.5}
                      bg="white"
                      borderRadius="sm"
                      border="1px solid"
                      borderColor="yellow.200"
                      color="gray.800"
                      fontSize="5px"
                    >
                      {prescription.followUp}
                    </Box>
                  </Box>
                )}
              </SimpleGrid>
            </Box>
          )}

          {/* ICD-10 Codes Section */}
          {selectedIcd10Codes.length > 0 && (
            <Box
              mb={0.5}
              p={0.5}
              bgGradient="linear(135deg, yellow.50 0%, yellow.100 100%)"
              borderRadius="md"
              border="1px solid"
              borderColor="yellow.200"
              flexShrink={0}
            >
              <Heading
                size="xs"
                color="yellow.800"
                fontSize="8px"
                fontWeight="600"
                borderBottom="1px solid"
                borderBottomColor="yellow.600"
                pb={0.5}
                mb={0.5}
              >
                🏷️ ICD-10 Diagnosis Codes
              </Heading>
              <Box
                p={0.5}
                bg="white"
                borderRadius="sm"
                border="1px solid"
                borderColor="yellow.200"
                color="gray.800"
                fontSize="5px"
                lineHeight="1.1"
              >
                {selectedIcd10Codes.map(code => (
                  <Box key={code.code} mb={0.5}>
                    <Text fontWeight="bold" color="yellow.800">{code.code}:</Text> {code.description}
                    <Text
                      fontSize="4px"
                      color="gray.500"
                      mt={0.25}
                      fontStyle="italic"
                    >
                      Category: {code.category}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Lab Test Recommendations Section */}
          {selectedLabTests.length > 0 && (
            <Box
              mb={0.5}
              p={0.5}
              bgGradient="linear(135deg, blue.50 0%, blue.100 100%)"
              borderRadius="md"
              border="1px solid"
              borderColor="blue.200"
              flexShrink={0}
            >
              <Heading
                size="xs"
                color="blue.800"
                fontSize="8px"
                fontWeight="600"
                borderBottom="1px solid"
                borderBottomColor="blue.600"
                pb={0.5}
                mb={0.5}
              >
                🧪 Laboratory Test Recommendations
              </Heading>
              <Box
                p={0.5}
                bg="white"
                borderRadius="sm"
                border="1px solid"
                borderColor="blue.200"
                color="gray.800"
                fontSize="5px"
                lineHeight="1.1"
              >
                <Text>
                  {selectedLabTests.map(testId => {
                    // Try to find test in organized categories first
                    let test = labTestCategories.flatMap(cat => cat.subcategories).flatMap(sub => sub.tests).find(t => t.id === testId);
                    
                    // If not found in organized categories, try raw data
                    if (!test && labTestsFromDB.length > 0) {
                      const rawTest = labTestsFromDB.find(t => t.testCode === testId);
                      if (rawTest) {
                        test = {
                          id: rawTest.testCode,
                          name: rawTest.testName,
                          code: rawTest.testCode
                        };
                      }
                    }
                    
                    return test ? `${test.name} (${test.code})` : testId;
                  }).join(', ')}
                </Text>
              </Box>
              <Box
                mt={0.5}
                p={0.5}
                bg="blue.50"
                borderRadius="sm"
                border="1px solid"
                borderColor="blue.200"
                fontSize="4px"
                color="blue.800"
                fontStyle="italic"
              >
                <Text fontWeight="bold">Note:</Text> These are test recommendations only. Please visit the laboratory separately for test ordering and billing.
              </Box>
            </Box>
          )}

          {/* Professional Footer */}
          <Box
            borderTop="1px solid"
            borderTopColor="blue.600"
            pt={0.5}
            mt={0.5}
            display="flex"
            justifyContent="space-between"
            alignItems="flex-end"
            flexShrink={0}
          >
            <Box flex={1}>
              <Box
                borderTop="1px solid"
                borderTopColor="blue.600"
                w="120px"
                mt={1}
                mb={0.5}
              />
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={0.5} fontSize="5px">
                <Box>
                  <Text fontWeight="700" color="gray.800" fontSize="7px">{prescription.doctorName}</Text>
                  <Text color="gray.600" fontSize="5px">{prescription.doctorSpecialization}</Text>
                  <Text color="gray.500" fontSize="4px">License: {prescription.doctorLicense}</Text>
                </Box>
                <Box>
                  <Text color="gray.600" fontSize="5px">Digital Signature</Text>
                  <Text color="gray.500" fontSize="4px">Generated Electronically</Text>
                </Box>
              </SimpleGrid>
            </Box>
            <Box
              textAlign="right"
              flex={1}
              borderLeft="1px solid"
              borderLeftColor="gray.200"
              pl={1}
            >
              <Box
                bg="gray.50"
                p={0.5}
                borderRadius="sm"
                border="1px solid"
                borderColor="gray.200"
              >
                <Text fontWeight="600" color="gray.800" mb={0.5} fontSize="5px">Document Information</Text>
                <VStack spacing={0} align="stretch" fontSize="4px" color="gray.500" lineHeight="1.1">
                  <Text>Generated on: {new Date().toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</Text>
                  <Text>Prescription ID: {prescription.prescriptionId}</Text>
                  <Text>This is a computer generated prescription</Text>
                  <Text>Valid for 30 days from issue date</Text>
                </VStack>
              </Box>
            </Box>
          </Box>

          {/* Security Watermark */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%) rotate(-45deg)"
            opacity="0.03"
            fontSize="120px"
            fontWeight="bold"
            color="blue.600"
            pointerEvents="none"
            zIndex="-1"
          >
            OPD-EMR
          </Box>

          {/* Prescription Validity Stamp */}
          <Box
            position="absolute"
            bottom="5px"
            right="5px"
            bgGradient="linear(135deg, green.600 0%, green.700 100%)"
            color="white"
            px={1}
            py={0.5}
            borderRadius="full"
            transform="rotate(15deg)"
            boxShadow="sm"
            fontSize="5px"
            fontWeight="700"
            textAlign="center"
          >
            <Text>VALID</Text>
            <Text fontSize="4px" opacity="0.9">{clinicData?.prescriptionValidity || 30} DAYS</Text>
          </Box>
        </Box>
            </Box>
          </VStack>
        </Container>
        
        {/* Fixed Action Bar */}
        <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        bg="white"
        borderTop="1px solid"
        borderColor="gray.200"
        p={4}
        shadow="lg"
        zIndex={1000}
      >
        <Container maxW="7xl">
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">
                Patient: {patientData?.firstName} {patientData?.lastName}
              </Text>
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500">
                  ID: {prescription.prescriptionId}
                </Text>
                <Badge 
                  colorScheme={isPrescriptionReady() ? 'success' : 'warning'} 
                  variant="subtle" 
                  fontSize="xs"
                >
                  {isPrescriptionReady() ? 'Ready to Save' : 'Incomplete'}
                </Badge>
                <Badge colorScheme="blue" variant="outline" fontSize="xs">
                  Mode: {mode}
                </Badge>
              </HStack>
            </VStack>
            
            <HStack spacing={3}>
              <Button
                leftIcon={<Icon as={FaPrint} />}
                colorScheme="blue"
                variant="outline"
                onClick={handlePrint}
              >
                Print
              </Button>
              
              {mode !== 'view' && (
                <Button
                  leftIcon={<Icon as={FaPlus} />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={handleNewPrescription}
                >
                  New Prescription
                </Button>
              )}
              
              <Button
                leftIcon={<Icon as={FaSave} />}
                colorScheme={isPrescriptionReady() ? 'success' : 'gray'}
                onClick={handleSave}
                isDisabled={!isPrescriptionReady()}
                size="lg"
                px={8}
              >
                {isPrescriptionReady() ? 'Save Prescription' : 'Complete Prescription'}
              </Button>
            </HStack>
          </HStack>
        </Container>
        </Box>
      </Box>
  );
};

export default EPrescription;
