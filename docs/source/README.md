# FoxPro Trading Management System - Documentation

## Overview

This documentation provides comprehensive analysis of the existing FoxPro Trading Management System (Version 3.0, July 2025). It serves as the foundation for understanding the system's architecture, business logic, and data structures before any modernization efforts.

## Documentation Structure

### 00-overview/
- **system-summary.md** - Application overview, capabilities, and architecture
- **technology-stack.md** - Technology details, file formats, and dependencies
- **user-roles.md** - User roles, permissions, and multi-company support

### 01-data-architecture/
- **database-overview.md** - Database technology, file types, and organization
- **table-inventory.md** - Complete list of 186 DBF tables
- **entity-relationships.md** - Table relationships and ERD diagrams
- **table-details/**
  - **transaction-tables.md** - Transaction table schemas (OE, OC, Contract, SO, Invoice, etc.)
  - **master-data-tables.md** - Master data schemas (Items, Customers, Vendors, BOM)
  - **supporting-tables.md** - Supporting/reference table schemas
- **indexes-and-keys.md** - Index structures and key management

### 02-business-processes/
- **workflow-overview.md** - End-to-end trading workflow and document lifecycle
- **order-enquiry-process.md** - OE creation, validation, and processing
- **order-confirmation-process.md** - Post OE to OC workflow
- **contract-process.md** - Contract generation from OC
- **shipping-process.md** - Shipping order creation and management
- **invoice-process.md** - Invoice generation and packing lists
- **master-data-management.md** - Item, customer, vendor setup

### 03-application-modules/
- Module documentation (in progress)

### 04-forms-and-screens/
- Form documentation (in progress)

### 05-business-logic/
- Business logic documentation (in progress)

### 06-reporting/
- Reporting documentation (in progress)

### 07-integration/
- Integration documentation (in progress)

### 08-security/
- Security documentation (in progress)

### 09-technical-details/
- Technical documentation (in progress)

## System Statistics

- **Forms:** 195+ screens (.scx files)
- **Programs:** 176+ business logic files (.prg)
- **Database Tables:** 186 DBF files
- **Reports:** 116+ FRX report files
- **Menu Items:** 100+ menu options

## Key Workflows

1. **Order-to-Invoice Flow:**
   OE → OC → Contract → SO → DN → Invoice

2. **Data Import Flow:**
   Excel File → Validation → OE Creation → Processing

3. **Master Data Flow:**
   Item/Customer/Vendor Setup → Transaction Creation → Reporting

## Technology

- **Platform:** Visual FoxPro 9.0
- **Database:** DBF/CDX/FPT (file-based)
- **Architecture:** Desktop application, multi-user capable
- **Integration:** Excel import/export, PDF generation

## Documentation Status

✅ **Completed:**
- System Overview (3 files) - Complete
- Data Architecture (6 files) - Complete
- Business Processes (7 files) - Complete
- Application Modules (2 files) - Core modules documented
- Forms and Screens (1 file) - Inventory created
- Business Logic (2 files) - Key logic documented
- Reporting (1 file) - Inventory created
- Integration (1 file) - Excel integration documented
- Security (1 file) - Authentication documented
- Technical Details (3 files) - Key technical info documented

📝 **Documentation Created:** 27 files
📊 **Coverage:** Core architecture, data structures, business processes, and key modules

## How to Use This Documentation

1. **Start with Overview:** Read `00-overview/` to understand the system
2. **Understand Data:** Review `01-data-architecture/` for table structures
3. **Learn Processes:** Study `02-business-processes/` for workflows
4. **Explore Modules:** Review `03-application-modules/` for functionality
5. **Reference Details:** Use other sections for specific information

## Notes

- This documentation is based on source code analysis
- Some details are inferred from code patterns
- Table schemas are inferred from usage, not actual DBF structure
- Business rules extracted from validation logic

## Last Updated

December 2025

