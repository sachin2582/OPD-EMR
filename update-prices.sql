
-- Update all lab test prices to 200
UPDATE lab_tests SET price = 200, updatedAt = CURRENT_TIMESTAMP;

-- Verify the update
SELECT COUNT(*) as total, COUNT(CASE WHEN price = 200 THEN 1 END) as updated_count FROM lab_tests;
