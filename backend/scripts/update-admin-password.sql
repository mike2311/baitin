-- Update admin password to: password123
-- Hash: $2b$10$cRfR37Ux3iyL0RXiEJ/ucevlI6RpUgxyfMAToOIio9tHTahtZxWl2
UPDATE users 
SET password = '$2b$10$cRfR37Ux3iyL0RXiEJ/ucevlI6RpUgxyfMAToOIio9tHTahtZxWl2' 
WHERE username = 'admin';

-- Verify
SELECT username, active, LENGTH(password) as pwd_length 
FROM users 
WHERE username = 'admin';



