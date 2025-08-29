import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaPrescription, FaPrint, FaSave, FaArrowLeft, FaPlus, FaTrash, FaStethoscope, FaPills, FaNotesMedical, FaUser, FaHeartbeat, FaFlask } from 'react-icons/fa';
import './EPrescription.css';

const EPrescription = () => {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
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

  useEffect(() => {
    if (location.state?.patientData) {
      setPatientData(location.state.patientData);
      setMode(location.state.mode || 'new');
      
      // Initialize prescription data properly for new prescriptions
      if (location.state.mode === 'new') {
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
          notes: ''
        };
        setPrescription(newPrescription);
      }
      
      // Load past prescriptions for this patient
      loadPastPrescriptions();
    } else {
      navigate('/doctor');
    }
  }, [location.state, navigate]);

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
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [mode, prescription.prescriptionId, patientId]);

  const loadPastPrescriptions = () => {
    // TODO: Replace with backend API call
    // const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    // const patientPastPrescriptions = savedPrescriptions.filter(p => 
    //   p.patientId === parseInt(patientId) && p.prescriptionId !== prescription.prescriptionId
    // );
    // setPastPrescriptions(patientPastPrescriptions);
    // Load saved prescriptions from localStorage
    const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    const patientPastPrescriptions = savedPrescriptions.filter(p => 
      p.patientId === parseInt(patientId) && p.prescriptionId !== prescription.prescriptionId
    );
    setPastPrescriptions(patientPastPrescriptions);
  };

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
      !med.name || !med.dosage || !med.frequency || !med.duration
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

      const prescriptionResponse = await fetch('/api/prescriptions', {
        method: 'POST',
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

      // Update the current prescription state with the saved data from backend
      const updatedPrescription = {
        ...prescription,
        prescriptionId: savedPrescription.prescription.prescriptionId,
        id: savedPrescription.prescription.id,
        patientId: parseInt(patientId),
        patientData,
        labTestRecommendations: selectedLabTests,
        icd10Codes: selectedIcd10Codes,
        createdAt: savedPrescription.prescription.createdAt,
        updatedAt: savedPrescription.prescription.updatedAt,
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
    <div className="container fade-in-up">
      {/* Header */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button 
              onClick={() => navigate('/doctor')} 
              className="btn btn-secondary"
              style={{ marginBottom: '1rem' }}
            >
              <FaArrowLeft style={{ marginRight: '0.5rem' }} />
              Back to Doctor Dashboard
            </button>
            <h1 className="card-title" style={{ margin: 0 }}>
              <FaPrescription style={{ marginRight: '0.75rem', fontSize: '1.25rem' }} />
              {mode === 'new' ? 'New E-Prescription' : mode === 'edit' ? 'Edit E-Prescription' : 'View E-Prescription'}
            </h1>
                         <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
               🆔 Patient #{patientData.patientId || patientData.id} • {patientData.firstName} {patientData.lastName} • {patientData.age} years • {patientData.gender}
               {pastPrescriptions.length > 0 && (
                 <span style={{ 
                   background: 'var(--success-color)', 
                   color: 'white', 
                   padding: '0.25rem 0.75rem', 
                   borderRadius: '1rem', 
                   fontSize: '0.875rem',
                   marginLeft: '1rem',
                   fontWeight: '600'
                 }}>
                   🔄 Follow-up Patient ({pastPrescriptions.length} previous)
                 </span>
               )}
               <span style={{ 
                 background: prescription.status === 'completed' ? 'var(--success-color)' : 'var(--warning-color)', 
                 color: 'white', 
                 padding: '0.25rem 0.75rem', 
                 borderRadius: '1rem', 
                 fontSize: '0.875rem',
                 marginLeft: '1rem',
                 fontWeight: '600'
               }}>
                 {prescription.status === 'completed' ? '✅ Completed' : '⏳ In Progress'}
               </span>
             </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                         {mode !== 'view' && (
               <button 
                 className={`btn ${isPrescriptionReady() ? 'btn-success' : 'btn-secondary'}`} 
                 onClick={handleSave}
                 disabled={!isPrescriptionReady()}
                 title={isPrescriptionReady() ? 'Save Prescription' : 'Fill in diagnosis and add medications to save'}
               >
                 <FaSave style={{ marginRight: '0.5rem' }} />
                 {isPrescriptionReady() ? 'Save Prescription' : 'Complete Prescription'}
               </button>
             )}
            <button className="btn btn-info" onClick={handleNewPrescription}>
              <FaPlus style={{ marginRight: '0.5rem' }} />
              New Prescription
            </button>
                         <button 
               className={`btn ${prescription.status === 'completed' ? 'btn-primary' : 'btn-secondary'}`} 
               onClick={handlePrint}
               disabled={prescription.status !== 'completed'}
               title={prescription.status === 'completed' ? 'Print Prescription' : 'Save prescription first to print'}
             >
               <FaPrint style={{ marginRight: '0.5rem' }} />
               Print Prescription
             </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column - Prescription Form */}
        <div>
          {/* Patient Information */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 className="section-title">
              <FaUser style={{ marginRight: '0.75rem' }} />
              Patient Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div><strong>🆔 Patient ID:</strong> #{patientData.patientId || patientData.id}</div>
              <div><strong>Name:</strong> {patientData.firstName} {patientData.middleName} {patientData.lastName}</div>
              <div><strong>Age:</strong> {patientData.age} years</div>
              <div><strong>Gender:</strong> {patientData.gender}</div>
              <div><strong>Blood Group:</strong> {patientData.bloodGroup}</div>
              <div><strong>Phone:</strong> {patientData.phone}</div>
              <div><strong>Address:</strong> {patientData.address}</div>
            </div>
          </div>

          {/* Past Prescriptions Section */}
          {pastPrescriptions.length > 0 && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section-title" style={{ margin: 0 }}>
                  <FaPrescription style={{ marginRight: '0.75rem' }} />
                  Last Prescription
                </h2>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowPastPrescriptions(!showPastPrescriptions)}
                >
                  {showPastPrescriptions ? 'Hide' : 'Show'} Last Prescription
                </button>
              </div>
              
              {showPastPrescriptions && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {/* Show only the last prescription */}
                  {(() => {
                    const lastPrescription = pastPrescriptions[pastPrescriptions.length - 1];
                    return (
                      <div 
                        key={lastPrescription.prescriptionId}
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
                              Last Prescription - {lastPrescription.prescriptionId}
                            </h4>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                              <strong>Date:</strong> {new Date(lastPrescription.date).toLocaleDateString()} • 
                              <strong>Diagnosis:</strong> {lastPrescription.diagnosis || 'Not specified'}
                            </div>
                          </div>
                          {mode !== 'view' && (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => copyFromPastPrescription(lastPrescription)}
                              title="Copy medications and details from this prescription"
                            >
                              <FaPlus style={{ marginRight: '0.25rem' }} />
                              Copy
                            </button>
                          )}
                        </div>
                        
                        {lastPrescription.medications && lastPrescription.medications.length > 0 && (
                          <div style={{ marginBottom: '0.75rem' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Medications:</strong>
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                              gap: '0.5rem',
                              marginTop: '0.5rem',
                              fontSize: '0.875rem'
                            }}>
                              {lastPrescription.medications.map((med, medIndex) => (
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
                                    {med.dosage} • {med.frequency} • {med.duration}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {(lastPrescription.instructions || lastPrescription.followUp) && (
                          <div style={{ fontSize: '0.875rem' }}>
                            {lastPrescription.instructions && (
                              <div style={{ marginBottom: '0.5rem' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>Instructions:</strong> {lastPrescription.instructions}
                              </div>
                            )}
                            {lastPrescription.followUp && (
                              <div>
                                <strong style={{ color: 'var(--text-primary)' }}>Follow-up:</strong> {lastPrescription.followUp}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {lastPrescription.labTestRecommendations && (
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
                              {Array.isArray(lastPrescription.labTestRecommendations) 
                                ? lastPrescription.labTestRecommendations.map(testId => {
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
                                : lastPrescription.labTestRecommendations
                              }
                            </div>
                          </div>
                        )}
                        
                        {lastPrescription.icd10Codes && lastPrescription.icd10Codes.length > 0 && (
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
                              {lastPrescription.icd10Codes.map(code => 
                                `${code.code}: ${code.description}`
                              ).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '1rem', 
                    background: 'rgba(37, 99, 235, 0.05)', 
                    borderRadius: '0.5rem',
                    border: '1px dashed rgba(37, 99, 235, 0.3)'
                  }}>
                    <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      💡 <strong>Tip:</strong> Use the "Copy" button to quickly add medications and details from the last prescription
                    </p>
                  </div>
                </div>
              )}
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
                      {med.dosage} • {med.frequency} • {med.duration}
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
        </div>

        {/* Right Column - Prescription Summary */}
        <div>
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

            {mode !== 'view' && (
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button 
                  className="btn btn-success" 
                  onClick={handleSave}
                  style={{ width: '100%' }}
                >
                  <FaSave style={{ marginRight: '0.5rem' }} />
                  Save Prescription
                </button>
              </div>
            )}
            
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
        </div>
      </div>

      {/* Printable Prescription */}
      <div id="printable-prescription" style={{ display: 'none' }}>
        <style>
          {`
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none !important; }
              #printable-prescription { 
                display: block !important; 
                position: relative;
                page-break-inside: avoid;
              }
              .prescription-page { 
                page-break-after: always;
                margin: 0;
                padding: 20px;
              }
            }
          `}
        </style>
        <div style={{ 
          fontFamily: 'Arial, sans-serif', 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '15px',
          border: '2px solid #333',
          background: 'white',
          position: 'relative',
          fontSize: '12px'
        }}>
          {/* Professional Header */}
          <div style={{ 
            textAlign: 'center', 
            borderBottom: '3px solid #2563eb', 
            paddingBottom: '15px', 
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '15px' 
            }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: '#2563eb', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '20px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}>
                <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>🏥</span>
              </div>
              <div>
                <h1 style={{ 
                  margin: 0, 
                  color: '#1e293b', 
                  fontSize: '24px', 
                  fontWeight: '700',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>OPD-EMR HOSPITAL</h1>
                <p style={{ 
                  margin: '3px 0', 
                  fontSize: '14px', 
                  color: '#475569',
                  fontWeight: '600'
                }}>Electronic Medical Prescription</p>
              </div>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '10px',
              marginTop: '10px',
              fontSize: '11px',
              color: '#64748b'
            }}>
              <div>
                <strong>Address:</strong> 123 Healthcare Street, Medical City, MC 12345
              </div>
              <div>
                <strong>Phone:</strong> +1-555-0123 | <strong>Email:</strong> doctor@opd-emr.com
              </div>
              <div>
                <strong>Website:</strong> www.opd-emr.com | <strong>License:</strong> HOSP-2024-001
              </div>
            </div>
          </div>

          {/* Prescription Details Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '20px',
            padding: '15px',
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            borderRadius: '8px',
            border: '1px solid #cbd5e1'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                color: '#1e293b', 
                fontSize: '14px',
                fontWeight: '600',
                borderBottom: '2px solid #2563eb',
                paddingBottom: '3px'
              }}>📋 Patient Information</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '8px',
                fontSize: '11px'
              }}>
                <div><strong>Name:</strong> <span style={{ color: '#1e293b', fontWeight: '600' }}>{patientData.firstName} {patientData.middleName} {patientData.lastName}</span></div>
                <div><strong>Age:</strong> <span style={{ color: '#1e293b' }}>{patientData.age} years</span></div>
                <div><strong>Gender:</strong> <span style={{ color: '#1e293b' }}>{patientData.gender}</span></div>
                <div><strong>Blood Group:</strong> <span style={{ color: '#1e293b' }}>{patientData.bloodGroup}</span></div>
                <div><strong>Phone:</strong> <span style={{ color: '#1e293b' }}>{patientData.phone}</span></div>
                <div><strong>Address:</strong> <span style={{ color: '#1e293b' }}>{patientData.address}</span></div>
              </div>
            </div>
            <div style={{ 
              textAlign: 'right', 
              flex: 1,
              borderLeft: '2px solid #e2e8f0',
              paddingLeft: '20px'
            }}>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                color: '#1e293b', 
                fontSize: '14px',
                fontWeight: '600',
                borderBottom: '2px solid #2563eb',
                paddingBottom: '3px'
              }}>📄 Prescription Details</h3>
              <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                <div><strong>Prescription ID:</strong> <span style={{ color: '#2563eb', fontWeight: '600' }}>{prescription.prescriptionId}</span></div>
                <div><strong>Date:</strong> <span style={{ color: '#1e293b' }}>{new Date(prescription.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                <div><strong>Time:</strong> <span style={{ color: '#1e293b' }}>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
                <div><strong>Doctor:</strong> <span style={{ color: '#1e293b', fontWeight: '600' }}>{prescription.doctorName}</span></div>
                <div><strong>Specialization:</strong> <span style={{ color: '#1e293b' }}>{prescription.doctorSpecialization}</span></div>
              </div>
            </div>
          </div>

          {/* Vital Signs Section */}
          <div style={{ 
            marginBottom: '20px',
            padding: '15px',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            <h3 style={{ 
              margin: '0 0 10px 0', 
              color: '#991b1b', 
              fontSize: '14px',
              fontWeight: '600',
              borderBottom: '2px solid #dc2626',
              paddingBottom: '3px'
            }}>💓 Vital Signs</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '10px',
              fontSize: '11px'
            }}>
                              <div style={{ 
                  textAlign: 'center', 
                  padding: '8px', 
                  background: 'white', 
                  borderRadius: '6px',
                  border: '1px solid #fecaca'
                }}>
                  <div style={{ fontWeight: '600', color: '#991b1b', fontSize: '10px' }}>Temperature</div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626' }}>{patientData.vitalSigns?.temperature || 'N/A'}</div>
                </div>
                              <div style={{ 
                  textAlign: 'center', 
                  padding: '8px', 
                  background: 'white', 
                  borderRadius: '6px',
                  border: '1px solid #fecaca'
                }}>
                  <div style={{ fontWeight: '600', color: '#991b1b', fontSize: '10px' }}>Blood Pressure</div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626' }}>{patientData.vitalSigns?.bloodPressure || 'N/A'}</div>
                </div>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '8px', 
                  background: 'white', 
                  borderRadius: '6px',
                  border: '1px solid #fecaca'
                }}>
                  <div style={{ fontWeight: '600', color: '#991b1b', fontSize: '10px' }}>Pulse</div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626' }}>{patientData.vitalSigns?.pulse || 'N/A'}</div>
                </div>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '8px', 
                  background: 'white', 
                  borderRadius: '6px',
                  border: '1px solid #fecaca'
                }}>
                  <div style={{ fontWeight: '600', color: '#991b1b', fontSize: '10px' }}>Weight</div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626' }}>{patientData.vitalSigns?.weight || 'N/A'}</div>
                </div>
            </div>
          </div>

          {/* Diagnosis Section */}
          <div style={{ 
            marginBottom: '20px',
            padding: '15px',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: '8px',
            border: '1px solid #bae6fd'
          }}>
            <h3 style={{ 
              margin: '0 0 10px 0', 
              color: '#0c4a6e', 
              fontSize: '14px',
              fontWeight: '600',
              borderBottom: '2px solid #0284c7',
              paddingBottom: '3px'
            }}>🔍 Clinical Assessment</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '15px',
              fontSize: '11px'
            }}>
              <div>
                <strong style={{ color: '#0c4a6e' }}>Chief Complaint:</strong>
                                 <div style={{ 
                   marginTop: '3px', 
                   padding: '8px', 
                   background: 'white', 
                   borderRadius: '4px',
                   border: '1px solid #bae6fd',
                   color: '#1e293b'
                 }}>{prescription.symptoms || 'Not specified'}</div>
              </div>
              <div>
                <strong style={{ color: '#0c4a6e' }}>Diagnosis:</strong>
                                 <div style={{ 
                   marginTop: '3px', 
                   padding: '8px', 
                   background: 'white', 
                   borderRadius: '4px',
                   border: '1px solid #bae6fd',
                   color: '#1e293b'
                 }}>{prescription.diagnosis || 'Not specified'}</div>
              </div>
            </div>
          </div>

          {/* Medications Section */}
          <div style={{ 
            marginBottom: '20px',
            padding: '15px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#14532d', 
              fontSize: '18px',
              fontWeight: '600',
              borderBottom: '2px solid #16a34a',
              paddingBottom: '5px'
            }}>💊 Prescribed Medications</h3>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}>
                  <th style={{ 
                    border: '1px solid #bbf7d0', 
                    padding: '15px 12px', 
                    textAlign: 'left',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>Medication</th>
                  <th style={{ 
                    border: '1px solid #bbf7d0', 
                    padding: '15px 12px', 
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>Dosage</th>
                  <th style={{ 
                    border: '1px solid #bbf7d0', 
                    padding: '15px 12px', 
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>Frequency</th>
                  <th style={{ 
                    border: '1px solid #bbf7d0', 
                    padding: '15px 12px', 
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medications.map((med, index) => (
                  <tr key={med.id} style={{ 
                    background: index % 2 === 0 ? '#f8fafc' : 'white',
                    transition: 'background-color 0.3s ease'
                  }}>
                    <td style={{ 
                      border: '1px solid #bbf7d0', 
                      padding: '12px',
                      fontWeight: '600',
                      color: '#14532d'
                    }}>{med.name}</td>
                    <td style={{ 
                      border: '1px solid #bbf7d0', 
                      padding: '12px',
                      textAlign: 'center',
                      color: '#1e293b'
                    }}>{med.dosage}</td>
                    <td style={{ 
                      border: '1px solid #bbf7d0', 
                      padding: '12px',
                      textAlign: 'center',
                      color: '#1e293b'
                    }}>{med.frequency}</td>
                    <td style={{ 
                      border: '1px solid #bbf7d0', 
                      padding: '12px',
                      textAlign: 'center',
                      color: '#1e293b'
                    }}>{med.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {prescription.medications.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#64748b',
                fontStyle: 'italic'
              }}>
                No medications prescribed
              </div>
            )}
          </div>

          {/* Instructions Section */}
          {(prescription.instructions || prescription.followUp) && (
            <div style={{ 
              marginBottom: '30px',
              padding: '20px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '10px',
              border: '1px solid #fcd34d'
            }}>
              <h3 style={{ 
                margin: '0 0 15px 0', 
                color: '#92400e', 
                fontSize: '18px',
                fontWeight: '600',
                borderBottom: '2px solid #d97706',
                paddingBottom: '5px'
              }}>📝 Treatment Instructions</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '20px',
                fontSize: '14px'
              }}>
                {prescription.instructions && (
                  <div>
                    <strong style={{ color: '#92400e' }}>Treatment Instructions:</strong>
                    <div style={{ 
                      marginTop: '5px', 
                      padding: '10px', 
                      background: 'white', 
                      borderRadius: '6px',
                      border: '1px solid #fcd34d',
                      color: '#1e293b'
                    }}>{prescription.instructions}</div>
                  </div>
                )}
                {prescription.followUp && (
                  <div>
                    <strong style={{ color: '#92400e' }}>Follow-up Instructions:</strong>
                    <div style={{ 
                      marginTop: '5px', 
                      padding: '10px', 
                      background: 'white', 
                      borderRadius: '6px',
                      border: '1px solid #fcd34d',
                      color: '#1e293b'
                    }}>{prescription.followUp}</div>
                  </div>
                )}
              </div>
            </div>
          )}

                     {/* ICD-10 Codes Section */}
           {selectedIcd10Codes.length > 0 && (
             <div style={{ 
               marginBottom: '30px',
               padding: '20px',
               background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
               borderRadius: '10px',
               border: '1px solid #fcd34d'
             }}>
               <h3 style={{ 
                 margin: '0 0 15px 0', 
                 color: '#92400e', 
                 fontSize: '18px',
                 fontWeight: '600',
                 borderBottom: '2px solid #d97706',
                 paddingBottom: '5px'
               }}>🏷️ ICD-10 Diagnosis Codes</h3>
               <div style={{ 
                 padding: '15px', 
                 background: 'white', 
                 borderRadius: '8px',
                 border: '1px solid #fcd34d',
                 color: '#1e293b',
                 fontSize: '14px',
                 lineHeight: '1.6'
               }}>
                 {selectedIcd10Codes.map(code => (
                   <div key={code.code} style={{ marginBottom: '10px' }}>
                     <strong style={{ color: '#92400e' }}>{code.code}:</strong> {code.description}
                     <div style={{ 
                       fontSize: '12px', 
                       color: '#64748b', 
                       marginTop: '3px',
                       fontStyle: 'italic'
                     }}>
                       Category: {code.category}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Lab Test Recommendations Section */}
           {selectedLabTests.length > 0 && (
            <div style={{ 
              marginBottom: '30px',
              padding: '20px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '10px',
              border: '1px solid #bae6fd'
            }}>
              <h3 style={{ 
                margin: '0 0 15px 0', 
                color: '#0c4a6e', 
                fontSize: '18px',
                fontWeight: '600',
                borderBottom: '2px solid #0284c7',
                paddingBottom: '5px'
              }}>🧪 Laboratory Test Recommendations</h3>
              <div style={{ 
                padding: '15px', 
                background: 'white', 
                borderRadius: '8px',
                border: '1px solid #bae6fd',
                color: '#1e293b',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
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
              </div>
              <div style={{ 
                marginTop: '15px',
                padding: '10px',
                background: 'rgba(2, 132, 199, 0.1)',
                borderRadius: '6px',
                border: '1px solid #bae6fd',
                fontSize: '12px',
                color: '#0c4a6e',
                fontStyle: 'italic'
              }}>
                <strong>Note:</strong> These are test recommendations only. Please visit the laboratory separately for test ordering and billing.
              </div>
            </div>
          )}

          {/* Professional Footer */}
          <div style={{ 
            borderTop: '3px solid #2563eb', 
            paddingTop: '25px', 
            marginTop: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ 
                borderTop: '2px solid #2563eb', 
                width: '250px', 
                marginTop: '40px',
                marginBottom: '15px'
              }}></div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '20px',
                fontSize: '14px'
              }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px' }}>{prescription.doctorName}</div>
                  <div style={{ color: '#475569' }}>{prescription.doctorSpecialization}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>License: {prescription.doctorLicense}</div>
                </div>
                <div>
                  <div style={{ color: '#475569', fontSize: '12px' }}>Digital Signature</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>Generated Electronically</div>
                </div>
              </div>
            </div>
            <div style={{ 
              textAlign: 'right',
              flex: 1,
              borderLeft: '2px solid #e2e8f0',
              paddingLeft: '20px'
            }}>
              <div style={{ 
                background: '#f8fafc', 
                padding: '15px', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '5px' }}>Document Information</div>
                <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                  <div>Generated on: {new Date().toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                  <div>Prescription ID: {prescription.prescriptionId}</div>
                  <div>This is a computer generated prescription</div>
                  <div>Valid for 30 days from issue date</div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Watermark */}
          <div style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            opacity: '0.03',
            fontSize: '120px',
            fontWeight: 'bold',
            color: '#2563eb',
            pointerEvents: 'none',
            zIndex: '-1'
          }}>
            OPD-EMR
          </div>

          {/* QR Code Section */}
          <div style={{ 
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'white',
            padding: '10px',
            borderRadius: '8px',
            border: '2px solid #2563eb',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              background: '#f1f5f9', 
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '5px'
            }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>QR Code</span>
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>
              Verify at<br/>opd-emr.com
            </div>
          </div>

          {/* Prescription Validity Stamp */}
          <div style={{ 
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '50px',
            transform: 'rotate(15deg)',
            boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)',
            fontSize: '14px',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            <div>VALID</div>
            <div style={{ fontSize: '12px', opacity: '0.9' }}>30 DAYS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EPrescription;
