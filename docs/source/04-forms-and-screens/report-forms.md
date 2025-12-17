# Report Forms

## Overview

Report forms generate printed reports and Excel exports for business analysis and documentation. These forms query data, format output, and generate documents.

## Form: pocqty (OC Qty & Pricing Report)

### Form Details

- **Form Name:** `pocqty`
- **Purpose:** Generate OC quantity and pricing report
- **Process:** Query `mordhd` and `morddt`, format report

## Form: pordbyitem (Order Report By Item)

### Form Details

- **Form Name:** `pordbyitem`
- **Purpose:** Generate order report grouped by item
- **Process:** Aggregate order data by item

## Form: psabycust (Sales Report By Customer)

### Form Details

- **Form Name:** `psabycust`
- **Purpose:** Generate sales report by customer
- **Process:** Aggregate sales data by customer

## Form: pitem (Item Detail Report)

### Form Details

- **Form Name:** `pitem`
- **Purpose:** Generate item detail report
- **Process:** Query `mitem` table, format report

## Form: pitemsum (Item Bought Excel)

### Form Details

- **Form Name:** `pitemsum`
- **Purpose:** Export item purchase data to Excel
- **Process:** Query item purchase data, export to Excel

## Form: pitemmeas (Item Measurement Excel)

### Form Details

- **Form Name:** `pitemmeas`
- **Purpose:** Export item measurements to Excel
- **Process:** Query item measurement data, export to Excel

## Form: poe_08_10 (OE LIST 08-10)

### Form Details

- **Form Name:** `poe_08_10`
- **Purpose:** Generate OE list for date range 08-10
- **Process:** Query OEs in date range, format report

## Form: pinv_08_10 (INV LIST 08-10)

### Form Details

- **Form Name:** `pinv_08_10`
- **Purpose:** Generate invoice list for date range 08-10
- **Process:** Query invoices in date range, format report

## Form: psabydt (Sales Analysis By Customer)

### Form Details

- **Form Name:** `psabydt`
- **Purpose:** Sales analysis report by customer
- **Process:** Aggregate and format sales data

## Form: psabyitem (Sales Analysis By Customer, Item No.)

### Form Details

- **Form Name:** `psabyitem`
- **Purpose:** Sales analysis by customer and item
- **Process:** Aggregate sales data by customer and item

## Form: polbymk (Order List By Maker)

### Form Details

- **Form Name:** `polbymk`
- **Purpose:** Generate order list grouped by maker
- **Process:** Query orders, group by maker/vendor

## Form: itemlist_by_oe (Item List By OE Date)

### Form Details

- **Form Name:** `itemlist_by_oe`
- **Purpose:** Generate item list filtered by OE date
- **Process:** Query items by OE date range

## Form: psm_to_xls (Print Shipmark to XLS)

### Form Details

- **Form Name:** `psm_to_xls`
- **Purpose:** Export shipmark data to Excel
- **Process:** Query shipmark data, export to Excel

## Form: isetcont@@_test (Contract Speed Check)

### Form Details

- **Form Name:** `isetcont@@_test`
- **Purpose:** Contract speed check/test report
- **Process:** Performance testing for contract processing

## Summary

Report forms provide comprehensive reporting capabilities:
- **pocqty** - OC quantity and pricing reports
- **pordbyitem** - Order reports by item
- **psabycust** - Sales reports by customer
- **pitem** - Item detail reports
- **pitemsum, pitemmeas** - Item data exports
- **poe_08_10, pinv_08_10** - Date range lists
- **psabydt, psabyitem** - Sales analysis reports
- **polbymk** - Order lists by maker
- **itemlist_by_oe** - Item lists by OE date
- **psm_to_xls** - Shipmark exports
- **isetcont@@_test** - Contract testing

The forms include query logic, data aggregation, formatting, and Excel export capabilities.
