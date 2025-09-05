import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { FaPrescription, FaPrint, FaSave, FaArrowLeft, FaPlus, FaTrash, FaStethoscope, FaPills, FaNotesMedical, FaUser, FaHeartbeat, FaFlask, FaSearch, FaTimes, FaCheck, FaList } from 'react-icons/fa';
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
  Spinner,
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
    diagnoses: [], // Array for multiple diagnoses
    complaints: [], // Array for multiple chief complaints
    examination: '',
    medications: [],
    instructions: '',
    followUp: '',
    doctorName: 'Dr. [Your Name]',
    doctorSpecialization: 'General Physician',
    doctorLicense: 'MD[Your License]',
    notes: '',
    labTestRecommendations: [], // Array for selected lab tests
    status: 'in-progress'
  });

  const [pastPrescriptions, setPastPrescriptions] = useState([]);
  const [showPastPrescriptions, setShowPastPrescriptions] = useState(false);

  const [selectedLabTests, setSelectedLabTests] = useState([]);
  
  // New state for dynamic lab tests from database
  const [labTestsFromDB, setLabTestsFromDB] = useState([]);
  const [labTestCategories, setLabTestCategories] = useState([]);
  const [labTestsLoading, setLabTestsLoading] = useState(true);
  const [labTestsError, setLabTestsError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTests, setFilteredTests] = useState([]);
  
  // State for diagnosis management
  const [diagnosisInput, setDiagnosisInput] = useState('');
  
  // State for complaint management
  const [complaintInput, setComplaintInput] = useState('');
  
  
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
     
     const fetchLabTests = async () => {
       try {
         setLabTestsLoading(true);
         setLabTestsError(null);
         
         // Use robust retry logic for database busy errors
         let response;
         let retryCount = 0;
         const maxRetries = 3;
         
         while (retryCount < maxRetries) {
           try {
             console.log(`🔄 Attempting to fetch lab tests... (attempt ${retryCount + 1}/${maxRetries})`);
             response = await api.get('/api/lab-tests/tests?all=true');
             
             if (response.status === 200) {
               console.log('✅ Lab tests fetched successfully');
               break; // Success, exit retry loop
             } else if (response.status === 503) {
               // Service unavailable, retry
               retryCount++;
               if (retryCount < maxRetries) {
                 const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
                 console.log(`⚠️  Service unavailable, retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
                 await new Promise(resolve => setTimeout(resolve, delay));
                 continue;
               }
             }
             
             throw new Error(`HTTP ${response.status}: ${response.statusText}`);
           } catch (fetchError) {
             console.error(`❌ Fetch error on attempt ${retryCount + 1}:`, fetchError.message);
             
             // Check if it's a network error or server error that we should retry
             if ((fetchError.message.includes('Failed to fetch') || 
                  fetchError.message.includes('Network Error') ||
                  fetchError.message.includes('ECONNREFUSED') ||
                  fetchError.code === 'ECONNREFUSED') && 
                 retryCount < maxRetries - 1) {
               retryCount++;
               const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
               console.log(`⚠️  Network error, retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
               await new Promise(resolve => setTimeout(resolve, delay));
               continue;
             }
             throw fetchError;
           }
         }
         
         if (!response || response.status !== 200) {
           throw new Error(`Failed to fetch lab tests after ${maxRetries} attempts`);
         }
         
         const data = response.data;
         const tests = data.tests || [];
            
            if (tests.length === 0) {
              setLabTestsError('No tests available in the database.');
            } else {
              // Set all tests from database
              setLabTestsFromDB(tests);
              // Initialize filteredTests with all tests
              setFilteredTests(tests);
              
              // Try to organize tests by category and subcategory
              try {
                const organizedTests = organizeTestsByCategory(tests);
                setLabTestCategories(organizedTests);
              } catch (orgError) {
                // If organization fails, still show tests in simple list
                setLabTestCategories([]);
              }
           
           console.log(`✅ Lab tests loaded successfully: ${tests.length} tests`);
          }
       } catch (error) {
         console.error('❌ Error fetching lab tests:', error.message);
         setLabTestsError(`Failed to load laboratory tests: ${error.message}`);
         setLabTestsFromDB([]);
         setLabTestCategories([]);
       } finally {
         setLabTestsLoading(false);
       }
     };

                                       fetchLabTests();
           
           
           // Fetch dose patterns
           fetchDosePatterns();
    }, []);
 
       // Filter tests based on search term
    useEffect(() => {
      
      if (labTestsFromDB.length > 0) {
        if (searchTerm.trim() === '') {
          setFilteredTests(labTestsFromDB);
        } else {
          const filtered = labTestsFromDB.filter(test => 
            test.testCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (test.subcategory && test.subcategory.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          setFilteredTests(filtered);
        }
      } else {
        // Initialize filteredTests when labTestsFromDB is empty
        setFilteredTests([]);
      }
    }, [searchTerm, labTestsFromDB]);

  // Function to clear search and show all tests
  const clearSearchAndShowAll = () => {
    setSearchTerm('');
    setFilteredTests(labTestsFromDB);
  };

  // Lab test management functions
  const addLabTest = (test) => {
    if (!selectedLabTests.find(t => t.testCode === test.testCode)) {
      const newTest = {
        testCode: test.testCode,
        testName: test.testName,
        category: test.category,
        price: test.price || 0
      };
      setSelectedLabTests([...selectedLabTests, newTest]);
      toast({
        title: "Lab Test Added",
        description: `${test.testName} has been added to the prescription.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const removeLabTest = (testCode) => {
    setSelectedLabTests(selectedLabTests.filter(t => t.testCode !== testCode));
    toast({
      title: "Lab Test Removed",
      description: "Lab test has been removed from the prescription.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const isLabTestSelected = (testCode) => {
    return selectedLabTests.some(t => t.testCode === testCode);
  };

  // Sync selected lab tests with prescription state
  useEffect(() => {
    setPrescription(prev => ({
      ...prev,
      labTestRecommendations: selectedLabTests
    }));
  }, [selectedLabTests]);

  // Functions for diagnosis management
  const addDiagnosis = () => {
    if (diagnosisInput.trim() === '') return;
    
    const newDiagnosis = diagnosisInput.trim();
    
    // Check if diagnosis already exists
    if (prescription.diagnoses.includes(newDiagnosis)) {
      toast({
        title: "Duplicate Diagnosis",
        description: "This diagnosis has already been added",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    setPrescription(prev => ({
      ...prev,
      diagnoses: [...prev.diagnoses, newDiagnosis]
    }));
    
    setDiagnosisInput('');
    
    toast({
      title: "Diagnosis Added",
      description: `${newDiagnosis} has been added to the prescription`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const removeDiagnosis = (diagnosisToRemove) => {
    setPrescription(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.filter(diagnosis => diagnosis !== diagnosisToRemove)
    }));
    
    toast({
      title: "Diagnosis Removed",
      description: `${diagnosisToRemove} has been removed from the prescription`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDiagnosisKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDiagnosis();
    }
  };

  // Functions for complaint management
  const addComplaint = () => {
    if (complaintInput.trim() === '') return;
    
    const newComplaint = complaintInput.trim();
    
    // Check if complaint already exists
    if (prescription.complaints.includes(newComplaint)) {
      toast({
        title: "Duplicate Complaint",
        description: "This complaint has already been added",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    setPrescription(prev => ({
      ...prev,
      complaints: [...prev.complaints, newComplaint]
    }));
    
    setComplaintInput('');
    
    toast({
      title: "Complaint Added",
      description: `${newComplaint} has been added to the prescription`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const removeComplaint = (complaintToRemove) => {
    setPrescription(prev => ({
      ...prev,
      complaints: prev.complaints.filter(complaint => complaint !== complaintToRemove)
    }));
    
    toast({
      title: "Complaint Removed",
      description: `${complaintToRemove} has been removed from the prescription`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleComplaintKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addComplaint();
    }
  };




  // Function to fetch dose patterns
  const fetchDosePatterns = useCallback(async () => {
    try {
      setDosePatternsLoading(true);
      
      const response = await api.get('/api/dose-patterns/all');
      
      if (response.status === 200) {
        const data = response.data;
        
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
    console.log('🔍 EPrescription useEffect - patientId:', patientId);
    console.log('🔍 EPrescription useEffect - location.state:', location.state);
    
    const fetchPatientData = async () => {
      if (patientId) {
        console.log('🔄 Fetching patient data for ID:', patientId);
        try {
          const response = await api.get(`/api/patients/${patientId}`);
          
          if (response.status === 200) {
            const data = response.data;
            setPatientData(data);
            setMode('new');
            
            // Initialize prescription data for new prescriptions
            const newPrescription = {
              prescriptionId: `PRESC-${Date.now().toString().slice(-6)}`,
              date: new Date().toISOString().split('T')[0],
              diagnoses: [],
              complaints: [],
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
      console.log('✅ Using patient data from location.state:', location.state.patientData);
      setPatientData(location.state.patientData);
      setMode(location.state.mode || 'new');
      
      // Initialize prescription data based on mode
      if (location.state.mode === 'edit' && location.state.prescriptionData) {
        // Load existing prescription data for editing
        const existingPrescription = {
          prescriptionId: location.state.prescriptionData.prescriptionId,
          date: location.state.prescriptionData.date,
          diagnoses: location.state.prescriptionData.diagnoses || [],
          complaints: location.state.prescriptionData.complaints || [],
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
          diagnoses: [],
          complaints: [],
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
      console.log('❌ No patient data and no patientId, redirecting to doctor dashboard');
      navigate('/doctor');
    }
  }, [patientId, location.state, navigate, toast]);

  const loadPastPrescriptions = useCallback(async () => {
    try {
      
      const response = await api.get(`/api/prescriptions/patient/${patientId}`);
      
      if (response.status === 200) {
        const prescriptions = response.data;
        
        // Filter out the current prescription if we're editing
        const pastPrescriptions = prescriptions.filter(p => 
          mode !== 'edit' || p.prescriptionId !== prescription.prescriptionId
        );
        
        
        setPastPrescriptions(pastPrescriptions);
      } else {
        setPastPrescriptions([]);
      }
    } catch (error) {
      setPastPrescriptions([]);
    }
  }, [patientId, mode, prescription.prescriptionId]);


  // Fetch clinic data
  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const response = await api.get('/api/clinic');
        
        if (response.status === 200) {
          const data = response.data;
          
          // Handle both direct data and wrapped data formats
          if (data.success && data.data) {
            setClinicData(data.data);
          } else if (data.clinicName || data.id) {
            setClinicData(data);
          } else {
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
          diagnoses: pastPrescription.diagnoses || prev.diagnoses,
          complaints: pastPrescription.complaints || prev.complaints,
          instructions: pastPrescription.instructions || prev.instructions,
          followUp: pastPrescription.followUp || prev.followUp
        }));
        
                // Also copy lab test recommendations if available
         if (pastPrescription.labTestRecommendations) {
           setSelectedLabTests(pastPrescription.labTestRecommendations);
         }
         
        
        toast({
          title: "Prescription Copied",
          description: "Medications and details copied from previous prescription!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
     }
   };

  const handleSave = async () => {
    // Validate required fields - check diagnoses array
    if (!prescription.diagnoses || prescription.diagnoses.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one diagnosis.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!prescription.medications || prescription.medications.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one medication.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Validate that all medications have required fields
    const invalidMedications = (prescription.medications || []).filter(med => 
      !med.name || !med.dosage || !med.frequency || !med.durationValue || !med.durationUnit
    );
    
    if (invalidMedications.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for medications (name, dosage, frequency, duration).",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // First, save prescription to backend database
      const prescriptionData = {
        patientId: parseInt(patientId),
        doctorId: 1, // Default doctor ID - should be replaced with actual logged-in doctor
        date: prescription.date,
        diagnoses: prescription.diagnoses,
        complaints: prescription.complaints,
        examination: prescription.examination,
        medications: prescription.medications,
        instructions: prescription.instructions,
        followUp: prescription.followUp,
        notes: prescription.notes
      };


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
        toast({
          title: "Save Failed",
          description: `Error ${prescriptionResponse.status}. Please try again.`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const savedPrescription = await prescriptionResponse.json();

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
      
      toast({
        title: "Prescription Saved",
        description: "Prescription saved successfully! You can now print it.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Error saving prescription. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Function to create lab test orders
  const createLabTestOrders = async (prescriptionData) => {
    try {
      if (!selectedLabTests || selectedLabTests.length === 0) {
        return;
      }
      
      // Get test details for selected lab tests
      const testDetails = selectedLabTests.map(testId => {
        // Find test in the database data
        const test = labTestsFromDB.find(t => t.testCode === testId);
        
        if (test) {
          return {
            testId: test.id, // Use the database ID, not testCode
            testName: test.testName,
            testCode: test.testCode,
            clinicalNotes: (prescriptionData.diagnoses && prescriptionData.diagnoses.length > 0) 
              ? prescriptionData.diagnoses.join(', ') 
              : '',
            instructions: prescriptionData.instructions || ''
          };
        } else {
          console.warn(`Test not found for ID: ${testId}`);
          return {
            testId: testId,
            testName: testId,
            testCode: testId,
            clinicalNotes: (prescriptionData.diagnoses && prescriptionData.diagnoses.length > 0) 
              ? prescriptionData.diagnoses.join(', ') 
              : '',
            instructions: prescriptionData.instructions || ''
          };
        }
      });

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

      const response = await api.post('/api/lab-tests/orders', orderData);

      if (response.status === 200 || response.status === 201) {
        const orderResult = response.data;
        toast({
          title: "Lab Test Order Created",
          description: `Order ID: ${orderResult.orderId}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        const errorText = await response.text();
        toast({
          title: "Lab Test Order Failed",
          description: `Error ${response.status}. Please contact lab staff.`,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Lab Test Order Failed",
        description: "Please contact lab staff.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleNewPrescription = () => {
    const newPrescription = {
      prescriptionId: `PRESC-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      diagnoses: [],
      complaints: [],
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
     setMode('new');
  };

     // Check if prescription is ready to be saved
   const isPrescriptionReady = () => {
     return (prescription.diagnoses && prescription.diagnoses.length > 0) && 
            (prescription.medications && prescription.medications.length > 0) &&
            (prescription.medications || []).every(med => 
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
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6} maxW="600px" textAlign="center">
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text fontSize="lg" color="gray.600">Loading patient information...</Text>
          <VStack spacing={2} fontSize="sm" color="gray.500">
            <Text>Patient ID: {patientId || 'Not provided'}</Text>
            <Text>Location state: {location.state ? 'Present' : 'Not present'}</Text>
          </VStack>
          
          {/* Debug information */}
          <Box p={4} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
            <Text fontSize="sm" color="yellow.800" fontWeight="semibold" mb={2}>
              🔍 Debug Information
            </Text>
            <VStack spacing={1} align="start" fontSize="xs" color="yellow.700">
              <Text>URL: {window.location.pathname}</Text>
              <Text>Patient ID from URL: {patientId}</Text>
              <Text>Has location state: {location.state ? 'Yes' : 'No'}</Text>
              <Text>Backend API: {process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}</Text>
            </VStack>
          </Box>
          
          {/* Action buttons */}
          <HStack spacing={4}>
            <Button
              onClick={() => navigate('/doctor')}
              colorScheme="blue"
              variant="outline"
            >
              Go to Doctor Dashboard
            </Button>
            <Button
              onClick={() => {
                // Test with sample data
                const samplePatient = {
                  id: 1,
                  firstName: 'John',
                  lastName: 'Doe',
                  age: 35,
                  gender: 'Male',
                  bloodGroup: 'O+',
                  phone: '123-456-7890',
                  address: '123 Main St, City, State',
                  patientId: 1
                };
                setPatientData(samplePatient);
                setMode('new');
              }}
              colorScheme="green"
              variant="outline"
            >
              Test with Sample Data
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">

      <Container maxW="7xl" flex="1" p={4} pb={24}>
        <VStack spacing={4} align="stretch">
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
                      
               {pastPrescriptions && pastPrescriptions.length > 0 && (
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

          <Grid templateColumns="1fr" gap={8}>
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


          {/* Completed Prescriptions Section */}
          {pastPrescriptions && pastPrescriptions.length > 0 && (
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="health.600">
                    <HStack>
                      <Icon as={FaPrescription} />
                      <Text>Completed Prescriptions ({pastPrescriptions.length})</Text>
                    </HStack>
                  </Heading>
                  <Button 
                    colorScheme="gray"
                    size="sm"
                    onClick={() => setShowPastPrescriptions(!showPastPrescriptions)}
                  >
                    {showPastPrescriptions ? 'Hide' : 'Show'} All Prescriptions
                  </Button>
                </Flex>
              </CardHeader>
              
              {showPastPrescriptions && (
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Show all completed prescriptions */}
                    {pastPrescriptions.map((prescription, index) => (
                      <Box 
                        key={prescription.prescriptionId}
                        p={4}
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        bg="white"
                        position="relative"
                      >
                        <Flex justify="space-between" align="flex-start" mb={3}>
                          <Box>
                            <Heading size="sm" color="gray.800" mb={2}>
                              Prescription #{prescription.prescriptionId}
                            </Heading>
                            <Text fontSize="sm" color="gray.600">
                              <Text as="span" fontWeight="bold">Date:</Text> {new Date(prescription.date).toLocaleDateString()} • 
                              <Text as="span" fontWeight="bold">Diagnosis:</Text> {
                                prescription.diagnoses && prescription.diagnoses.length > 0 
                                  ? prescription.diagnoses.join(', ') 
                                  : 'Not specified'
                              }
                            </Text>
                          </Box>
                          {mode !== 'view' && (
                            <Button 
                              colorScheme="blue"
                              size="sm"
                              onClick={() => copyFromPastPrescription(prescription)}
                              leftIcon={<Icon as={FaPlus} />}
                            >
                              Copy
                            </Button>
                          )}
                        </Flex>
                        
                        {prescription.medications && prescription.medications.length > 0 && (
                          <Box mb={3}>
                            <Text fontWeight="bold" color="gray.800" mb={2}>Medications:</Text>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                              {prescription.medications.map((med, medIndex) => (
                                <Box 
                                  key={medIndex}
                                  p={2}
                                  bg="blue.50"
                                  borderRadius="md"
                                  border="1px solid"
                                  borderColor="blue.200"
                                >
                                  <Text fontWeight="semibold" color="gray.800" fontSize="sm">{med.name}</Text>
                                  <Text fontSize="xs" color="gray.600">
                                    {med.dosage} • {med.frequency} • {med.durationValue || 1} {med.durationUnit || 'Month'}
                                  </Text>
                                </Box>
                              ))}
                            </SimpleGrid>
                          </Box>
                        )}
                        
                        {(prescription.instructions || prescription.followUp) && (
                          <Box fontSize="sm">
                            {prescription.instructions && (
                              <Box mb={2}>
                                <Text as="span" fontWeight="bold" color="gray.800">Instructions:</Text> {prescription.instructions}
                              </Box>
                            )}
                            {prescription.followUp && (
                              <Box>
                                <Text as="span" fontWeight="bold" color="gray.800">Follow-up:</Text> {prescription.followUp}
                              </Box>
                            )}
                          </Box>
                        )}
                        
                        {prescription.labTestRecommendations && (
                          <Box fontSize="sm" mt={3}>
                            <Text fontWeight="bold" color="gray.800" mb={1}>Lab Tests:</Text>
                            <Box 
                              p={2}
                              bg="blue.50"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="blue.200"
                              color="gray.600"
                            >
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
                            </Box>
                          </Box>
                        )}
                        
                      </Box>
                    ))}
                  
                    {/* Add a status badge for each prescription */}
                    <Box 
                      textAlign="center" 
                      p={2} 
                      bg="green.50" 
                      borderRadius="md"
                      border="1px solid"
                      borderColor="green.200"
                      color="green.700"
                      fontSize="sm"
                    >
                      ✅ <Text as="span" fontWeight="bold">All prescriptions completed successfully</Text>
                    </Box>
                    
                    <Box 
                      textAlign="center" 
                      p={4} 
                      bg="blue.50" 
                      borderRadius="md"
                      border="1px dashed"
                      borderColor="blue.300"
                    >
                      <Text color="gray.600" fontSize="sm">
                        💡 <Text as="span" fontWeight="bold">Tip:</Text> Use the "Copy" button to quickly add medications and details from any previous prescription
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              )}
            </Card>
          )}

          {/* No Prescriptions Message */}
          {(!pastPrescriptions || pastPrescriptions.length === 0) && patientId && (
            <Card bg="yellow.50" border="1px solid" borderColor="yellow.200">
              <CardBody textAlign="center">
                <Heading size="md" color="yellow.800" mb={2}>📋 No Previous Prescriptions</Heading>
                <Text fontSize="sm" color="yellow.700">
                  This is the first prescription for this patient.
                </Text>
              </CardBody>
            </Card>
          )}

          {/* Vital Signs */}
          <Card>
            <CardHeader>
              <Heading size="md" color="health.600">
                <HStack>
                  <Icon as={FaHeartbeat} />
                  <Text>Vital Signs</Text>
                </HStack>
              </Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Temperature</Text>
                  <Text fontWeight="semibold">{patientData.vitalSigns?.temperature || 'Not recorded'}</Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Blood Pressure</Text>
                  <Text fontWeight="semibold">{patientData.vitalSigns?.bloodPressure || 'Not recorded'}</Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Pulse</Text>
                  <Text fontWeight="semibold">{patientData.vitalSigns?.pulse || 'Not recorded'}</Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Weight</Text>
                  <Text fontWeight="semibold">{patientData.vitalSigns?.weight || 'Not recorded'}</Text>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>

                {/* Diagnosis & Symptoms */}
                <Card>
                  <CardHeader>
                    <Heading size="md" color="health.600">
                      <HStack>
                        <Icon as={FaStethoscope} />
                        <Text>Diagnosis & Symptoms</Text>
                      </HStack>
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                      {/* Chief Complaints */}
                      <Box>
                        <Text fontWeight="semibold" mb={3} color="gray.700">
                          Chief Complaints
                        </Text>
                        {/* Multiple Complaint Tags */}
                        {prescription.complaints && prescription.complaints.length > 0 && (
                          <Box
                            display="flex"
                            flexWrap="wrap"
                            gap={2}
                            mb={3}
                            p={3}
                            bg="blue.50"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="blue.200"
                          >
                            {(prescription.complaints || []).map((complaint, index) => (
                              <HStack
                                key={index}
                                bg="blue.100"
                                color="blue.800"
                                px={3}
                                py={1}
                                borderRadius="full"
                                fontSize="sm"
                                fontWeight="medium"
                                border="1px solid"
                                borderColor="blue.300"
                                boxShadow="sm"
                              >
                                <Text>{complaint}</Text>
                                {mode !== 'view' && (
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => removeComplaint(complaint)}
                                    _hover={{ bg: "red.500", color: "white" }}
                                    minW="auto"
                                    h="auto"
                                    p={1}
                                  >
                                    ×
                                  </Button>
                                )}
                              </HStack>
                            ))}
                          </Box>
                        )}
                        
                        {/* Complaint Input */}
                        {mode !== 'view' && (
                          <HStack spacing={2}>
                            <Input
                              value={complaintInput}
                              onChange={(e) => setComplaintInput(e.target.value)}
                              onKeyPress={handleComplaintKeyPress}
                              placeholder="Enter complaint and press Enter or click Add"
                              size="sm"
                            />
                            <Button
                              onClick={addComplaint}
                              disabled={!complaintInput.trim()}
                              colorScheme="blue"
                              size="sm"
                              leftIcon={<Icon as={FaPlus} />}
                            >
                              Add
                            </Button>
                          </HStack>
                        )}
                      </Box>
                      
                      {/* Diagnoses */}
                      <Box>
                        <Text fontWeight="semibold" mb={3} color="gray.700">
                          Diagnoses
                        </Text>
                        
                        {/* Multiple Diagnosis Tags */}
                        {prescription.diagnoses && prescription.diagnoses.length > 0 && (
                          <Box
                            display="flex"
                            flexWrap="wrap"
                            gap={2}
                            mb={3}
                            p={3}
                            bg="yellow.50"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="yellow.200"
                          >
                            {(prescription.diagnoses || []).map((diagnosis, index) => (
                              <HStack
                                key={index}
                                bg="yellow.100"
                                color="yellow.800"
                                px={3}
                                py={1}
                                borderRadius="full"
                                fontSize="sm"
                                fontWeight="medium"
                                border="1px solid"
                                borderColor="yellow.300"
                                boxShadow="sm"
                              >
                                <Text>{diagnosis}</Text>
                                {mode !== 'view' && (
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="yellow"
                                    onClick={() => removeDiagnosis(diagnosis)}
                                    _hover={{ bg: "red.500", color: "white" }}
                                    minW="auto"
                                    h="auto"
                                    p={1}
                                  >
                                    ×
                                  </Button>
                                )}
                              </HStack>
                            ))}
                          </Box>
                        )}
                        
                        {/* Diagnosis Input */}
                        {mode !== 'view' && (
                          <HStack spacing={2}>
                            <Input
                              value={diagnosisInput}
                              onChange={(e) => setDiagnosisInput(e.target.value)}
                              onKeyPress={handleDiagnosisKeyPress}
                              placeholder="Enter diagnosis and press Enter or click Add"
                              size="sm"
                            />
                            <Button
                              onClick={addDiagnosis}
                              disabled={!diagnosisInput.trim()}
                              colorScheme="green"
                              size="sm"
                              leftIcon={<Icon as={FaPlus} />}
                            >
                              Add
                            </Button>
                          </HStack>
                        )}
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Medications */}
                <Card>
                  <CardHeader>
                    <Flex justify="space-between" align="center">
                      <Heading size="md" color="health.600">
                        <HStack>
                          <Icon as={FaPills} />
                          <Text>Medicine Prescription</Text>
                        </HStack>
                      </Heading>
                      {mode !== 'view' && (
                        <Button
                          onClick={addMedication}
                          colorScheme="blue"
                          size="sm"
                          leftIcon={<Icon as={FaPlus} />}
                        >
                          Add Medication
                        </Button>
                      )}
                    </Flex>
                  </CardHeader>
                  <CardBody>

                    {/* Common Medications */}
                    <Box mb={6}>
                      <Text fontWeight="semibold" mb={4} color="gray.700">
                        Quick Add Common Medications
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                        {commonMedications.map(med => (
                          <Box
                            key={med.name}
                            p={3}
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="md"
                            cursor={mode === 'view' ? 'default' : 'pointer'}
                            transition="all 0.3s ease"
                            bg="white"
                            opacity={mode === 'view' ? 0.6 : 1}
                            _hover={mode !== 'view' ? { 
                              borderColor: "blue.300", 
                              boxShadow: "md",
                              transform: "translateY(-2px)"
                            } : {}}
                            onClick={() => mode !== 'view' && addCommonMedication(med)}
                          >
                            <Text fontWeight="semibold" color="gray.800" mb={1}>
                              {med.name}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {med.dosage} • {med.frequency} • {med.durationValue || 1} {med.durationUnit || 'Month'}
                            </Text>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>

                    {/* Prescribed Medications Table */}
                    {prescription.medications && prescription.medications.length > 0 && (
                      <Box
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        overflow="hidden"
                        bg="white"
                        maxW="100%"
                      >
                        <Box
                          overflowX="auto"
                          maxH="400px"
                          overflowY="auto"
                        >
                          <Table size="sm" variant="simple">
                            <Thead position="sticky" top={0} bg="blue.600" zIndex={10}>
                              <Tr>
                                <Th 
                                  color="white" 
                                  fontSize="sm" 
                                  fontWeight="bold" 
                                  w="50px"
                                  bg="blue.600"
                                  border="1px solid"
                                  borderColor="blue.700"
                                  px={2}
                                  py={3}
                                >
                                  #
                                </Th>
                                <Th 
                                  color="white" 
                                  fontSize="sm" 
                                  fontWeight="bold" 
                                  w="100px"
                                  bg="blue.600"
                                  border="1px solid"
                                  borderColor="blue.700"
                                  px={2}
                                  py={3}
                                >
                                  Type
                                </Th>
                                <Th 
                                  color="white" 
                                  fontSize="sm" 
                                  fontWeight="bold" 
                                  minW="250px"
                                  bg="blue.600"
                                  border="1px solid"
                                  borderColor="blue.700"
                                  px={2}
                                  py={3}
                                >
                                  Medicine
                                </Th>
                                <Th 
                                  color="white" 
                                  fontSize="sm" 
                                  fontWeight="bold" 
                                  w="180px"
                                  bg="blue.600"
                                  border="1px solid"
                                  borderColor="blue.700"
                                  px={2}
                                  py={3}
                                >
                                  Dose
                                </Th>
                                <Th 
                                  color="white" 
                                  fontSize="sm" 
                                  fontWeight="bold" 
                                  w="150px"
                                  bg="blue.600"
                                  border="1px solid"
                                  borderColor="blue.700"
                                  px={2}
                                  py={3}
                                >
                                  Frequency
                                </Th>
                                <Th 
                                  color="white" 
                                  fontSize="sm" 
                                  fontWeight="bold" 
                                  w="140px"
                                  bg="blue.600"
                                  border="1px solid"
                                  borderColor="blue.700"
                                  px={2}
                                  py={3}
                                >
                                  Duration
                                </Th>
                                <Th 
                                  color="white" 
                                  fontSize="sm" 
                                  fontWeight="bold" 
                                  minW="200px"
                                  bg="blue.600"
                                  border="1px solid"
                                  borderColor="blue.700"
                                  px={2}
                                  py={3}
                                >
                                  Notes
                                </Th>
                                {mode !== 'view' && (
                                  <Th 
                                    color="white" 
                                    fontSize="sm" 
                                    fontWeight="bold" 
                                    w="100px" 
                                    textAlign="center"
                                    bg="blue.600"
                                    border="1px solid"
                                    borderColor="blue.700"
                                    px={2}
                                    py={3}
                                  >
                                    Action
                                  </Th>
                                )}
                              </Tr>
                            </Thead>
                            <Tbody>
                              {(prescription.medications || []).map((med, index) => (
                                <Tr key={med.id} _even={{ bg: "gray.50" }}>
                                  <Td 
                                    fontSize="sm" 
                                    fontWeight="semibold" 
                                    color="gray.600"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    px={2}
                                    py={2}
                                  >
                                    {index + 1}
                                  </Td>
                                  <Td 
                                    fontSize="sm"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    px={2}
                                    py={2}
                                  >
                                    <Select
                                      value={med.type || 'TAB'}
                                      onChange={(e) => updateMedication(med.id, 'type', e.target.value)}
                                      disabled={mode === 'view'}
                                      size="sm"
                                      fontSize="sm"
                                      border="1px solid"
                                      borderColor="gray.300"
                                      bg="white"
                                      _focus={{ border: "1px solid", borderColor: "blue.300" }}
                                    >
                                      <option value="TAB">TAB.</option>
                                      <option value="CAP">CAP.</option>
                                      <option value="SYRUP">SYRUP</option>
                                      <option value="INJ">INJ.</option>
                                      <option value="DROPS">DROPS</option>
                                      <option value="CREAM">CREAM</option>
                                      <option value="OINT">OINT.</option>
                                    </Select>
                                  </Td>
                                  <Td fontSize="sm">
                                    <Input
                                      value={med.name}
                                      onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                                      disabled={mode === 'view'}
                                      placeholder="Enter medicine name"
                                      size="sm"
                                      fontSize="sm"
                                      border="none"
                                      bg="transparent"
                                      _focus={{ border: "1px solid", borderColor: "blue.300" }}
                                    />
                                  </Td>
                                  <Td fontSize="sm">
                                    <Select
                                      value={med.dosage || ''}
                                      onChange={(e) => updateMedication(med.id, 'dosage', e.target.value)}
                                      disabled={mode === 'view'}
                                      size="sm"
                                      fontSize="sm"
                                      border="none"
                                      bg="transparent"
                                      _focus={{ border: "1px solid", borderColor: "blue.300" }}
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
                                    </Select>
                                  </Td>
                         
                                  <Td fontSize="sm">
                                    <Input
                                      value={med.frequency}
                                      onChange={(e) => updateMedication(med.id, 'frequency', e.target.value)}
                                      disabled={mode === 'view'}
                                      placeholder="e.g., Daily"
                                      size="sm"
                                      fontSize="sm"
                                      border="none"
                                      bg="transparent"
                                      _focus={{ border: "1px solid", borderColor: "blue.300" }}
                                    />
                                  </Td>
                                  <Td fontSize="sm">
                                    <HStack spacing={1}>
                                      <Input
                                        type="number"
                                        value={med.durationValue || 1}
                                        onChange={(e) => updateMedication(med.id, 'durationValue', e.target.value)}
                                        disabled={mode === 'view'}
                                        min="1"
                                        size="sm"
                                        fontSize="sm"
                                        w="60px"
                                        textAlign="center"
                                        border="none"
                                        bg="transparent"
                                        _focus={{ border: "1px solid", borderColor: "blue.300" }}
                                      />
                                      <Select
                                        value={med.durationUnit || 'Month'}
                                        onChange={(e) => updateMedication(med.id, 'durationUnit', e.target.value)}
                                        disabled={mode === 'view'}
                                        size="sm"
                                        fontSize="sm"
                                        flex="1"
                                        border="none"
                                        bg="transparent"
                                        _focus={{ border: "1px solid", borderColor: "blue.300" }}
                                      >
                                        <option value="Day">Day</option>
                                        <option value="Week">Week</option>
                                        <option value="Month">Month</option>
                                        <option value="Year">Year</option>
                                      </Select>
                                    </HStack>
                                  </Td>
                                  <Td fontSize="sm">
                                    <Input
                                      value={med.instructions || ''}
                                      onChange={(e) => updateMedication(med.id, 'instructions', e.target.value)}
                                      disabled={mode === 'view'}
                                      placeholder="Special instructions"
                                      size="sm"
                                      fontSize="sm"
                                      border="none"
                                      bg="transparent"
                                      _focus={{ border: "1px solid", borderColor: "blue.300" }}
                                    />
                                  </Td>
                                  {mode !== 'view' && (
                                    <Td textAlign="center">
                                      <Button
                                        onClick={() => removeMedication(med.id)}
                                        colorScheme="red"
                                        size="xs"
                                        leftIcon={<Icon as={FaTrash} />}
                                      >
                                        Remove
                                      </Button>
                                    </Td>
                                  )}
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                      </Box>
                    )}

                    {(!prescription.medications || prescription.medications.length === 0) && (
                      <Box
                        textAlign="center"
                        p={8}
                        color="gray.500"
                        fontStyle="italic"
                        border="2px dashed"
                        borderColor="gray.300"
                        borderRadius="md"
                        bg="gray.50"
                      >
                        <Text>No medications added yet. Click "Add Medication" to start.</Text>
                      </Box>
                    )}

                  </CardBody>
                </Card>

                {/* Instructions & Follow-up - Collapsible */}
                <Card>
                  <Accordion allowToggle>
                    <AccordionItem>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <HStack>
                              <Icon as={FaNotesMedical} />
                              <Text fontWeight="semibold">Instructions & Follow-up</Text>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <VStack spacing={4} align="stretch">
                          <Box>
                            <Text fontWeight="medium" mb={2} color="gray.700">
                              Treatment Instructions
                            </Text>
                            <Textarea
                              value={prescription.instructions}
                              onChange={(e) => setPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                              disabled={mode === 'view'}
                              placeholder="Enter treatment instructions for the patient"
                              rows={3}
                              fontSize="sm"
                            />
                          </Box>
                          <Box>
                            <Text fontWeight="medium" mb={2} color="gray.700">
                              Follow-up Instructions
                            </Text>
                            <Textarea
                              value={prescription.followUp}
                              onChange={(e) => setPrescription(prev => ({ ...prev, followUp: e.target.value }))}
                              disabled={mode === 'view'}
                              placeholder="Enter follow-up instructions"
                              rows={2}
                              fontSize="sm"
                            />
                          </Box>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </Card>

                {/* Lab Test Recommendations - Collapsible */}
                <Card>
                  <Accordion allowToggle>
                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <HStack>
                            <Icon as={FaFlask} />
                            <Text fontWeight="semibold">Laboratory Test Recommendations</Text>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        {labTestsLoading ? (
                          <VStack spacing={4} align="center" py={8}>
                            <Spinner size="lg" color="blue.500" thickness="4px" />
                            <Text color="gray.600">Loading laboratory tests...</Text>
                          </VStack>
                        ) : labTestsError ? (
                          <Box
                            p={4}
                            bg="red.50"
                            border="1px solid"
                            borderColor="red.200"
                            borderRadius="md"
                            textAlign="center"
                          >
                            <Text color="red.600" fontWeight="semibold">
                              Error: {labTestsError}
                            </Text>
                          </Box>
                        ) : (labTestsFromDB && labTestsFromDB.length > 0) ? (
                          <Box>
                            <VStack spacing={4} align="stretch">
                              {/* Search and Filter */}
                              <Box>
                                <HStack spacing={2} mb={3}>
                                  <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                      <Icon as={FaSearch} color="gray.300" />
                                    </InputLeftElement>
                                    <Input
                                      placeholder="Search lab tests..."
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      size="sm"
                                    />
                                  </InputGroup>
                                  {searchTerm && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={clearSearchAndShowAll}
                                      leftIcon={<Icon as={FaTimes} />}
                                    >
                                      Clear
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={clearSearchAndShowAll}
                                    leftIcon={<Icon as={FaList} />}
                                  >
                                    Show All
                                  </Button>
                                </HStack>
                                
                                <Text fontSize="sm" color="gray.600" mb={3}>
                                  Found {filteredTests.length} tests
                                </Text>
                              </Box>

                              {/* Selected Lab Tests */}
                              {selectedLabTests.length > 0 && (
                                <Box>
                                  <Text fontWeight="semibold" mb={2} color="green.700">
                                    Selected Lab Tests ({selectedLabTests.length})
                                  </Text>
                                  <VStack spacing={2} align="stretch">
                                    {selectedLabTests.map((test) => (
                                      <HStack
                                        key={test.testCode}
                                        p={2}
                                        bg="green.50"
                                        borderRadius="md"
                                        border="1px solid"
                                        borderColor="green.200"
                                        justify="space-between"
                                      >
                                        <VStack align="start" spacing={0} flex={1}>
                                          <Text fontSize="sm" fontWeight="semibold" color="green.800">
                                            {test.testName}
                                          </Text>
                                          <Text fontSize="xs" color="green.600">
                                            {test.testCode} • {test.category} • ₹{test.price}
                                          </Text>
                                        </VStack>
                                        <IconButton
                                          size="sm"
                                          variant="ghost"
                                          colorScheme="red"
                                          icon={<Icon as={FaTimes} />}
                                          onClick={() => removeLabTest(test.testCode)}
                                          aria-label="Remove test"
                                        />
                                      </HStack>
                                    ))}
                                  </VStack>
                                </Box>
                              )}

                              {/* Available Lab Tests */}
                              <Box>
                                <Text fontWeight="semibold" mb={2} color="gray.700">
                                  Available Lab Tests
                                </Text>
                                <Box
                                  maxH="300px"
                                  overflowY="auto"
                                  border="1px solid"
                                  borderColor="gray.200"
                                  borderRadius="md"
                                >
                                  {filteredTests.length > 0 ? (
                                    <VStack spacing={0} align="stretch">
                                      {filteredTests.map((test) => (
                                        <HStack
                                          key={test.testCode}
                                          p={3}
                                          borderBottom="1px solid"
                                          borderColor="gray.100"
                                          _hover={{ bg: "gray.50" }}
                                          justify="space-between"
                                          cursor="pointer"
                                          onClick={() => addLabTest(test)}
                                        >
                                          <VStack align="start" spacing={1} flex={1}>
                                            <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                                              {test.testName}
                                            </Text>
                                            <Text fontSize="xs" color="gray.600">
                                              {test.testCode} • {test.category}
                                            </Text>
                                            <Text fontSize="xs" color="blue.600" fontWeight="medium">
                                              ₹{test.price || 0}
                                            </Text>
                                          </VStack>
                                          <Button
                                            size="sm"
                                            colorScheme={isLabTestSelected(test.testCode) ? "green" : "blue"}
                                            variant={isLabTestSelected(test.testCode) ? "solid" : "outline"}
                                            leftIcon={<Icon as={isLabTestSelected(test.testCode) ? FaCheck : FaPlus} />}
                                            isDisabled={isLabTestSelected(test.testCode)}
                                          >
                                            {isLabTestSelected(test.testCode) ? "Added" : "Add"}
                                          </Button>
                                        </HStack>
                                      ))}
                                    </VStack>
                                  ) : (
                                    <Box p={4} textAlign="center">
                                      <Text color="gray.500" fontSize="sm">
                                        No tests found matching your search.
                                      </Text>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </VStack>
                          </Box>
                        ) : (
                          <Box textAlign="center" p={4}>
                            <Text color="gray.600">
                              No lab tests available. The system will load tests from the database.
                            </Text>
                          </Box>
                        )}
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </Card>
              </VStack>
            </GridItem>

            </Grid>
        </VStack>
      </Container>
      
      {/* Sticky Footer with Action Buttons */}
      <Box
        position="sticky"
        bottom={0}
        zIndex={100}
        bg="white"
        borderTop="2px solid"
        borderColor="gray.200"
        p={4}
        boxShadow="lg"
      >
        <Container maxW="7xl">
          <HStack justify="space-between" align="center" wrap="wrap">
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">
                Patient: {patientData?.firstName} {patientData?.lastName}
              </Text>
              <HStack spacing={2}>
                <Text fontSize="xs" color="gray.500">
                  ID: {prescription.prescriptionId}
                </Text>
                <Badge 
                  colorScheme={isPrescriptionReady() ? 'green' : 'yellow'} 
                  variant="subtle" 
                  fontSize="xs"
                >
                  {isPrescriptionReady() ? 'Ready to Save' : 'Incomplete'}
                </Badge>
              </HStack>
            </VStack>
            
            <HStack spacing={3} wrap="wrap">
              <Button
                onClick={handlePrint}
                variant="outline"
                size="md"
                leftIcon={<Icon as={FaPrint} />}
                colorScheme="blue"
              >
                Print Prescription
              </Button>
              
              {mode !== 'view' && (
                <Button
                  leftIcon={<Icon as={FaPlus} />}
                  colorScheme="blue"
                  variant="outline"
                  size="md"
                  onClick={handleNewPrescription}
                >
                  New Prescription
                </Button>
              )}
              
              <Button
                leftIcon={<Icon as={FaSave} />}
                colorScheme={isPrescriptionReady() ? 'green' : 'gray'}
                onClick={handleSave}
                isDisabled={!isPrescriptionReady()}
                size="lg"
                px={8}
                fontWeight="semibold"
              >
                {isPrescriptionReady() ? 'Complete Prescription' : 'Complete Prescription'}
              </Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

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
        
        {/* Printable Prescription Content */}
        <Box className="prescription-page">
          {/* This will contain the printable prescription content */}
          <Text>Prescription content will be rendered here for printing</Text>
        </Box>
      </Box>
    </Box>
  );
};

export default EPrescription;
