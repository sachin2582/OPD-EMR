import React, { useState, useEffect } from 'react';
import { FaFlask, FaSearch, FaPlus, FaTrash, FaInfoCircle, FaClock, FaDollarSign } from 'react-icons/fa';
import './LabTestOrder.css';

const LabTestOrder = ({ patientId, doctorId, prescriptionId, onTestsOrdered }) => {
  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTestDetails, setShowTestDetails] = useState({});
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [instructions, setInstructions] = useState('');
  const [priority, setPriority] = useState('routine');

  useEffect(() => {
    loadCategories();
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory);
    } else {
      setSubcategories([]);
      setSelectedSubcategory('');
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/lab-tests/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubcategories = async (category) => {
    try {
              const response = await fetch(`/api/lab-tests/categories/${category}/subcategories`);
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data);
      }
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const loadTests = async () => {
    setLoading(true);
    try {
      let url = '/api/lab-tests/tests?limit=100';
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (selectedSubcategory) url += `&subcategory=${selectedSubcategory}`;
      if (searchTerm) url += `&search=${searchTerm}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTests(data.tests);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const handleSearch = () => {
    loadTests();
  };

  const addTest = (test) => {
    const existingTest = selectedTests.find(t => t.testId === test.id);
    if (existingTest) {
      alert('This test is already added to the order.');
      return;
    }

    const newTest = {
      testId: test.id,
      testName: test.testName,
      testCode: test.testCode,
      price: test.price,
      category: test.category,
      clinicalNotes: '',
      instructions: ''
    };

    setSelectedTests([...selectedTests, newTest]);
  };

  const removeTest = (testId) => {
    setSelectedTests(selectedTests.filter(t => t.testId !== testId));
  };

  const updateTestNotes = (testId, field, value) => {
    setSelectedTests(selectedTests.map(test => 
      test.testId === testId ? { ...test, [field]: value } : test
    ));
  };

  const calculateTotal = () => {
    return selectedTests.reduce((total, test) => total + parseFloat(test.price), 0);
  };

  const handleSubmitOrder = async () => {
    if (selectedTests.length === 0) {
      alert('Please select at least one test.');
      return;
    }

    try {
      const orderData = {
        prescriptionId,
        patientId,
        doctorId,
        tests: selectedTests,
        clinicalNotes,
        instructions,
        priority
      };

      const response = await fetch('/api/lab-tests/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Lab test order created successfully! Order ID: ${result.orderId}`);
        setSelectedTests([]);
        setClinicalNotes('');
        setInstructions('');
        if (onTestsOrdered) {
          onTestsOrdered(result);
        }
      } else {
        const error = await response.json();
        alert(`Error creating order: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error creating lab test order. Please try again.');
    }
  };

  const toggleTestDetails = (testId) => {
    setShowTestDetails(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  return (
    <div className="lab-test-order">
      <div className="lab-test-header">
        <h3><FaFlask /> Laboratory Test Order</h3>
        <p>Order laboratory tests for this patient</p>
      </div>

      {/* Test Selection Section */}
      <div className="test-selection-section">
        <div className="filters">
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Subcategory:</label>
            <select 
              value={selectedSubcategory} 
              onChange={(e) => handleSubcategoryChange(e.target.value)}
              disabled={!selectedCategory}
            >
              <option value="">All Subcategories</option>
              {subcategories.map(subcategory => (
                <option key={subcategory} value={subcategory}>{subcategory}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch} className="search-btn">
              <FaSearch />
            </button>
          </div>
        </div>

        <div className="tests-grid">
          {loading ? (
            <div className="loading">Loading tests...</div>
          ) : (
            tests.map(test => (
              <div key={test.id} className="test-card">
                <div className="test-header">
                  <h4>{test.testName}</h4>
                  <span className="test-code">{test.testCode}</span>
                </div>
                
                <div className="test-category">
                  {test.category} {test.subcategory && `> ${test.subcategory}`}
                </div>
                
                <div className="test-price">
                  <FaDollarSign /> {test.price}
                </div>
                
                <div className="test-actions">
                  <button 
                    onClick={() => toggleTestDetails(test.id)}
                    className="details-btn"
                  >
                    <FaInfoCircle /> Details
                  </button>
                  <button 
                    onClick={() => addTest(test)}
                    className="add-btn"
                  >
                    <FaPlus /> Add
                  </button>
                </div>

                {showTestDetails[test.id] && (
                  <div className="test-details">
                    <p><strong>Description:</strong> {test.description}</p>
                    <p><strong>Preparation:</strong> {test.preparation}</p>
                    <p><strong>Turnaround Time:</strong> {test.turnaroundTime}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Selected Tests Section */}
      {selectedTests.length > 0 && (
        <div className="selected-tests-section">
          <h4>Selected Tests ({selectedTests.length})</h4>
          <div className="selected-tests-list">
            {selectedTests.map(test => (
              <div key={test.testId} className="selected-test-item">
                <div className="test-info">
                  <h5>{test.testName}</h5>
                  <span className="test-code">{test.testCode}</span>
                  <span className="test-price">₹{test.price}</span>
                </div>
                
                <div className="test-notes">
                  <input
                    type="text"
                    placeholder="Clinical notes (optional)"
                    value={test.clinicalNotes}
                    onChange={(e) => updateTestNotes(test.testId, 'clinicalNotes', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Special instructions (optional)"
                    value={test.instructions}
                    onChange={(e) => updateTestNotes(test.testId, 'instructions', e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={() => removeTest(test.testId)}
                  className="remove-btn"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <div className="total-amount">
              <strong>Total Amount: ₹{calculateTotal().toFixed(2)}</strong>
            </div>
            
            <div className="order-options">
              <div className="option-group">
                <label>Priority:</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              
              <div className="option-group">
                <label>Clinical Notes:</label>
                <textarea
                  placeholder="General clinical notes for all tests..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  rows="2"
                />
              </div>
              
              <div className="option-group">
                <label>General Instructions:</label>
                <textarea
                  placeholder="General instructions for all tests..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows="2"
                />
              </div>
            </div>

            <button 
              onClick={handleSubmitOrder}
              className="submit-order-btn"
            >
              <FaFlask /> Submit Lab Test Order
            </button>
          </div>
        </div>
      )}

      {selectedTests.length === 0 && (
        <div className="no-tests-selected">
          <p>No tests selected. Use the filters above to search and select laboratory tests.</p>
        </div>
      )}
    </div>
  );
};

export default LabTestOrder;
