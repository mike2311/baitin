-- Create test user
-- Username: admin
-- Password: password123 (hashed with bcrypt)
INSERT INTO "users" (username, password, user_right, company_code, active, cre_date, mod_date)
VALUES ('admin', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'SUPERVISOR', 'HT', true, NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Create some test reference data for validation
INSERT INTO zstdcode (std_code, description, created_at)
VALUES 
  ('STD001', 'Standard Code 1', NOW()),
  ('STD002', 'Standard Code 2', NOW())
ON CONFLICT (std_code) DO NOTHING;

INSERT INTO zorigin (origin, description, created_at)
VALUES 
  ('CN', 'China', NOW()),
  ('US', 'United States', NOW()),
  ('VN', 'Vietnam', NOW())
ON CONFLICT (origin) DO NOTHING;

