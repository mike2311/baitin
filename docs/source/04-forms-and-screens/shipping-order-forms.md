# Shipping Order Forms

## Overview

Shipping Order (SO) forms handle the creation and management of shipping orders from contracts. SOs define what will be shipped and are used for delivery note and invoice generation.

## Form: isetso (Input Shipping Order)

### Form Details

- **Form Name:** `isetso`
- **File:** `source/isetso.scx` / `source/isetso.SCT`
- **Type:** Formset with multiple forms
- **Purpose:** Create and manage shipping orders

### Process Flow

```mermaid
flowchart TD
    Start([Open SO Form]) --> Load[Form Load Event<br/>Initialize Variables]
    Load --> Init[Form Init Event<br/>Initialize Variables<br/>w_conf_no = ""]
    Init --> Display[Display Form<br/>SO Entry Form]
    
    Display --> UserEntersOC[User Enters OC Number<br/>conf_no]
    UserEntersOC --> ValidateOC{OC<br/>Exists?}
    ValidateOC -->|No| ShowError[Show Error<br/>OC Not Found]
    ValidateOC -->|Yes| LoadOCItems[Load OC Items<br/>SELECT morddt<br/>WHERE conf_no]
    
    LoadOCItems --> LoadContractItems[Load Contract Items<br/>SELECT mcontdt<br/>WHERE conf_no]
    LoadContractItems --> LoadExistingSO[Load Existing SO<br/>SELECT mso<br/>WHERE conf_no]
    
    LoadExistingSO --> BuildGrid[Call ugrid Method<br/>Build SO Grid]
    
    BuildGrid --> PopulateGrid1[Populate Grid1<br/>Contract Items<br/>wsetcontgrid1]
    PopulateGrid1 --> PopulateGrid2[Populate Grid2<br/>SO Items<br/>wsetcontgrid2]
    PopulateGrid2 --> DisplayGrid[Display Grids<br/>Show Available vs<br/>Already Shipped]
    
    DisplayGrid --> UserAction{User<br/>Action?}
    
    UserAction -->|Select Items| SelectItems[User Selects Items<br/>from Grid1]
    UserAction -->|Create SO| CreateSO[Click Create SO Button]
    UserAction -->|Edit SO| EditSO[Click Edit SO Button]
    
    SelectItems --> ValidateSelection{Items<br/>Selected?}
    ValidateSelection -->|No| ShowError1[Show Error<br/>No Items Selected]
    ValidateSelection -->|Yes| CalculateQty[Calculate Quantities<br/>Check Available Qty]
    
    CalculateQty --> CheckAvailable{Qty<br/>Available?}
    CheckAvailable -->|No| ShowError2[Show Error<br/>Insufficient Quantity]
    CheckAvailable -->|Yes| CreateSO
    
    CreateSO --> ValidateSO{SO Number<br/>Entered?}
    ValidateSO -->|No| ShowError3[Show Error<br/>SO No Required]
    ValidateSO -->|Yes| CreateSORecords[Create SO Records<br/>APPEND to mso<br/>For Each Selected Item]
    
    CreateSORecords --> UpdateQuantities[Update Quantities<br/>Calculate LCL, FCL<br/>LOG quantities]
    UpdateQuantities --> ShowSuccess[Show Success Message]
    ShowSuccess --> RefreshGrid[Refresh Grid<br/>Call ugrid Method]
    
    RefreshGrid --> DisplayGrid
```

### ugrid Method

**Purpose:** Populate SO grids with contract and SO items

**Process:**
1. Load existing SO items from `mso`
2. Load contract items from `mcontdt`
3. Calculate available quantities
4. Populate Grid1 (contract items)
5. Populate Grid2 (SO items)

## Form: isetsodt (SO Detail)

### Form Details

- **Form Name:** `isetsodt`
- **Purpose:** SO detail item entry
- **Called From:** SO header form

## Form: pso (Print Shipping Order)

### Form Details

- **Form Name:** `pso`
- **Purpose:** Print shipping order document
- **Process:** Generate report from `mso` table

## Form: isoformat (Input SO Format)

### Form Details

- **Form Name:** `isoformat`
- **Purpose:** Configure SO format settings
- **Process:** Maintain SO format parameters

## Summary

Shipping Order forms provide:
- **isetso** - SO creation from contracts
- **isetsodt** - SO detail item entry
- **pso** - SO document printing
- **isoformat** - SO format configuration

The forms include quantity validation, LCL/FCL calculations, and integration with delivery note workflow.
