-- Update all lab test prices to 200
-- This script will update all lab test prices in the database

-- First, let's see the current state
SELECT 'Before Update:' as status, COUNT(*) as total_tests, 
       AVG(price) as avg_price, MIN(price) as min_price, MAX(price) as max_price 
FROM lab_tests;

-- Update all prices to 200
UPDATE lab_tests SET price = 200, updatedAt = CURRENT_TIMESTAMP;

-- Verify the update
SELECT 'After Update:' as status, COUNT(*) as total_tests, 
       AVG(price) as avg_price, MIN(price) as min_price, MAX(price) as max_price 
FROM lab_tests;

-- Show detailed verification
SELECT COUNT(*) as total, 
       COUNT(CASE WHEN price = 200 THEN 1 END) as updated_count,
       COUNT(CASE WHEN price != 200 THEN 1 END) as not_updated_count
FROM lab_tests;

-- Show some sample records
SELECT testId, testName, testCode, price, category 
FROM lab_tests 
LIMIT 10;
