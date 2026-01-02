-- Temporary Soft FK Constraints (to be removed after data cleanup)
-- Created: 2024-12-28
-- Target Removal Date: 2025-01-27 (30 days from creation)

-- Purpose: Allow system to function while orphaned records are being resolved
-- These constraints use DEFERRABLE INITIALLY DEFERRED and ON DELETE SET NULL
-- to allow temporary referential integrity violations during transition period

-- 1. item.origin → zorigin.origin (nullable, deferrable)
-- Note: This FK is nullable to handle orphaned origin codes during cleanup
ALTER TABLE item 
ADD CONSTRAINT IF NOT EXISTS fk_item_origin_soft 
FOREIGN KEY (origin) 
REFERENCES zorigin(origin) 
ON DELETE SET NULL 
ON UPDATE CASCADE 
DEFERRABLE INITIALLY DEFERRED;

-- 2. order_enquiry_control.cust_no → customer.cust_no (nullable, deferrable)
-- Note: This FK is nullable to handle orphaned customer references during cleanup
ALTER TABLE order_enquiry_control 
ADD CONSTRAINT IF NOT EXISTS fk_oe_control_customer_soft 
FOREIGN KEY (cust_no) 
REFERENCES customer(cust_no) 
ON DELETE SET NULL 
ON UPDATE CASCADE 
DEFERRABLE INITIALLY DEFERRED;

-- 3. order_enquiry_header.cust_no → customer.cust_no (nullable, deferrable)
-- Note: This FK is nullable to handle orphaned customer references during cleanup
ALTER TABLE order_enquiry_header 
ADD CONSTRAINT IF NOT EXISTS fk_oe_header_customer_soft 
FOREIGN KEY (cust_no) 
REFERENCES customer(cust_no) 
ON DELETE SET NULL 
ON UPDATE CASCADE 
DEFERRABLE INITIALLY DEFERRED;

-- 4. order_enquiry_detail.oe_no → order_enquiry_header.oe_no (deferrable)
-- Note: This FK uses CASCADE to handle orphaned detail records with missing headers
ALTER TABLE order_enquiry_detail 
ADD CONSTRAINT IF NOT EXISTS fk_oe_detail_header_soft 
FOREIGN KEY (oe_no) 
REFERENCES order_enquiry_header(oe_no) 
ON DELETE CASCADE 
ON UPDATE CASCADE 
DEFERRABLE INITIALLY DEFERRED;

-- Verification queries (run after applying):
-- SELECT conname, contype, condeferrable, condeferred 
-- FROM pg_constraint 
-- WHERE conname LIKE '%_soft';

