-- Phase 3: Full Feature Set - Table Creation
-- Created: 2025-01-14
-- Purpose: Create Shipping Order, Delivery Note, Loading, and Invoice tables for Phase 3
-- Dependencies: Phase 0-2 tables must exist (items, customers, vendors, order_enquiry, order_confirmation, contracts)

-- =================================================
-- SHIPPING ORDER TABLES
-- =================================================

-- zsoformat: SO Format Configuration
-- Customer-specific SO format definitions
CREATE TABLE zsoformat (
    so_key VARCHAR(50) NOT NULL,      -- Format key (e.g., "GLOBE")
    uniqueid VARCHAR(100) NOT NULL,   -- Unique identifier for format element
    vpos INTEGER,                     -- Vertical position
    hpos INTEGER,                     -- Horizontal position
    height INTEGER,                   -- Height
    width INTEGER,                    -- Width
    PRIMARY KEY (so_key, uniqueid)
);

COMMENT ON TABLE zsoformat IS 'SO Format Configuration - Customer-specific SO format definitions';
COMMENT ON COLUMN zsoformat.so_key IS 'Format key (e.g., "GLOBE")';
COMMENT ON COLUMN zsoformat.uniqueid IS 'Unique identifier for format element';
COMMENT ON COLUMN zsoformat.vpos IS 'Vertical position';
COMMENT ON COLUMN zsoformat.hpos IS 'Horizontal position';
COMMENT ON COLUMN zsoformat.height IS 'Height';
COMMENT ON COLUMN zsoformat.width IS 'Width';

-- mso: Shipping Order
-- Main shipping order table (279MB in legacy)
CREATE TABLE shipping_order (
    so_no VARCHAR(20) PRIMARY KEY,    -- Shipping Order number
    conf_no VARCHAR(20),              -- Order Confirmation number (links to mordhd)
    cont_no VARCHAR(20),              -- Contract number (links to mconthd)
    item_no VARCHAR(20) NOT NULL,     -- Item number (links to mitem)
    qty DECIMAL(12,2) NOT NULL,       -- Shipping quantity
    ctn DECIMAL(12,2),                -- Carton quantity
    ship_date DATE,                   -- Shipping date
    ship_mark TEXT,                   -- Shipping mark (from customer memo)
    fob_port VARCHAR(50),             -- FOB port (from contract or default)
    po_no VARCHAR(50),                -- Purchase Order number
    oc_no VARCHAR(20),                -- Order Confirmation number
    ship_to VARCHAR(100),             -- Ship to location
    loading_port VARCHAR(100),        -- Loading port
    dest VARCHAR(100),                -- Destination
    remarks TEXT,                     -- Remarks
    user_id VARCHAR(50),              -- User ID
    cre_user VARCHAR(50),             -- Creator user
    cre_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mod_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE shipping_order IS 'Shipping Order - Main SO table for delivery coordination';
COMMENT ON COLUMN shipping_order.so_no IS 'Shipping Order number (Primary Key)';
COMMENT ON COLUMN shipping_order.conf_no IS 'Order Confirmation number';
COMMENT ON COLUMN shipping_order.cont_no IS 'Contract number';
COMMENT ON COLUMN shipping_order.item_no IS 'Item number';
COMMENT ON COLUMN shipping_order.qty IS 'Shipping quantity';
COMMENT ON COLUMN shipping_order.ctn IS 'Carton quantity';
COMMENT ON COLUMN shipping_order.ship_date IS 'Shipping date';
COMMENT ON COLUMN shipping_order.ship_mark IS 'Shipping mark from customer';
COMMENT ON COLUMN shipping_order.fob_port IS 'FOB port from contract';
COMMENT ON COLUMN shipping_order.po_no IS 'Purchase Order number';
COMMENT ON COLUMN shipping_order.oc_no IS 'Order Confirmation number';
COMMENT ON COLUMN shipping_order.ship_to IS 'Ship to location';
COMMENT ON COLUMN shipping_order.loading_port IS 'Loading port';
COMMENT ON COLUMN shipping_order.dest IS 'Destination';
COMMENT ON COLUMN shipping_order.remarks IS 'Remarks';
COMMENT ON COLUMN shipping_order.user_id IS 'User ID';
COMMENT ON COLUMN shipping_order.cre_user IS 'Creator user';
COMMENT ON COLUMN shipping_order.cre_date IS 'Creation date';
COMMENT ON COLUMN shipping_order.mod_date IS 'Modification date';

-- =================================================
-- DELIVERY NOTE TABLES
-- =================================================

-- mdnhd: Delivery Note Header
CREATE TABLE delivery_note_header (
    dn_no VARCHAR(20) PRIMARY KEY,    -- Delivery Note number
    date DATE NOT NULL,               -- DN date
    cust_no VARCHAR(20),              -- Customer number (links to mcustom)
    so_no VARCHAR(20),                -- Shipping Order number
    del_addr1 VARCHAR(100),           -- Delivery address line 1
    del_addr2 VARCHAR(100),           -- Delivery address line 2
    del_addr3 VARCHAR(100),           -- Delivery address line 3
    del_addr4 VARCHAR(100),           -- Delivery address line 4
    del_date DATE,                    -- Delivery date
    loading_status VARCHAR(20) DEFAULT 'Created', -- Created/Loading/Shipped/Delivered
    loading_no VARCHAR(50),           -- Loading master number
    remarks TEXT,                     -- Remarks
    user_id VARCHAR(50),              -- User ID
    cre_user VARCHAR(50),             -- Creator user
    cre_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mod_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE delivery_note_header IS 'Delivery Note Header - Header for delivery notes';
COMMENT ON COLUMN delivery_note_header.dn_no IS 'Delivery Note number (Primary Key)';
COMMENT ON COLUMN delivery_note_header.date IS 'DN date';
COMMENT ON COLUMN delivery_note_header.cust_no IS 'Customer number';
COMMENT ON COLUMN delivery_note_header.so_no IS 'Shipping Order number';
COMMENT ON COLUMN delivery_note_header.del_addr1 IS 'Delivery address line 1';
COMMENT ON COLUMN delivery_note_header.del_addr2 IS 'Delivery address line 2';
COMMENT ON COLUMN delivery_note_header.del_addr3 IS 'Delivery address line 3';
COMMENT ON COLUMN delivery_note_header.del_addr4 IS 'Delivery address line 4';
COMMENT ON COLUMN delivery_note_header.del_date IS 'Delivery date';
COMMENT ON COLUMN delivery_note_header.loading_status IS 'Loading status (Created/Loading/Shipped/Delivered)';
COMMENT ON COLUMN delivery_note_header.loading_no IS 'Loading master number';
COMMENT ON COLUMN delivery_note_header.remarks IS 'Remarks';
COMMENT ON COLUMN delivery_note_header.user_id IS 'User ID';
COMMENT ON COLUMN delivery_note_header.cre_user IS 'Creator user';
COMMENT ON COLUMN delivery_note_header.cre_date IS 'Creation date';
COMMENT ON COLUMN delivery_note_header.mod_date IS 'Modification date';

-- mdndt: Delivery Note Detail
CREATE TABLE delivery_note_detail (
    dn_no VARCHAR(20) NOT NULL,       -- Delivery Note number (FK)
    item_no VARCHAR(20) NOT NULL,     -- Item number (links to mitem)
    qty DECIMAL(12,2) NOT NULL,       -- Delivery quantity
    ctn DECIMAL(12,2),                -- Carton quantity
    qctn DECIMAL(12,2),               -- Quantity per carton
    unit VARCHAR(10),                 -- Unit of measure
    item_desc TEXT,                   -- Item description
    po_no VARCHAR(50),                -- Purchase Order number
    ship_no VARCHAR(50),              -- Shipment number
    cntr_no VARCHAR(50),              -- Container number
    ref_no VARCHAR(50),               -- Reference number
    oc_no VARCHAR(20),                -- Order Confirmation number
    conf_no VARCHAR(20),              -- Order Confirmation number
    head BOOLEAN DEFAULT TRUE,        -- Head item flag (for BOM)
    line_no INTEGER,                  -- Line number
    user_id VARCHAR(50),              -- User ID
    cre_user VARCHAR(50),             -- Creator user
    cre_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mod_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (dn_no, item_no, line_no)
);

COMMENT ON TABLE delivery_note_detail IS 'Delivery Note Detail - Line items for delivery notes';
COMMENT ON COLUMN delivery_note_detail.dn_no IS 'Delivery Note number';
COMMENT ON COLUMN delivery_note_detail.item_no IS 'Item number';
COMMENT ON COLUMN delivery_note_detail.qty IS 'Delivery quantity';
COMMENT ON COLUMN delivery_note_detail.ctn IS 'Carton quantity';
COMMENT ON COLUMN delivery_note_detail.qctn IS 'Quantity per carton';
COMMENT ON COLUMN delivery_note_detail.unit IS 'Unit of measure';
COMMENT ON COLUMN delivery_note_detail.item_desc IS 'Item description';
COMMENT ON COLUMN delivery_note_detail.po_no IS 'Purchase Order number';
COMMENT ON COLUMN delivery_note_detail.ship_no IS 'Shipment number';
COMMENT ON COLUMN delivery_note_detail.cntr_no IS 'Container number';
COMMENT ON COLUMN delivery_note_detail.ref_no IS 'Reference number';
COMMENT ON COLUMN delivery_note_detail.oc_no IS 'Order Confirmation number';
COMMENT ON COLUMN delivery_note_detail.conf_no IS 'Order Confirmation number';
COMMENT ON COLUMN delivery_note_detail.head IS 'Head item flag (for BOM)';
COMMENT ON COLUMN delivery_note_detail.line_no IS 'Line number';
COMMENT ON COLUMN delivery_note_detail.user_id IS 'User ID';
COMMENT ON COLUMN delivery_note_detail.cre_user IS 'Creator user';
COMMENT ON COLUMN delivery_note_detail.cre_date IS 'Creation date';
COMMENT ON COLUMN delivery_note_detail.mod_date IS 'Modification date';

-- mdnbrk: Delivery Note Breakdown
CREATE TABLE delivery_note_breakdown (
    dn_no VARCHAR(20) NOT NULL,       -- Delivery Note number
    item_no VARCHAR(20) NOT NULL,     -- Item number
    port VARCHAR(50),                 -- Port
    qty DECIMAL(12,2),                -- Breakdown quantity
    po_no VARCHAR(50),                -- Purchase Order number
    del_from DATE,                    -- Delivery from date
    del_to DATE,                      -- Delivery to date
    user_id VARCHAR(50),              -- User ID
    cre_user VARCHAR(50),             -- Creator user
    cre_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mod_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (dn_no, item_no, port, po_no)
);

COMMENT ON TABLE delivery_note_breakdown IS 'Delivery Note Breakdown - Breakdown details for delivery notes';
COMMENT ON COLUMN delivery_note_breakdown.dn_no IS 'Delivery Note number';
COMMENT ON COLUMN delivery_note_breakdown.item_no IS 'Item number';
COMMENT ON COLUMN delivery_note_breakdown.port IS 'Port';
COMMENT ON COLUMN delivery_note_breakdown.qty IS 'Breakdown quantity';
COMMENT ON COLUMN delivery_note_breakdown.po_no IS 'Purchase Order number';
COMMENT ON COLUMN delivery_note_breakdown.del_from IS 'Delivery from date';
COMMENT ON COLUMN delivery_note_breakdown.del_to IS 'Delivery to date';
COMMENT ON COLUMN delivery_note_breakdown.user_id IS 'User ID';
COMMENT ON COLUMN delivery_note_breakdown.cre_user IS 'Creator user';
COMMENT ON COLUMN delivery_note_breakdown.cre_date IS 'Creation date';
COMMENT ON COLUMN delivery_note_breakdown.mod_date IS 'Modification date';

-- =================================================
-- LOADING TABLES
-- =================================================

-- mload: Loading Master
-- 10MB in legacy
CREATE TABLE loading_master (
    loading_no VARCHAR(50) PRIMARY KEY, -- Loading master number
    date DATE NOT NULL,                -- Loading date
    vessel_name VARCHAR(100),          -- Vessel name
    voyage_no VARCHAR(50),             -- Voyage number
    total_weight DECIMAL(12,2),        -- Total weight
    total_cube DECIMAL(12,2),          -- Total cube
    total_cartons INTEGER,             -- Total cartons
    remarks TEXT,                      -- Remarks
    status VARCHAR(20) DEFAULT 'Planned', -- Planned/In Progress/Completed
    user_id VARCHAR(50),               -- User ID
    cre_user VARCHAR(50),              -- Creator user
    cre_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mod_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE loading_master IS 'Loading Master - Master loading information (10MB in legacy)';
COMMENT ON COLUMN loading_master.loading_no IS 'Loading master number (Primary Key)';
COMMENT ON COLUMN loading_master.date IS 'Loading date';
COMMENT ON COLUMN loading_master.vessel_name IS 'Vessel name';
COMMENT ON COLUMN loading_master.voyage_no IS 'Voyage number';
COMMENT ON COLUMN loading_master.total_weight IS 'Total weight';
COMMENT ON COLUMN loading_master.total_cube IS 'Total cube';
COMMENT ON COLUMN loading_master.total_cartons IS 'Total cartons';
COMMENT ON COLUMN loading_master.remarks IS 'Remarks';
COMMENT ON COLUMN loading_master.status IS 'Status (Planned/In Progress/Completed)';
COMMENT ON COLUMN loading_master.user_id IS 'User ID';
COMMENT ON COLUMN loading_master.cre_user IS 'Creator user';
COMMENT ON COLUMN loading_master.cre_date IS 'Creation date';
COMMENT ON COLUMN loading_master.mod_date IS 'Modification date';

-- mlahd: Loading Advice Header
CREATE TABLE loading_advice_header (
    la_no VARCHAR(20) PRIMARY KEY,    -- Loading Advice number
    date DATE NOT NULL,               -- Loading advice date
    loading_no VARCHAR(50),           -- Loading master number (FK)
    vessel_name VARCHAR(100),         -- Vessel name
    voyage_no VARCHAR(50),            -- Voyage number
    remarks TEXT,                     -- Remarks
    user_id VARCHAR(50),              -- User ID
    cre_user VARCHAR(50),             -- Creator user
    cre_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mod_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE loading_advice_header IS 'Loading Advice Header - Header for loading advice';
COMMENT ON COLUMN loading_advice_header.la_no IS 'Loading Advice number (Primary Key)';
COMMENT ON COLUMN loading_advice_header.date IS 'Loading advice date';
COMMENT ON COLUMN loading_advice_header.loading_no IS 'Loading master number';
COMMENT ON COLUMN loading_advice_header.vessel_name IS 'Vessel name';
COMMENT ON COLUMN loading_advice_header.voyage_no IS 'Voyage number';
COMMENT ON COLUMN loading_advice_header.remarks IS 'Remarks';
COMMENT ON COLUMN loading_advice_header.user_id IS 'User ID';
COMMENT ON COLUMN loading_advice_header.cre_user IS 'Creator user';
COMMENT ON COLUMN loading_advice_header.cre_date IS 'Creation date';
COMMENT ON COLUMN loading_advice_header.mod_date IS 'Modification date';

-- mladt: Loading Advice Detail
-- 4.4MB + 16MB FPT in legacy
CREATE TABLE loading_advice_detail (
    la_no VARCHAR(20) NOT NULL,       -- Loading Advice number (FK)
    item_no VARCHAR(20) NOT NULL,     -- Item number
    qty DECIMAL(12,2) NOT NULL,       -- Loading quantity
    ctn DECIMAL(12,2),                -- Carton quantity
    weight DECIMAL(12,2),             -- Weight
    cube DECIMAL(12,2),               -- Cube
    container_no VARCHAR(50),         -- Container number
    position VARCHAR(50),             -- Loading position
    remarks TEXT,                     -- Remarks
    user_id VARCHAR(50),              -- User ID
    cre_user VARCHAR(50),             -- Creator user
    cre_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mod_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (la_no, item_no)
);

COMMENT ON TABLE loading_advice_detail IS 'Loading Advice Detail - Line items for loading advice (4.4MB + 16MB FPT in legacy)';
COMMENT ON COLUMN loading_advice_detail.la_no IS 'Loading Advice number';
COMMENT ON COLUMN loading_advice_detail.item_no IS 'Item number';
COMMENT ON COLUMN loading_advice_detail.qty IS 'Loading quantity';
COMMENT ON COLUMN loading_advice_detail.ctn IS 'Carton quantity';
COMMENT ON COLUMN loading_advice_detail.weight IS 'Weight';
COMMENT ON COLUMN loading_advice_detail.cube IS 'Cube';
COMMENT ON COLUMN loading_advice_detail.container_no IS 'Container number';
COMMENT ON COLUMN loading_advice_detail.position IS 'Loading position';
COMMENT ON COLUMN loading_advice_detail.remarks IS 'Remarks';
COMMENT ON COLUMN loading_advice_detail.user_id IS 'User ID';
COMMENT ON COLUMN loading_advice_detail.cre_user IS 'Creator user';
COMMENT ON COLUMN loading_advice_detail.cre_date IS 'Creation date';
COMMENT ON COLUMN loading_advice_detail.mod_date IS 'Modification date';

-- =================================================
-- INVOICE TABLES
-- =================================================

-- minvhd: Invoice Header
-- 93MB in legacy
CREATE TABLE invoice_header (
    inv_no VARCHAR(20) PRIMARY KEY,   -- Invoice number
    cust_no VARCHAR(20),              -- Customer number (links to mcustom)
    date DATE NOT NULL,               -- Invoice date
    oc_no VARCHAR(20),                -- Order Confirmation number (links to mordhd)
    ship VARCHAR(100),                -- Shipment information
    del_date DATE,                    -- Delivery date
    loading_port VARCHAR(100),        -- Loading port
    dest VARCHAR(100),                -- Destination
    payment_terms VARCHAR(200),       -- Payment terms
    remarks TEXT,                     -- Remarks
    pl_status VARCHAR(20) DEFAULT 'Not Printed', -- Packing List status
    pl_sh_status VARCHAR(20) DEFAULT 'Not Printed', -- Packing List Ship Mark status
    user_id VARCHAR(50),              -- User ID
    cre_user VARCHAR(50),             -- Creator user
    cre_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mod_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE invoice_header IS 'Invoice Header - Header for invoices (93MB in legacy)';
COMMENT ON COLUMN invoice_header.inv_no IS 'Invoice number (Primary Key)';
COMMENT ON COLUMN invoice_header.cust_no IS 'Customer number';
COMMENT ON COLUMN invoice_header.date IS 'Invoice date';
COMMENT ON COLUMN invoice_header.oc_no IS 'Order Confirmation number';
COMMENT ON COLUMN invoice_header.ship IS 'Shipment information';
COMMENT ON COLUMN invoice_header.del_date IS 'Delivery date';
COMMENT ON COLUMN invoice_header.loading_port IS 'Loading port';
COMMENT ON COLUMN invoice_header.dest IS 'Destination';
COMMENT ON COLUMN invoice_header.payment_terms IS 'Payment terms';
COMMENT ON COLUMN invoice_header.remarks IS 'Remarks';
COMMENT ON COLUMN invoice_header.pl_status IS 'Packing List status (Not Printed/Printed)';
COMMENT ON COLUMN invoice_header.pl_sh_status IS 'Packing List Ship Mark status (Not Printed/Printed)';
COMMENT ON COLUMN invoice_header.user_id IS 'User ID';
COMMENT ON COLUMN invoice_header.cre_user IS 'Creator user';
COMMENT ON COLUMN invoice_header.cre_date IS 'Creation date';
COMMENT ON COLUMN invoice_header.mod_date IS 'Modification date';

-- minvdt: Invoice Detail
-- 123MB + 178MB FPT in legacy
CREATE TABLE invoice_detail (
    inv_no VARCHAR(20) NOT NULL,      -- Invoice number (FK)
    item_no VARCHAR(20) NOT NULL,     -- Item number (links to mitem)
    qty DECIMAL(12,2) NOT NULL,       -- Invoice quantity
    price DECIMAL(12,4),              -- Invoice price
    amount DECIMAL(12,2),             -- Line amount (calculated)
    ctn DECIMAL(12,2),                -- Carton quantity
    qctn DECIMAL(12,2),               -- Quantity per carton
    net DECIMAL(12,2),                -- Net weight
    wt DECIMAL(12,2),                 -- Gross weight
    cube DECIMAL(12,2),               -- Cube measurement
    dim VARCHAR(50),                  -- Dimensions
    unit VARCHAR(10),                 -- Unit of measure
    desp_memo TEXT,                   -- Description memo (large text)
    po_no VARCHAR(50),                -- Purchase Order number
    ship_no VARCHAR(50),              -- Shipment number
    cntr_no VARCHAR(50),              -- Container number
    ref_no VARCHAR(50),               -- Reference number
    oc_no VARCHAR(20),                -- Order Confirmation number
    conf_no VARCHAR(20),              -- Order Confirmation number
    so_no VARCHAR(20),                -- Shipping Order number
    head BOOLEAN DEFAULT TRUE,        -- Head item flag (for BOM)
    line_no INTEGER,                  -- Line number
    user_id VARCHAR(50),              -- User ID
    cre_user VARCHAR(50),             -- Creator user
    cre_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mod_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (inv_no, item_no, line_no)
);

COMMENT ON TABLE invoice_detail IS 'Invoice Detail - Line items for invoices (123MB + 178MB FPT in legacy)';
COMMENT ON COLUMN invoice_detail.inv_no IS 'Invoice number';
COMMENT ON COLUMN invoice_detail.item_no IS 'Item number';
COMMENT ON COLUMN invoice_detail.qty IS 'Invoice quantity';
COMMENT ON COLUMN invoice_detail.price IS 'Invoice price';
COMMENT ON COLUMN invoice_detail.amount IS 'Line amount (calculated)';
COMMENT ON COLUMN invoice_detail.ctn IS 'Carton quantity';
COMMENT ON COLUMN invoice_detail.qctn IS 'Quantity per carton';
COMMENT ON COLUMN invoice_detail.net IS 'Net weight';
COMMENT ON COLUMN invoice_detail.wt IS 'Gross weight';
COMMENT ON COLUMN invoice_detail.cube IS 'Cube measurement';
COMMENT ON COLUMN invoice_detail.dim IS 'Dimensions';
COMMENT ON COLUMN invoice_detail.unit IS 'Unit of measure';
COMMENT ON COLUMN invoice_detail.desp_memo IS 'Description memo (large text)';
COMMENT ON COLUMN invoice_detail.po_no IS 'Purchase Order number';
COMMENT ON COLUMN invoice_detail.ship_no IS 'Shipment number';
COMMENT ON COLUMN invoice_detail.cntr_no IS 'Container number';
COMMENT ON COLUMN invoice_detail.ref_no IS 'Reference number';
COMMENT ON COLUMN invoice_detail.oc_no IS 'Order Confirmation number';
COMMENT ON COLUMN invoice_detail.conf_no IS 'Order Confirmation number';
COMMENT ON COLUMN invoice_detail.so_no IS 'Shipping Order number';
COMMENT ON COLUMN invoice_detail.head IS 'Head item flag (for BOM)';
COMMENT ON COLUMN invoice_detail.line_no IS 'Line number';
COMMENT ON COLUMN invoice_detail.user_id IS 'User ID';
COMMENT ON COLUMN invoice_detail.cre_user IS 'Creator user';
COMMENT ON COLUMN invoice_detail.cre_date IS 'Creation date';
COMMENT ON COLUMN invoice_detail.mod_date IS 'Modification date';

-- =================================================
-- INDEXES FOR PERFORMANCE
-- =================================================

-- Shipping Order indexes
CREATE INDEX idx_shipping_order_conf_no ON shipping_order(conf_no);
CREATE INDEX idx_shipping_order_cont_no ON shipping_order(cont_no);
CREATE INDEX idx_shipping_order_item_no ON shipping_order(item_no);
CREATE INDEX idx_shipping_order_so_no_item ON shipping_order(so_no, item_no);
CREATE INDEX idx_shipping_order_ship_date ON shipping_order(ship_date);

-- Delivery Note indexes
CREATE INDEX idx_delivery_note_header_cust_no ON delivery_note_header(cust_no);
CREATE INDEX idx_delivery_note_header_so_no ON delivery_note_header(so_no);
CREATE INDEX idx_delivery_note_header_date ON delivery_note_header(date);
CREATE INDEX idx_delivery_note_detail_item_no ON delivery_note_detail(item_no);
CREATE INDEX idx_delivery_note_detail_dn_item ON delivery_note_detail(dn_no, item_no);
CREATE INDEX idx_delivery_note_breakdown_dn_item ON delivery_note_breakdown(dn_no, item_no);

-- Loading indexes
CREATE INDEX idx_loading_master_date ON loading_master(date);
CREATE INDEX idx_loading_master_status ON loading_master(status);
CREATE INDEX idx_loading_advice_header_loading_no ON loading_advice_header(loading_no);
CREATE INDEX idx_loading_advice_detail_item_no ON loading_advice_detail(item_no);

-- Invoice indexes
CREATE INDEX idx_invoice_header_cust_no ON invoice_header(cust_no);
CREATE INDEX idx_invoice_header_oc_no ON invoice_header(oc_no);
CREATE INDEX idx_invoice_header_date ON invoice_header(date);
CREATE INDEX idx_invoice_detail_item_no ON invoice_detail(item_no);
CREATE INDEX idx_invoice_detail_so_no ON invoice_detail(so_no);
CREATE INDEX idx_invoice_detail_inv_item ON invoice_detail(inv_no, item_no);

-- =================================================
-- FOREIGN KEY CONSTRAINTS (SOFT FOR NOW)
-- =================================================

-- Note: These are soft FKs initially. Will be made strict after data validation.
-- See migration 003 for the pattern of making them strict.

-- Shipping Order FKs
ALTER TABLE shipping_order ADD CONSTRAINT fk_shipping_order_conf_no
FOREIGN KEY (conf_no) REFERENCES order_confirmation_header(conf_no)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE shipping_order ADD CONSTRAINT fk_shipping_order_cont_no
FOREIGN KEY (cont_no) REFERENCES contract_header(cont_no)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE shipping_order ADD CONSTRAINT fk_shipping_order_item_no
FOREIGN KEY (item_no) REFERENCES item(item_no)
DEFERRABLE INITIALLY DEFERRED;

-- Delivery Note FKs
ALTER TABLE delivery_note_header ADD CONSTRAINT fk_dn_header_cust_no
FOREIGN KEY (cust_no) REFERENCES customer(cust_no)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE delivery_note_detail ADD CONSTRAINT fk_dn_detail_dn_no
FOREIGN KEY (dn_no) REFERENCES delivery_note_header(dn_no)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE delivery_note_detail ADD CONSTRAINT fk_dn_detail_item_no
FOREIGN KEY (item_no) REFERENCES item(item_no)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE delivery_note_breakdown ADD CONSTRAINT fk_dn_breakdown_dn_no
FOREIGN KEY (dn_no) REFERENCES delivery_note_header(dn_no)
DEFERRABLE INITIALLY DEFERRED;

-- Loading FKs
ALTER TABLE loading_advice_header ADD CONSTRAINT fk_la_header_loading_no
FOREIGN KEY (loading_no) REFERENCES loading_master(loading_no)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE loading_advice_detail ADD CONSTRAINT fk_la_detail_la_no
FOREIGN KEY (la_no) REFERENCES loading_advice_header(la_no)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE loading_advice_detail ADD CONSTRAINT fk_la_detail_item_no
FOREIGN KEY (item_no) REFERENCES item(item_no)
DEFERRABLE INITIALLY DEFERRED;

-- Invoice FKs
ALTER TABLE invoice_header ADD CONSTRAINT fk_invoice_header_cust_no
FOREIGN KEY (cust_no) REFERENCES customer(cust_no)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE invoice_header ADD CONSTRAINT fk_invoice_header_oc_no
FOREIGN KEY (oc_no) REFERENCES order_confirmation_header(conf_no)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE invoice_detail ADD CONSTRAINT fk_invoice_detail_inv_no
FOREIGN KEY (inv_no) REFERENCES invoice_header(inv_no)
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE invoice_detail ADD CONSTRAINT fk_invoice_detail_item_no
FOREIGN KEY (item_no) REFERENCES item(item_no)
DEFERRABLE INITIALLY DEFERRED;

-- =================================================
-- REPORTING TABLES
-- =================================================

-- report_definition: Report Definition
-- Stores report definitions and metadata for 116+ reports
CREATE TABLE report_definition (
    report_key VARCHAR(100) PRIMARY KEY,  -- Unique report identifier
    report_name VARCHAR(200) NOT NULL,    -- Report display name
    category VARCHAR(100),                -- Report category
    description TEXT,                     -- Report description
    sql_query TEXT NOT NULL,              -- SQL query or query template
    parameters JSONB,                     -- Report parameters definition
    format_config JSONB,                 -- Format configuration
    status VARCHAR(20) DEFAULT 'Active',  -- Active/Inactive/Migrated
    legacy_report_file VARCHAR(50),      -- Original .frx file name
    cre_user VARCHAR(50),                -- Creator user
    cre_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mod_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE report_definition IS 'Report Definition - Stores report definitions for 116+ reports';
COMMENT ON COLUMN report_definition.report_key IS 'Unique report identifier';
COMMENT ON COLUMN report_definition.report_name IS 'Report display name';
COMMENT ON COLUMN report_definition.category IS 'Report category (Transaction, Summary, Analysis, Export)';
COMMENT ON COLUMN report_definition.description IS 'Report description';
COMMENT ON COLUMN report_definition.sql_query IS 'SQL query or query template';
COMMENT ON COLUMN report_definition.parameters IS 'Report parameters definition (JSON)';
COMMENT ON COLUMN report_definition.format_config IS 'Format configuration (JSON)';
COMMENT ON COLUMN report_definition.status IS 'Status (Active/Inactive/Migrated)';
COMMENT ON COLUMN report_definition.legacy_report_file IS 'Original .frx file name';
COMMENT ON COLUMN report_definition.cre_user IS 'Creator user';
COMMENT ON COLUMN report_definition.cre_date IS 'Creation date';
COMMENT ON COLUMN report_definition.mod_date IS 'Modification date';

CREATE INDEX idx_report_definition_category ON report_definition(category);
CREATE INDEX idx_report_definition_status ON report_definition(status);

-- =================================================
-- VERIFICATION QUERIES
-- =================================================

-- Check table creation
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('zsoformat', 'shipping_order', 'delivery_note_header', 'delivery_note_detail', 'delivery_note_breakdown', 'loading_master', 'loading_advice_header', 'loading_advice_detail', 'invoice_header', 'invoice_detail');

-- Check indexes
-- SELECT indexname, tablename FROM pg_indexes
-- WHERE tablename IN ('shipping_order', 'delivery_note_header', 'delivery_note_detail', 'invoice_header', 'invoice_detail')
-- ORDER BY tablename, indexname;