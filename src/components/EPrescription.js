import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../config/api';
import appConfig from '../config/appConfig';
import { correctAndFormatMedicalText, handleMedicalTextInput, applyMedicalTextCorrection } from '../utils/textCorrection';
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
  const [doctorData, setDoctorData] = useState(null);
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
  
  // Item master functionality
  const [itemMasterItems, setItemMasterItems] = useState([]);
  const [itemMasterLoading, setItemMasterLoading] = useState(false);
  const [itemMasterError, setItemMasterError] = useState(null);
  const [medicationSearchTerm, setMedicationSearchTerm] = useState('');
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [showMedicationDropdown, setShowMedicationDropdown] = useState({});
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [currentMedicationId, setCurrentMedicationId] = useState(null);
  
  // Fallback dose patterns in case API fails
  const fallbackDosePatterns = useMemo(() => [
    { id: 'fallback-1', pattern: '1-0-0', description: 'Once a day, morning' },
    { id: 'fallback-2', pattern: '0-0-1', description: 'Once a day, night' },
    { id: 'fallback-3', pattern: '1-0-1', description: 'Twice a day, morning and night' },
    { id: 'fallback-4', pattern: '1-1-1', description: 'Thrice a day, morning, noon, and night' },
    { id: 'fallback-5', pattern: '0.5-0-0', description: 'Half tablet once daily, morning' }
  ], []);
  


     // Fetch lab tests from database
 
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
    
    // Apply text correction and formatting
    const correctedDiagnosis = correctAndFormatMedicalText(diagnosisInput.trim());
    
    // Check if diagnosis already exists (case-insensitive)
    const existingDiagnosis = prescription.diagnoses.find(d => 
      d.toLowerCase() === correctedDiagnosis.toLowerCase()
    );
    
    if (existingDiagnosis) {
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
      diagnoses: [...prev.diagnoses, correctedDiagnosis]
    }));
    
    setDiagnosisInput('');
  };

  const removeDiagnosis = (diagnosisToRemove) => {
    setPrescription(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.filter(diagnosis => diagnosis !== diagnosisToRemove)
    }));
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
    
    // Apply text correction and formatting
    const correctedComplaint = correctAndFormatMedicalText(complaintInput.trim());
    
    // Check if complaint already exists (case-insensitive)
    const existingComplaint = prescription.complaints.find(c => 
      c.toLowerCase() === correctedComplaint.toLowerCase()
    );
    
    if (existingComplaint) {
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
      complaints: [...prev.complaints, correctedComplaint]
    }));
    
    setComplaintInput('');
  };

  const removeComplaint = (complaintToRemove) => {
    setPrescription(prev => ({
      ...prev,
      complaints: prev.complaints.filter(complaint => complaint !== complaintToRemove)
    }));
  };

  const handleComplaintKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addComplaint();
    }
  };




  // Fetch logged-in doctor information
  const fetchDoctorData = useCallback(async () => {
    try {
      console.log('🔍 Fetching doctor data...');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = localStorage.getItem('userId');
      
      console.log('👤 User data from localStorage:', userData);
      console.log('🆔 User ID from localStorage:', userId);
      
      if (userId && (userData.type === 'D' || userData.role === 'admin' || userData.role === 'doctor' || userData.userType === 'admin')) {
        console.log('✅ User is a doctor, fetching details...');
        // Fetch doctor details including doctor code from doctors table
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${appConfig.apiBaseUrl}/api/users/${userId}/doctor-code`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('📡 Doctor Code API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📋 Doctor Code API response data:', data);
          
          if (data.success && data.data) {
            setDoctorData(data.data);
            console.log('✅ Doctor data with code set:', data.data);
            
            // Update prescription with doctor information including doctor code
            setPrescription(prev => ({
              ...prev,
              doctorId: data.data.doctor_id,
              doctorCode: data.data.doctor_code,
              doctorName: data.data.name || data.data.fullName || 'Dr. [Your Name]',
              doctorSpecialization: data.data.specialization || 'General Physician',
              doctorLicense: data.data.license || 'MD[Your License]'
            }));
            
            // Also update doctorData for the handleSave function
            setDoctorData({
              id: data.data.doctor_id,
              doctor_code: data.data.doctor_code,
              name: data.data.name || data.data.fullName,
              specialization: data.data.specialization,
              license: data.data.license
            });
          } else {
            console.log('❌ Doctor Code API response not successful:', data);
          }
        } else {
          console.log('❌ Doctor Code API request failed:', response.status, response.statusText);
        }
      } else {
        console.log('❌ User is not a doctor or missing data:', { userId, userType: userData.type });
      }
    } catch (error) {
      console.error('💥 Error fetching doctor data:', error);
    }
  }, []);

  // Function to fetch dose patterns
  const fetchDosePatterns = useCallback(async () => {
    try {
      setDosePatternsLoading(true);
      
      const response = await api.get('/api/dose-patterns');
      
      if (response.status === 200) {
        const data = response.data;
        
        // Check if we have patterns in the response
        if (data.success && data.data && data.data.length > 0) {
          setDosePatterns(data.data);
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
  }, [fallbackDosePatterns]);

  // Function to fetch item master data
  const fetchItemMasterItems = useCallback(async (searchTerm = '') => {
    try {
      console.log('🔍 Fetching item master items for search term:', searchTerm);
      
      setItemMasterLoading(true);
      setItemMasterError(null);
      
      let url;
      if (searchTerm && searchTerm.trim().length >= 2) {
        // Use search endpoint for specific searches
        const params = new URLSearchParams();
        params.append('q', searchTerm);
        params.append('limit', '50');
        url = `/api/item-master/search?${params.toString()}`;
      } else {
        // Use main endpoint to load ALL items - explicitly set no limit
        url = `/api/item-master?offset=0`;
      }
      
      console.log('🌐 API URL:', url);
      console.log('🌐 Full URL:', `${appConfig.apiBaseUrl}${url}`);
      
      const response = await api.get(url);
      console.log('📡 API Response:', response);
      
      if (response.status === 200) {
        const data = response.data;
        console.log('📋 Response data:', data);
        
        if (data.success && data.data && Array.isArray(data.data)) {
          setItemMasterItems(data.data);
          setFilteredMedications(data.data);
          console.log('✅ Item master items loaded:', data.data.length);
          console.log('📋 First few items:', data.data.slice(0, 3));
          console.log('📋 All items for dropdown:', data.data.map(item => item.item_name).slice(0, 10));
        } else {
          console.log('⚠️ No items found in response:', data);
          setItemMasterItems([]);
          setFilteredMedications([]);
        }
      } else {
        console.log('❌ Failed to fetch item master items:', response.status);
        setItemMasterError('Failed to fetch medication items');
      }
    } catch (error) {
      console.error('❌ Error fetching item master items:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setItemMasterError(error.message);
    } finally {
      setItemMasterLoading(false);
    }
  }, []); // Remove dependency to prevent circular dependency

  // useEffect to load initial data after functions are defined
  useEffect(() => {
    let isMounted = true;
    
    const fetchLabTests = async () => {
      try {
        if (!isMounted) return;
        setLabTestsLoading(true);
        setLabTestsError(null);
        
        const response = await api.get('/api/lab-tests/tests?all=true');
        
        if (response.status === 200 && isMounted) {
          const data = response.data;
          const tests = data.tests || [];
             
          if (tests.length === 0) {
            setLabTestsError('No tests available in the database.');
          } else {
            setLabTestsFromDB(tests);
            setFilteredTests(tests);
            
            try {
              const organizedTests = organizeTestsByCategory(tests);
              setLabTestCategories(organizedTests);
            } catch (orgError) {
              setLabTestCategories([]);
            }
         
            console.log(`✅ Lab tests loaded successfully: ${tests.length} tests`);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ Error fetching lab tests:', error.message);
          setLabTestsError(`Failed to load laboratory tests: ${error.message}`);
          setLabTestsFromDB([]);
          setLabTestCategories([]);
        }
      } finally {
        if (isMounted) {
          setLabTestsLoading(false);
        }
      }
    };

    const loadInitialData = async () => {
      if (!isMounted) return;
      
      // Load lab tests
      await fetchLabTests();
      
      // Load dose patterns only if not already loaded
      if (dosePatterns.length === 0) {
        await fetchDosePatterns();
      }
      
      // Load item master items only if not already loaded
      if (itemMasterItems.length === 0) {
        await fetchItemMasterItems('');
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

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

  


  // Function to load past prescriptions
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

  // Fetch patient data based on patientId from URL
  useEffect(() => {
    console.log('🔍 EPrescription useEffect - patientId:', patientId);
    console.log('🔍 EPrescription useEffect - location.state:', location.state);
    
    // Fetch doctor data first
    fetchDoctorData();
    
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
              clinicName: 'HIMSHIKHA NURSING HOME',
              address: 'Plot No 1,Near CRPF Camp Himshika,Pinjore',
              city: 'Panchkula',
              state: 'Haryana',
              pincode: '134112',
              phone: '9815368811',
              email: 'info@demr.com',
              website: 'www.demr.com',
              license: 'CLINIC-LICENSE-001',
              registration: 'REG-2024-001',
              prescriptionValidity: 30
            });
          }
        } else {
          console.error('❌ Failed to fetch clinic data, status:', response.status);
          // Set fallback data
          setClinicData({
            clinicName: 'HIMSHIKHA NURSING HOME',
            address: 'Plot No 1,Near CRPF Camp Himshika,Pinjore',
            city: 'Panchkula',
            state: 'Haryana',
            pincode: '134112',
            phone: '9815368811',
            email: 'info@demr.com',
            website: 'www.demr.com',
            license: 'CLINIC-LICENSE-001',
            registration: 'REG-2024-001',
            prescriptionValidity: 30
          });
        }
      } catch (error) {
        console.error('❌ Error fetching clinic data:', error);
        // Set fallback data
        setClinicData({
          clinicName: 'HIMSHIKHA NURSING HOME',
          address: 'Plot No 1,Near CRPF Camp Himshika,Pinjore',
          city: 'Panchkula',
          state: 'Haryana',
          pincode: '134112',
          phone: '9815368811',
          email: 'info@demr.com',
          website: 'www.demr.com',
          license: 'CLINIC-LICENSE-001',
          registration: 'REG-2024-001',
          prescriptionValidity: 30
        });
      }
    };

    fetchClinicData();
  }, []);

     // Load existing prescription data if editing or viewing
   useEffect(() => {
     // Only load existing prescription data in edit or view mode
     // Don't run this in new mode to avoid overwriting freshly saved data
     if ((mode === 'edit' || mode === 'view') && prescription.prescriptionId) {
       const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
       const existingPrescription = savedPrescriptions.find(p => 
         p.prescriptionId === prescription.prescriptionId && p.patientId === parseInt(patientId)
       );
       
       if (existingPrescription) {
         console.log('🔄 Loading existing prescription from localStorage:', existingPrescription);
         setPrescription(existingPrescription);
         if (existingPrescription.labTestRecommendations) {
           setSelectedLabTests(existingPrescription.labTestRecommendations);
         }
       }
     }
   }, [mode, prescription.prescriptionId, patientId]);

  const addMedication = () => {
    const newMedication = {
      id: Date.now(),
      name: '',
      dosage: '',
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
    console.log('🔄 Updating medication:', { id, field, value });
    setPrescription(prev => {
      const updated = {
        ...prev,
        medications: prev.medications.map(med => 
          med.id === id ? { ...med, [field]: value } : med
        )
      };
      console.log('📝 Updated prescription medications:', updated.medications);
      return updated;
    });
  };

  const removeMedication = (id) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== id)
    }));
  };

  // Handle medication search
  const handleMedicationSearch = (medId, searchTerm) => {
    console.log('🔍 Medication search:', { medId, searchTerm });
    console.log('🔍 Current itemMasterItems length:', itemMasterItems.length);
    console.log('🔍 Current filteredMedications length:', filteredMedications.length);
    
    setMedicationSearchTerm(prev => ({
      ...prev,
      [medId]: searchTerm
    }));
    
    if (searchTerm.length >= 2) {
      // Show dropdown while searching
      console.log('🔍 Showing dropdown for medId:', medId);
      setShowMedicationDropdown(prev => ({
        ...prev,
        [medId]: true
      }));
      fetchItemMasterItems(searchTerm);
    } else {
      setFilteredMedications(itemMasterItems);
      // Hide dropdown if search term is too short
      setShowMedicationDropdown(prev => ({
        ...prev,
        [medId]: false
      }));
    }
  };

  // Handle medication selection from dropdown
  const handleMedicationSelect = (medId, selectedItem) => {
    console.log('🎯 Medication selected for medId:', medId, 'Item:', selectedItem);
    
    // Update medication with selected item data
    updateMedication(medId, 'name', selectedItem.item_name);
    updateMedication(medId, 'genericName', selectedItem.generic_name);
    updateMedication(medId, 'brand', selectedItem.brand);
    updateMedication(medId, 'category', selectedItem.category);
    updateMedication(medId, 'subcategory', selectedItem.subcategory);
    updateMedication(medId, 'unit', selectedItem.unit);
    updateMedication(medId, 'hsnCode', selectedItem.hsn_code);
    updateMedication(medId, 'gstRate', selectedItem.gst_rate);
    
    console.log('✅ Medication updated with:', {
      name: selectedItem.item_name,
      genericName: selectedItem.generic_name,
      brand: selectedItem.brand
    });
    
    // Close dropdown
    setShowMedicationDropdown(prev => ({
      ...prev,
      [medId]: false
    }));
    
    // Clear search term
    setMedicationSearchTerm(prev => ({
      ...prev,
      [medId]: ''
    }));
    
    console.log('🔒 Dropdown closed for medId:', medId);
    
    // Show success message
    setSelectedMedication({ medId, item: selectedItem });
    setTimeout(() => {
      setSelectedMedication(null);
    }, 2000);
  };

  // Toggle medication dropdown
  const toggleMedicationDropdown = (medId) => {
    setShowMedicationDropdown(prev => ({
      ...prev,
      [medId]: !prev[medId]
    }));
  };

  // Close all medication dropdowns
  const closeAllMedicationDropdowns = () => {
    setShowMedicationDropdown({});
  };

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.medication-dropdown')) {
        closeAllMedicationDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


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
    console.log('🚀 Starting handleSave function...');
    
    // Validate required fields - check diagnoses array
    if (!prescription.diagnoses || prescription.diagnoses.length === 0) {
      console.log('❌ Validation failed: No diagnoses');
      toast({
        title: "Validation Error",
        description: "Please add at least one diagnosis.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Check if there are any medications at all (before filtering)
    if (!prescription.medications || prescription.medications.length === 0) {
      console.log('❌ Validation failed: No medications');
      toast({
        title: "Validation Error",
        description: "Please add at least one medication.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Filter out empty/incomplete medications - only save medications that are properly filled
    const validMedications = (prescription.medications || []).filter(med => 
      med.name && med.name.trim() !== '' && 
      med.dosage && med.dosage.trim() !== '' && 
      med.durationValue && med.durationUnit
    );
    
    if (validMedications.length === 0) {
      console.log('❌ Validation failed: No valid medications');
      toast({
        title: "Validation Error",
        description: "Please add at least one medication with all required fields (name, dosage, duration).",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    console.log('✅ Valid medications to save:', validMedications.length, 'out of', (prescription.medications || []).length);

    console.log('✅ Validation passed, proceeding with save...');

    try {
      // First, save prescription to backend database
      const prescriptionData = {
        patientId: parseInt(patientId),
        doctorId: doctorData ? parseInt(doctorData.id) : 200, // Use actual logged-in doctor ID, fallback to valid doctor
        date: prescription.date,
        diagnosis: prescription.diagnoses ? prescription.diagnoses.join(', ') : '', // Convert array to string
        symptoms: prescription.complaints ? prescription.complaints.join(', ') : '', // Map complaints to symptoms
        examination: prescription.examination,
        medications: validMedications, // Only save valid/selected medications
        instructions: prescription.instructions,
        followUp: prescription.followUp,
        labTestRecommendations: selectedLabTests
      };


      // Determine if this is a new prescription or an update
      // For new prescriptions, we should always use POST
      // For edit mode, we should use PUT only if prescription.id exists
      const isUpdate = mode === 'edit' && prescription.id && prescription.id !== undefined;
      const url = isUpdate ? `/api/prescriptions/${prescription.id}` : '/api/prescriptions';
      const method = isUpdate ? 'PUT' : 'POST';
      
      console.log('🔍 Prescription Save Debug:', {
        mode,
        prescriptionId: prescription.prescriptionId,
        prescriptionDbId: prescription.id,
        isUpdate,
        url,
        method,
        doctorId: doctorData ? doctorData.id : 'No doctor data',
        prescriptionData: prescriptionData
      });

      console.log('📤 Making API request to:', url, 'with method:', method);
      console.log('📤 Request body:', JSON.stringify(prescriptionData, null, 2));

      const prescriptionResponse = await fetch(`${appConfig.apiBaseUrl}${url}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      });

      console.log('📥 API Response status:', prescriptionResponse.status);
      console.log('📥 API Response headers:', prescriptionResponse.headers);

      if (!prescriptionResponse.ok) {
        const errorText = await prescriptionResponse.text();
        console.log('❌ API Error Response:', errorText);
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
      console.log('✅ API Success Response:', savedPrescription);

      // Handle response format for both POST and PUT
      const savedPrescriptionData = isUpdate ? savedPrescription.prescription : savedPrescription.prescription;
      console.log('📋 Saved Prescription Data:', savedPrescriptionData);

      // Parse medications from the saved prescription data
      let savedMedications = validMedications; // Use only valid medications that were saved
      if (savedPrescriptionData.medications) {
        try {
          if (typeof savedPrescriptionData.medications === 'string') {
            savedMedications = JSON.parse(savedPrescriptionData.medications);
          } else {
            savedMedications = savedPrescriptionData.medications;
          }
          console.log('📋 Parsed saved medications:', savedMedications);
        } catch (error) {
          console.error('❌ Error parsing saved medications:', error);
        }
      }

      // Update the current prescription state with the saved data from backend
      const updatedPrescription = {
        ...prescription,
        prescriptionId: savedPrescriptionData.prescriptionId,
        id: savedPrescriptionData.id,
        patientId: parseInt(patientId),
        patientData,
        medications: savedMedications, // Include the saved medications
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
      
      // Create pharmacy items for selected medications
      if (savedMedications && savedMedications.length > 0) {
        await createPharmacyItems(updatedPrescription, savedMedications);
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
      console.log('💥 handleSave Error:', error);
      console.log('💥 Error message:', error.message);
      console.log('💥 Error stack:', error.stack);
      toast({
        title: "Save Error",
        description: `Error saving prescription: ${error.message}`,
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
      const testDetails = selectedLabTests.map(testObj => {
        // Find test in the database data
        const test = labTestsFromDB.find(t => t.testCode === testObj.testCode);
        
        if (test) {
          return {
            testId: test.id, // Use the database ID, not testCode
            testName: test.testName,
            testCode: test.testCode,
            price: test.price || testObj.price || 0,
            clinicalNotes: (prescriptionData.diagnoses && prescriptionData.diagnoses.length > 0) 
              ? prescriptionData.diagnoses.join(', ') 
              : '',
            instructions: prescriptionData.instructions || ''
          };
        } else {
          console.warn(`Test not found for testCode: ${testObj.testCode}`);
          return {
            testId: testObj.testCode,
            testName: testObj.testName || testObj.testCode,
            testCode: testObj.testCode,
            price: testObj.price || 0,
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
        doctorId: doctorData ? parseInt(doctorData.id) : 200, // Use actual logged-in doctor ID, fallback to valid doctor
        tests: testDetails,
        clinicalNotes: prescriptionData.diagnosis || '',
        instructions: prescriptionData.instructions || '',
        priority: 'routine'
      };

      const response = await api.post(`/api/prescriptions/${prescriptionData.id}/lab-order`, orderData);

      if (response.status === 200 || response.status === 201) {
        const orderResult = response.data;
        const orderCount = orderResult.orderCount || 1;
        const orderIds = orderResult.orders ? orderResult.orders.map(o => o.orderId).join(', ') : orderResult.orderId;
        toast({
          title: "Lab Test Order Created",
          description: `${orderCount} order(s) created. Order ID(s): ${orderIds}`,
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

  // Function to create pharmacy items for selected medications
  const createPharmacyItems = async (prescriptionData, medications) => {
    try {
      console.log('🏥 Creating pharmacy items for medications:', medications);
      console.log('🏥 Prescription ID:', prescriptionData.id);
      
      if (!medications || medications.length === 0) {
        console.log('⚠️ No medications to create pharmacy items for');
        return;
      }
      
      // Check if pharmacy items already exist for this prescription
      try {
        const existingItemsResponse = await api.get(`/api/pharmacy/prescription-items/${prescriptionData.id}`);
        if (existingItemsResponse.status === 200 && existingItemsResponse.data.data && existingItemsResponse.data.data.length > 0) {
          console.log('⏭️ Pharmacy items already exist for this prescription, skipping creation');
          return;
        }
      } catch (error) {
        // If error, continue with creation (items might not exist yet)
        console.log('🔍 No existing pharmacy items found, proceeding with creation');
      }

      // Find the item_code for each medication from item_master
      const pharmacyItems = [];
      
      for (const medication of medications) {
        if (medication.name) {
          // Find the corresponding item in item_master by name
          const matchingItem = itemMasterItems.find(item => 
            item.item_name === medication.name
          );
          
          if (matchingItem) {
            pharmacyItems.push({
              item_icode: matchingItem.item_code,
              is_prescription_required: matchingItem.is_prescription_required || false,
              barcode: matchingItem.barcode || '',
              is_active: true,
              prescriptionId: prescriptionData.id
            });
            console.log('✅ Found item for medication:', medication.name, '→ item_code:', matchingItem.item_code);
          } else {
            console.warn('⚠️ No matching item found for medication:', medication.name);
            // Create a fallback entry with a generated item_code
            pharmacyItems.push({
              item_icode: `GEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              is_prescription_required: true,
              barcode: '',
              is_active: true,
              prescriptionId: prescriptionData.id
            });
          }
        }
      }

      if (pharmacyItems.length === 0) {
        console.log('⚠️ No pharmacy items to save');
        return;
      }

      // Save pharmacy items to database
      console.log('💾 Saving pharmacy items:', pharmacyItems);
      
      const response = await api.post('/api/pharmacy/prescription-items', {
        prescriptionId: prescriptionData.id,
        items: pharmacyItems
      });

      if (response.status === 200 || response.status === 201) {
        console.log('✅ Pharmacy items saved successfully');
        toast({
          title: "Pharmacy Items Created",
          description: `${pharmacyItems.length} medication(s) added to pharmacy orders.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        console.warn('⚠️ Pharmacy items save response:', response.status);
      }

    } catch (error) {
      console.error('❌ Error creating pharmacy items:', error);
      toast({
        title: "Pharmacy Items Warning",
        description: "Medications saved but pharmacy items creation failed. Contact pharmacy staff.",
        status: "warning",
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
      status: 'in-progress' // Mark as in progress
    };
         setPrescription(newPrescription);
     setSelectedLabTests([]);
     setMode('new');
  };

     // Check if prescription is ready to be saved
  const isPrescriptionReady = () => {
    // Check if there are diagnoses
    const hasDiagnoses = prescription.diagnoses && prescription.diagnoses.length > 0;
    
    // Check if there are valid medications (properly filled out)
    const validMedications = (prescription.medications || []).filter(med => 
      med.name && med.name.trim() !== '' && 
      med.dosage && med.dosage.trim() !== '' && 
      med.durationValue && med.durationUnit
    );
    const hasValidMedications = validMedications.length > 0;
    
    return hasDiagnoses && hasValidMedications;
  };

  const handlePrint = () => {
    console.log('🖨️ Print function called');
    console.log('🖨️ Doctor data:', doctorData);
    console.log('🖨️ Doctor name:', doctorData?.name);
    console.log('🖨️ Doctor ID:', doctorData?.id);
    console.log('🖨️ Doctor code:', doctorData?.doctor_code);
    
    const printElement = document.getElementById('printable-prescription');
    const printContent = printElement?.innerHTML || 'No printable content found';
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
              <Text>Backend API: {appConfig.apiBaseUrl}</Text>
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
      {/* Success message for medication selection */}
      {selectedMedication && (
        <Box
          position="fixed"
          top="20px"
          right="20px"
          bg="green.500"
          color="white"
          p={4}
          borderRadius="md"
          boxShadow="lg"
          zIndex={100000}
        >
          <Text fontWeight="bold">
            ✅ Medication Selected: {selectedMedication.item.item_name}
          </Text>
        </Box>
      )}

      {/* Doctor Login Information */}
      {doctorData && (
        <Box
          bg="blue.50"
          border="1px solid"
          borderColor="blue.200"
          borderRadius="md"
          p={4}
          m={4}
          mx="auto"
          maxW="7xl"
        >
          <Flex align="center" gap={3}>
            <Box
              bg="blue.500"
              color="white"
              borderRadius="full"
              p={2}
              fontSize="sm"
              fontWeight="bold"
            >
              👨‍⚕️
            </Box>
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" color="blue.700">
                Logged in as: {doctorData.name || 'Dr. Suneet Verma'}
              </Text>
              <Text fontSize="sm" color="blue.600">
                Specialization: {doctorData.specialization || 'Internal Medicine'} | 
                Doctor Code: {doctorData.doctor_code || 'DOC-419433-N3Y'}
              </Text>
            </VStack>
          </Flex>
        </Box>
      )}

      <Container maxW="7xl" flex="1" p={4} pb={24}>
        {/* Header */}
        <Card mb={4}>
          <CardBody p={4}>
            <Flex direction="column" gap={4}>
              <Button
                leftIcon={<Icon as={FaArrowLeft} />}
                variant="outline"
                colorScheme="gray"
                onClick={() => navigate('/doctor')} 
                alignSelf="flex-start"
                size="sm"
              >
                Back to Doctor Dashboard
              </Button>
              
              <Flex justify="space-between" align="flex-start" wrap="wrap" gap={4}>
                <Box>
                  <Heading size="lg" color="health.600" mb={2}>
                    <HStack>
                      <Icon as={FaPrescription} />
                      <Text>
                        {mode === 'new' ? 'New E-Prescription' : mode === 'edit' ? 'Edit E-Prescription' : 'View E-Prescription'}
                      </Text>
                    </HStack>
                  </Heading>
                  
                  <Flex wrap="wrap" gap={2} align="center">
                    <Text color="gray.600" fontSize="sm">
                      🆔 Patient #{patientData.patientId || patientData.id} • {patientData.firstName} {patientData.lastName} • {patientData.age} years • {patientData.gender}
                    </Text>
                    
                    {pastPrescriptions && pastPrescriptions.length > 0 && (
                      <Badge colorScheme="success" variant="solid" fontSize="xs">
                        🔄 Follow-up Patient ({pastPrescriptions.length} previous)
                      </Badge>
                    )}
                    
                    <Badge 
                      colorScheme={prescription.status === 'completed' ? 'success' : 'warning'} 
                      variant="solid" 
                      fontSize="xs"
                    >
                      {prescription.status === 'completed' ? '✅ Completed' : '⏳ In Progress'}
                    </Badge>
                  </Flex>
                </Box>
                
                <Text fontSize="xs" color="gray.500" maxW="300px">
                  💡 Use the action bar at the bottom to save, print, or create new prescriptions
                </Text>
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        {/* Main Content Grid */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={4}>
          {/* Left Column - Prescription Form */}
          <GridItem>
            <Flex direction="column" gap={4}>
              {/* Patient Information & Vital Signs */}
              <Card>
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="center">
                    <Heading size="sm" color="health.600">
                      <HStack>
                        <Icon as={FaUser} />
                        <Text>Patient Information</Text>
                      </HStack>
                    </Heading>
                    <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                      {patientData.age} years • {patientData.gender}
                    </Badge>
                  </Flex>
                </CardHeader>
                <CardBody p={4}>
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>🆔 Patient ID</Text>
                      <Text fontWeight="semibold" fontSize="sm">#{patientData.patientId || patientData.id}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>Name</Text>
                      <Text fontWeight="semibold" fontSize="sm">{patientData.firstName}{patientData.middleName ? ` ${patientData.middleName}` : ''} {patientData.lastName}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>Blood Group</Text>
                      <Text fontWeight="semibold" fontSize="sm">{patientData.bloodGroup || 'Not recorded'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>Phone</Text>
                      <Text fontWeight="semibold" fontSize="sm">{patientData.phone}</Text>
                    </Box>
                  </SimpleGrid>
                  
                  <Box mt={4}>
                    <Text fontSize="xs" color="gray.500" mb={1}>Address</Text>
                    <Text fontWeight="semibold" fontSize="sm">{patientData.address}</Text>
                  </Box>

                  {/* Vital Signs */}
                  <Box mt={4} pt={4} borderTop="1px solid" borderColor="gray.200">
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
                      <HStack>
                        <Icon as={FaHeartbeat} />
                        <Text>Vital Signs</Text>
                      </HStack>
                    </Text>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                      <Box>
                        <Text fontSize="xs" color="gray.500">Temperature</Text>
                        <Text fontWeight="semibold" fontSize="sm">{patientData.vitalSigns?.temperature || 'Not recorded'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500">Blood Pressure</Text>
                        <Text fontWeight="semibold" fontSize="sm">{patientData.vitalSigns?.bloodPressure || 'Not recorded'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500">Pulse</Text>
                        <Text fontWeight="semibold" fontSize="sm">{patientData.vitalSigns?.pulse || 'Not recorded'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500">Weight</Text>
                        <Text fontWeight="semibold" fontSize="sm">{patientData.vitalSigns?.weight || 'Not recorded'}</Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </CardBody>
              </Card>



              {/* Diagnosis & Symptoms */}
              <Card>
                <CardHeader pb={2}>
                  <Heading size="sm" color="health.600">
                    <HStack>
                      <Icon as={FaStethoscope} />
                      <Text>Diagnosis & Symptoms</Text>
                    </HStack>
                  </Heading>
                </CardHeader>
                <CardBody p={4}>
                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                    {/* Chief Complaints */}
                    <Box>
                      <Text fontWeight="semibold" mb={2} color="gray.700" fontSize="sm">
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
                              onChange={(e) => handleMedicalTextInput(e.target.value, setComplaintInput)}
                              onKeyPress={handleComplaintKeyPress}
                              onBlur={() => {
                                const corrected = applyMedicalTextCorrection(complaintInput, setComplaintInput);
                              }}
                              placeholder="Enter complaint and press Enter or click Add (Auto-corrects on blur)"
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
                      <Text fontWeight="semibold" mb={2} color="gray.700" fontSize="sm">
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
                              onChange={(e) => handleMedicalTextInput(e.target.value, setDiagnosisInput)}
                              onKeyPress={handleDiagnosisKeyPress}
                              onBlur={() => {
                                const corrected = applyMedicalTextCorrection(diagnosisInput, setDiagnosisInput);
                              }}
                              placeholder="Enter diagnosis and press Enter or click Add (Auto-corrects on blur)"
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
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="center">
                    <Heading size="sm" color="health.600">
                      <HStack>
                        <Icon as={FaPills} />
                        <Text>Medicine Prescription</Text>
                      </HStack>
                    </Heading>
                    {mode !== 'view' && (
                      <Button
                        onClick={addMedication}
                        colorScheme="blue"
                        size="xs"
                        leftIcon={<Icon as={FaPlus} />}
                      >
                        Add Medication
                      </Button>
                    )}
                  </Flex>
                </CardHeader>
                <CardBody p={4}>


                    {/* Prescribed Medications Table */}
                    {prescription.medications && prescription.medications.length > 0 && (
                      <Box
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        overflow="visible"
                        bg="white"
                        maxW="100%"
                      >
                        <Box
                          overflowX="auto"
                          maxH="400px"
                          overflowY="visible"
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
                                  minW="200px"
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
                                  w="280px"
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
                                  w="220px"
                                  bg="blue.600"
                                  border="1px solid"
                                  borderColor="blue.700"
                                  px={2}
                                  py={3}
                                >
                                  Duration
                                </Th>
                                {mode !== 'view' && (
                                  <Th 
                                    color="white" 
                                    fontSize="sm" 
                                    fontWeight="bold" 
                                    w="60px" 
                                    textAlign="center"
                                    bg="blue.600"
                                    border="1px solid"
                                    borderColor="blue.700"
                                    px={2}
                                    py={3}
                                  >
                                    #
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
                                  <Td fontSize="sm">
                                    <Select
                                      value={(() => {
                                        const selectValue = med.name && med.genericName && med.brand ? `${med.name}|${med.genericName}|${med.brand}` : '';
                                        console.log('🎯 Select value for med', med.id, ':', selectValue);
                                        return selectValue;
                                      })()}
                                      onChange={(e) => {
                                        console.log('🎯 Medication selection changed:', e.target.value);
                                        console.log('🎯 For medication ID:', med.id);
                                        console.log('🎯 Current medication values:', { name: med.name, genericName: med.genericName, brand: med.brand });
                                        const selectedValue = e.target.value;
                                        if (selectedValue) {
                                          // Parse the selected medication data
                                          const [itemName, genericName, brand] = selectedValue.split('|');
                                          console.log('🎯 Parsed values:', { itemName, genericName, brand });
                                          updateMedication(med.id, 'name', itemName);
                                          updateMedication(med.id, 'genericName', genericName);
                                          updateMedication(med.id, 'brand', brand);
                                          console.log('✅ Medication updated successfully');
                                        } else {
                                          console.log('🎯 Clearing medication');
                                          updateMedication(med.id, 'name', '');
                                        }
                                      }}
                                      disabled={mode === 'view'}
                                      size="sm"
                                      fontSize="sm"
                                      border="none"
                                      bg="transparent"
                                      _focus={{ border: "1px solid", borderColor: "blue.300" }}
                                    >
                                      <option value="">Select medication</option>
                                      {itemMasterLoading ? (
                                        <option value="" disabled>Loading medications...</option>
                                      ) : itemMasterError ? (
                                        <>
                                          <option value="" disabled>Error: {itemMasterError}</option>
                                          <option value="AMARYL 1mg Tablet|Glimepiride|Sanofi">AMARYL 1mg Tablet (Glimepiride - Sanofi)</option>
                                          <option value="Paracetamol 500mg Tablet|Paracetamol|Generic">Paracetamol 500mg Tablet (Paracetamol - Generic)</option>
                                          <option value="Ibuprofen 400mg Tablet|Ibuprofen|Generic">Ibuprofen 400mg Tablet (Ibuprofen - Generic)</option>
                                        </>
                                      ) : filteredMedications && filteredMedications.length > 0 ? (
                                        filteredMedications.map(item => {
                                          const optionValue = `${item.item_name}|${item.generic_name}|${item.brand}`;
                                          // Only log every 10th item to reduce console spam
                                          if (item.id % 10 === 0) {
                                            console.log('📋 Rendering medication option:', item.item_name, 'Value:', optionValue);
                                          }
                                          return (
                                            <option key={item.id} value={optionValue}>
                                              {item.item_name} ({item.generic_name} - {item.brand})
                                            </option>
                                          );
                                        })
                                      ) : (
                                        <>
                                          <option value="AMARYL 1mg Tablet|Glimepiride|Sanofi">AMARYL 1mg Tablet (Glimepiride - Sanofi)</option>
                                          <option value="Paracetamol 500mg Tablet|Paracetamol|Generic">Paracetamol 500mg Tablet (Paracetamol - Generic)</option>
                                          <option value="Ibuprofen 400mg Tablet|Ibuprofen|Generic">Ibuprofen 400mg Tablet (Ibuprofen - Generic)</option>
                                          <option value="Omeprazole 20mg Capsule|Omeprazole|Generic">Omeprazole 20mg Capsule (Omeprazole - Generic)</option>
                                          <option value="Metformin 500mg Tablet|Metformin|Generic">Metformin 500mg Tablet (Metformin - Generic)</option>
                                        </>
                                      )}
                                    </Select>
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
                                          <option key={pattern.id} value={pattern.dose_value}>
                                            {pattern.dose_value} - {pattern.description_hindi}
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
                                  {mode !== 'view' && (
                                    <Td textAlign="center">
                                      <IconButton
                                        onClick={() => removeMedication(med.id)}
                                        colorScheme="red"
                                        size="sm"
                                        icon={<Icon as={FaTrash} />}
                                        aria-label="Remove medication"
                                      />
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

              {/* Lab Test Recommendations */}
              <Card>
                <Accordion allowToggle>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Flex justify="space-between" align="center" w="full">
                          <HStack>
                            <Icon as={FaFlask} />
                            <Text fontWeight="semibold" fontSize="sm">Laboratory Test Recommendations</Text>
                          </HStack>
                          {selectedLabTests.length > 0 && (
                            <Badge colorScheme="green" variant="solid" fontSize="xs">
                              {selectedLabTests.length} selected
                            </Badge>
                          )}
                        </Flex>
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
              </Flex>
            </GridItem>

            {/* Right Column - Past Prescriptions */}
            <GridItem>
              <Flex direction="column" gap={4}>
                {/* Past Prescriptions */}
                {pastPrescriptions && pastPrescriptions.length > 0 && (
                  <Card>
                    <CardHeader pb={2}>
                      <Flex justify="space-between" align="center">
                        <Heading size="sm" color="health.600">
                          <HStack>
                            <Icon as={FaPrescription} />
                            <Text>Previous Prescriptions ({pastPrescriptions.length})</Text>
                          </HStack>
                        </Heading>
                        <Button 
                          colorScheme="gray"
                          size="xs"
                          onClick={() => setShowPastPrescriptions(!showPastPrescriptions)}
                        >
                          {showPastPrescriptions ? 'Hide' : 'Show'}
                        </Button>
                      </Flex>
                    </CardHeader>
                    
                    {showPastPrescriptions && (
                      <CardBody p={4}>
                        <VStack spacing={3} align="stretch">
                          {pastPrescriptions.slice(0, 3).map((prescription, index) => (
                            <Box 
                              key={prescription.prescriptionId}
                              p={3}
                              border="1px solid"
                              borderColor="gray.200"
                              borderRadius="md"
                              bg="white"
                            >
                              <Flex justify="space-between" align="flex-start" mb={2}>
                                <Box>
                                  <Text fontWeight="semibold" fontSize="sm" color="gray.800">
                                    #{prescription.prescriptionId}
                                  </Text>
                                  <Text fontSize="xs" color="gray.600">
                                    {new Date(prescription.date).toLocaleDateString()}
                                  </Text>
                                </Box>
                                {mode !== 'view' && (
                                  <Button 
                                    colorScheme="blue"
                                    size="xs"
                                    onClick={() => copyFromPastPrescription(prescription)}
                                    leftIcon={<Icon as={FaPlus} />}
                                  >
                                    Copy
                                  </Button>
                                )}
                              </Flex>
                              
                              {prescription.medications && prescription.medications.length > 0 && (
                                <Box mb={2}>
                                  <Text fontWeight="semibold" color="gray.800" fontSize="xs" mb={1}>Medications:</Text>
                                  <Text fontSize="xs" color="gray.600">
                                    {prescription.medications.slice(0, 2).map(med => med.name).join(', ')}
                                    {prescription.medications.length > 2 && ` +${prescription.medications.length - 2} more`}
                                  </Text>
                                </Box>
                              )}
                            </Box>
                          ))}
                          
                          {pastPrescriptions.length > 3 && (
                            <Text fontSize="xs" color="gray.500" textAlign="center">
                              +{pastPrescriptions.length - 3} more prescriptions
                            </Text>
                          )}
                        </VStack>
                      </CardBody>
                    )}
                  </Card>
                )}

                {/* No Prescriptions Message */}
                {(!pastPrescriptions || pastPrescriptions.length === 0) && patientId && (
                  <Card bg="yellow.50" border="1px solid" borderColor="yellow.200">
                    <CardBody p={4} textAlign="center">
                      <Text fontWeight="semibold" color="yellow.800" fontSize="sm" mb={1}>📋 No Previous Prescriptions</Text>
                      <Text fontSize="xs" color="yellow.700">
                        This is the first prescription for this patient.
                      </Text>
                    </CardBody>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader pb={2}>
                    <Heading size="sm" color="health.600">
                      <HStack>
                        <Icon as={FaNotesMedical} />
                        <Text>Quick Actions</Text>
                      </HStack>
                    </Heading>
                  </CardHeader>
                  <CardBody p={4}>
                    <VStack spacing={2} align="stretch">
                      <Button
                        onClick={handlePrint}
                        variant="outline"
                        size="sm"
                        leftIcon={<Icon as={FaPrint} />}
                        colorScheme="blue"
                        w="full"
                      >
                        Print Prescription
                      </Button>
                      
                      {mode !== 'view' && (
                        <Button
                          leftIcon={<Icon as={FaPlus} />}
                          colorScheme="blue"
                          variant="outline"
                          size="sm"
                          onClick={handleNewPrescription}
                          w="full"
                        >
                          New Prescription
                        </Button>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </Flex>
            </GridItem>
          </Grid>
        </Container>
      
      {/* Sticky Footer with Action Buttons */}
      <Box
        position="sticky"
        bottom={0}
        zIndex={100}
        bg="white"
        borderTop="1px solid"
        borderColor="gray.200"
        p={3}
        boxShadow="sm"
      >
        <Container maxW="7xl">
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Flex align="center" gap={3}>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                {patientData?.firstName} {patientData?.lastName}
              </Text>
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
            </Flex>
            
            <Flex gap={2} wrap="wrap">
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                leftIcon={<Icon as={FaPrint} />}
                colorScheme="blue"
              >
                Print
              </Button>
              
              {mode !== 'view' && (
                <Button
                  leftIcon={<Icon as={FaPlus} />}
                  colorScheme="blue"
                  variant="outline"
                  size="sm"
                  onClick={handleNewPrescription}
                >
                  New
                </Button>
              )}
              
              <Button
                leftIcon={<Icon as={FaSave} />}
                colorScheme={isPrescriptionReady() ? 'green' : 'gray'}
                onClick={handleSave}
                isDisabled={!isPrescriptionReady()}
                size="md"
                px={6}
                fontWeight="semibold"
              >
                {isPrescriptionReady() ? 'Save Prescription' : 'Save Prescription'}
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Printable Prescription */}
            <Box id="printable-prescription" display="none" data-version="2024-12-20">
        <style>
          {`
            @media print {
              @page {
                size: A4;
                margin: 0.15in;
              }
              body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Arial', sans-serif;
                font-size: 9px;
                line-height: 1.1;
                color: #333;
                background: white;
              }
              .no-print { display: none !important; }
              #printable-prescription { 
                display: block !important; 
                position: relative;
                page-break-inside: avoid;
                background: white;
                color: #333;
              }
              .prescription-page {
                max-width: 100%;
                margin: 0 auto;
                padding: 3px;
                background: white;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              
              /* Header Section */
              .clinic-header {
                text-align: center;
                border-bottom: 1px solid #2563eb;
                padding-bottom: 4px;
                margin-bottom: 5px;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 6px;
                border-radius: 4px 4px 0 0;
              }
              .clinic-name {
                font-size: 14px;
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 2px;
                letter-spacing: 0.3px;
              }
              .clinic-details {
                font-size: 8px;
                color: #64748b;
                margin-bottom: 1px;
                font-weight: 500;
              }
              
              /* Prescription Title */
              .prescription-title {
                text-align: center;
                font-size: 12px;
                font-weight: bold;
                margin: 5px 0;
                color: #1e40af;
                text-decoration: underline;
                letter-spacing: 0.5px;
              }
              
              /* Prescription Meta */
              .prescription-meta {
                display: flex;
                justify-content: space-between;
                font-size: 8px;
                margin-bottom: 5px;
                padding: 3px;
                background: #f1f5f9;
                border-radius: 3px;
                border-left: 2px solid #2563eb;
              }
              
              /* Content Sections */
              .content-section {
                margin-top: 5px;
              }
              
              .info-section {
                margin-bottom: 5px;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                overflow: hidden;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
              }
              
              .section-title {
                background: #2563eb;
                color: white;
                font-weight: bold;
                font-size: 9px;
                padding: 4px 6px;
                margin: 0;
                text-transform: uppercase;
                letter-spacing: 0.2px;
              }
              
              .section-content {
                padding: 5px;
                background: white;
              }
              
              /* Patient & Doctor Info */
              .patient-doctor-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 5px;
                font-size: 8px;
              }
              
              .patient-info, .doctor-info {
                padding: 4px;
                background: #f8fafc;
                border-radius: 3px;
                border-left: 2px solid #10b981;
              }
              
              .patient-info {
                border-left-color: #3b82f6;
              }
              
              .doctor-info {
                border-left-color: #8b5cf6;
              }
              
              /* Lists */
              .complaints-list, .diagnosis-list, .tests-list {
                font-size: 8px;
                margin: 0;
                padding-left: 12px;
                line-height: 1.2;
              }
              
              .complaints-list li, .diagnosis-list li, .tests-list li {
                margin-bottom: 1px;
                color: #374151;
              }
              
              /* Medications Table */
              .medications-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 3px;
                font-size: 7px;
              }
              
              .medications-table th {
                background: #374151;
                color: white;
                padding: 3px 2px;
                text-align: left;
                font-weight: bold;
                font-size: 8px;
              }
              
              .medications-table td {
                padding: 2px;
                border-bottom: 1px solid #e5e7eb;
                vertical-align: top;
              }
              
              .medications-table tr:nth-child(even) {
                background: #f9fafb;
              }
              
              .medications-table tr:hover {
                background: #f3f4f6;
              }
              
              /* Follow-up */
              .follow-up-content {
                margin-top: 2px;
                padding: 4px;
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 3px;
                border-left: 2px solid #f59e0b;
              }
              
              .follow-up-text {
                font-size: 8px;
                line-height: 1.2;
                margin: 0;
                color: #92400e;
              }
              
              /* Signature Section */
              .signature-section {
                margin-top: 8px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
                padding-top: 5px;
              }
              
              .signature-line {
                margin-bottom: 4px;
                border-bottom: 1px solid #374151;
                width: 120px;
                margin-left: auto;
                margin-right: auto;
                height: 8px;
              }
              
              .doctor-signature {
                font-size: 9px;
                margin-top: 2px;
                font-weight: bold;
                color: #1f2937;
              }
              
              .doctor-details {
                font-size: 7px;
                margin-top: 1px;
                color: #6b7280;
              }
              
              /* Responsive adjustments */
              @media print {
                .prescription-page {
                  box-shadow: none;
                  padding: 3px;
                }
                .clinic-header {
                  background: #f8fafc;
                }
              }
            }
          `}
        </style>
        
        {/* Printable Prescription Content */}
        <Box className="prescription-page">
          {/* Clinic Header */}
          <Box className="clinic-header">
            <Text className="clinic-name">{clinicData?.clinicName || 'MEDICAL CLINIC'}</Text>
            <Text className="clinic-details">{clinicData?.address || '123 Medical Street'}</Text>
            <Text className="clinic-details">{clinicData?.city || 'Medical City'} | Phone: {clinicData?.phone || '(555) 123-4567'}</Text>
            <Text className="clinic-details">Email: info@medicalclinic.com | License: MC-2024-001</Text>
          </Box>

          {/* Prescription Header */}
          <Box>
            <Text className="prescription-title">MEDICAL PRESCRIPTION</Text>
            <Box className="prescription-meta">
              <Text><strong>Date:</strong> {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</Text>
              <Text><strong>Prescription ID:</strong> {prescription.prescriptionId || 'RX-' + Date.now()}</Text>
            </Box>
          </Box>

          {/* Content Section */}
          <Box className="content-section">
            {/* Patient & Doctor Information */}
            <Box className="info-section">
              <Text className="section-title">Patient & Doctor Information</Text>
              <Box className="section-content">
                <Box className="patient-doctor-grid">
                  <Box className="patient-info">
                    <Text><strong>Patient Name:</strong> {patientData?.firstName} {patientData?.middleName} {patientData?.lastName}</Text>
                    <Text><strong>Age:</strong> {patientData?.age} years | <strong>Gender:</strong> {patientData?.gender}</Text>
                    <Text><strong>Contact:</strong> {patientData?.phoneNumber}</Text>
                    <Text><strong>Patient ID:</strong> {patientData?.patientId || 'N/A'}</Text>
                  </Box>
                  <Box className="doctor-info">
                    <Text><strong>{doctorData?.name || 'Dr. Doctor Name'}</strong></Text>
                    <Text><strong>Specialization:</strong> {doctorData?.specialization || 'General Medicine'}</Text>
                    <Text><strong>Registration No:</strong> {doctorData?.doctor_code || 'N/A'}</Text>
                    <Text><strong>License:</strong> {doctorData?.license || 'N/A'}</Text>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Chief Complaints */}
            {prescription.complaints && prescription.complaints.length > 0 && (
              <Box className="info-section">
                <Text className="section-title">Chief Complaints</Text>
                <Box className="section-content">
                  <ul className="complaints-list">
                    {prescription.complaints.map((complaint, index) => (
                      <li key={index}>{complaint}</li>
                    ))}
                  </ul>
                </Box>
              </Box>
            )}

            {/* Diagnosis */}
            {prescription.diagnoses && prescription.diagnoses.length > 0 && (
              <Box className="info-section">
                <Text className="section-title">Clinical Diagnosis</Text>
                <Box className="section-content">
                  <ul className="diagnosis-list">
                    {prescription.diagnoses.map((diag, index) => (
                      <li key={index}>{diag}</li>
                    ))}
                  </ul>
                </Box>
              </Box>
            )}

            {/* Medications */}
            {prescription.medications && prescription.medications.length > 0 && (
              <Box className="info-section">
                <Text className="section-title">Prescribed Medications</Text>
                <Box className="section-content">
                  <table className="medications-table">
                    <thead>
                      <tr>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescription.medications.map((med, index) => (
                        <tr key={index}>
                          <td><strong>{med.name || med.genericName || 'Medication'}</strong></td>
                          <td>{med.dosage || 'As directed'}</td>
                          <td>{med.when || 'As needed'}</td>
                          <td>{med.durationValue || 1} {med.durationUnit || 'days'}</td>
                          <td>{med.instructions || 'Take as directed'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Box>
            )}

            {/* Lab Tests */}
            {selectedLabTests && selectedLabTests.length > 0 && (
              <Box className="info-section">
                <Text className="section-title">Laboratory Investigations</Text>
                <Box className="section-content">
                  <ul className="tests-list">
                    {selectedLabTests.map((test, index) => (
                      <li key={index}>{test.testName}</li>
                    ))}
                  </ul>
                </Box>
              </Box>
            )}

            {/* Follow-up Instructions */}
            {prescription.followUp && (
              <Box className="info-section">
                <Text className="section-title">Follow-up Instructions</Text>
                <Box className="section-content">
                  <Box className="follow-up-content">
                    <Text className="follow-up-text">{prescription.followUp}</Text>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* Doctor Signature */}
          <Box className="signature-section">
            <Box className="signature-line"></Box>
            <Text className="doctor-signature">
              {doctorData?.name || 'Dr. Doctor Name'}
            </Text>
            <Text className="doctor-details">{doctorData?.specialization || 'General Medicine'}</Text>
            <Text className="doctor-details">Registration No: {doctorData?.doctor_code || 'N/A'}</Text>
            <Text className="doctor-details">License: {doctorData?.license || 'N/A'}</Text>
            <Text className="doctor-details">Date: {new Date().toLocaleDateString()}</Text>
            
            {/* Debug info - remove this after testing */}
            <Text className="doctor-details" style={{fontSize: '6px', color: '#999', marginTop: '5px'}}>
              DEBUG: Doctor data available: {doctorData ? 'Yes' : 'No'} | 
              Name: {doctorData?.name || 'undefined'} | 
              ID: {doctorData?.id || 'undefined'} | 
              Code: {doctorData?.doctor_code || 'undefined'}
            </Text>
          </Box>
        </Box>
      </Box>

    </Box>
  );
};

export default EPrescription;
