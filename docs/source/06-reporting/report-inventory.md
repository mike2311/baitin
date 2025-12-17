# Report Inventory

## Overview

The system contains 116+ report files (.frx) providing printed and electronic output for all document types and analyses.

## Report Count

- **Total Reports:** 116+ (.frx files identified)
- **Categories:** Transaction reports, summary reports, analysis reports, export reports

## Report Categories

### Transaction Reports

**Order Enquiry:**
- `pordenq` - Order Enquiry report
- `pordenq2` - Order Enquiry (New)
- `pordenq_pdf` - Order Enquiry PDF
- `poedoc` - OE Doc (OE, OC, CONT)

**Order Confirmation:**
- `pconfirm` - Order Confirmation
- `pconfirm_pdf` - Order Confirmation PDF
- `pocbrk` - OC Qty Breakdown
- `pocqty` - OC Qty & Pricing Report

**Contract:**
- `pcontract@_2018` - Contract (2018)
- `pcontract_pdf` - Contract PDF
- `pcontbrk` - Contract Qty Breakdown
- `pcontamdrmk` - Contract Amendment

**Shipping Order:**
- `pso` - Shipping Order
- `pso_pdf` - Shipping Order PDF
- `psox` - Shipping Order (variant)

**Invoice:**
- `pinv@` - Invoice (New)
- `pinv_pdf` - Invoice PDF
- `pinv_xls` - Invoice to XLS
- `ppacklist_new` - Packing List (New)
- `ppacklist_xls` - Packing List to XLS
- `ppacklist_xls_spencer` - Packing List (Spencer Format)

**Delivery Note:**
- `pdn` - Delivery Note
- `pdnorg` - D/N Original List
- `pla` - Loading Advice

**Debit Note:**
- `pdebitnote` - Debit Note

### Summary Reports

- `poesumry` - OE Summary
- `pocsumry` - OC Summary
- `einvsumry` - Invoice Summary
- `econtsumry` - Contract Summary

### Analysis Reports

- `psabycust` - Sales Analysis By Customer
- `psabydt` - Sales Analysis By Customer - Date
- `psabyitem` - Sales Analysis By Item - Date
- `pordbyitem` - Order Report By Item
- `polbymk` - Order List By Maker
- `ecostbrk` - Cost Breakdown

### Item Reports

- `pitem` - Item Detail Report
- `pitemsum` - Item Bought (Excel)
- `pitemmeas` - Item Measurement (Excel)

### Export Reports

- `pinv_xls` - Invoice to Excel
- `ppacklist_xls` - Packing List to Excel
- `pdn_xls` - D/N to Excel
- `psm_to_xls` - Shipmark to XLS

## Report Formats

### Print Reports
- Standard print format
- Printer output
- Print preview

### PDF Reports
- PDF generation
- Email distribution
- Archive storage

### Excel Reports
- Excel export
- Customer-specific formats
- Data analysis

## Report Parameters

### Common Parameters

- Date ranges
- Customer selection
- Item selection
- Document number ranges
- Status filters

### Report-Specific Parameters

Each report may have specific parameters based on its purpose.

## Report Data Sources

### Transaction Reports
- Read from transaction tables (moe, morddt, mcontdt, minvdt, mso)

### Summary Reports
- Aggregate data from transaction tables
- Group by customer, item, date

### Analysis Reports
- Complex queries across multiple tables
- Calculations and aggregations

## Report Generation

### Report Engine

**Technology:** Visual FoxPro FRX report engine

**Process:**
1. Select report
2. Enter parameters
3. Generate report
4. Print, preview, or export

### Report Files

- **`.frx`** - Report file (binary)
- **`.frt`** - Report memo file (text)

### Report Location

- All reports in `source/` directory
- Reports referenced by forms and programs

## Summary

The system has 116+ reports covering all document types and analyses. Reports support multiple output formats (print, PDF, Excel) and provide comprehensive business intelligence. Detailed report specifications require examination of individual .frx files.



