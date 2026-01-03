-- Enforce Strict FK Constraints
-- Created: 2024-12-28
-- Purpose: Replace temporary soft FK constraints with strict referential integrity
-- Note: Only run this after all orphaned records have been resolved

-- Prerequisites:
-- 1. All orphaned records in data_quality_audit should have status 'resolved' or 'approved_as_is'
-- 2. Run validation script to confirm no orphaned records remain
-- 3. Verify application is ready for strict FK enforcement

-- Remove temporary soft FK constraints
ALTER TABLE item DROP CONSTRAINT IF EXISTS fk_item_origin_soft;
ALTER TABLE order_enquiry_control DROP CONSTRAINT IF EXISTS fk_oe_control_customer_soft;
ALTER TABLE order_enquiry_header DROP CONSTRAINT IF EXISTS fk_oe_header_customer_soft;
ALTER TABLE order_enquiry_detail DROP CONSTRAINT IF EXISTS fk_oe_detail_header_soft;

-- Add strict FK constraints (no nullable, no deferrable)
-- These constraints enforce referential integrity at the database level

-- 1. item.origin → zorigin.origin (strict)
-- Note: origin field should not be nullable after cleanup
ALTER TABLE item 
ADD CONSTRAINT fk_item_origin 
FOREIGN KEY (origin) 
REFERENCES zorigin(origin) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- 2. order_enquiry_control.cust_no → customer.cust_no (strict)
-- Note: cust_no should not be nullable after cleanup
ALTER TABLE order_enquiry_control 
ADD CONSTRAINT fk_oe_control_customer 
FOREIGN KEY (cust_no) 
REFERENCES customer(cust_no) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- 3. order_enquiry_header.cust_no → customer.cust_no (strict)
-- Note: cust_no should not be nullable after cleanup
ALTER TABLE order_enquiry_header 
ADD CONSTRAINT fk_oe_header_customer 
FOREIGN KEY (cust_no) 
REFERENCES customer(cust_no) 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- 4. order_enquiry_detail.oe_no → order_enquiry_header.oe_no (strict)
-- Note: CASCADE delete to maintain referential integrity when header is deleted
ALTER TABLE order_enquiry_detail 
ADD CONSTRAINT fk_oe_detail_header 
FOREIGN KEY (oe_no) 
REFERENCES order_enquiry_header(oe_no) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Verification queries (run after applying):
-- SELECT conname, contype, condeferrable, condeferred 
-- FROM pg_constraint 
-- WHERE conname IN ('fk_item_origin', 'fk_oe_control_customer', 'fk_oe_header_customer', 'fk_oe_detail_header');





