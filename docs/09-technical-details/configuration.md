# Configuration

## Startup Configuration

### main.prg

**Purpose:** Main application startup script

**Key Settings:**
```foxpro
SET TALK OFF
SET DELETE ON
SET SAFETY OFF
SET STATUS BAR OFF
SET CENTURY ON
set date mdy
set path to c:\batwork
set exclusive off
SET ENGINEBEHAVIOR 70
```

**Screen Configuration:**
```foxpro
_SCREEN.CAPTION="Trading Management System - V3.0 July 9, 2025) "
_SCREEN.WINDOWSTATE=2
```

**Code Reference:** `source/main.prg`

### a.prg

**Purpose:** Development/testing configuration

**Key Settings:**
```foxpro
SET ENGINEBEHAVIOR 90
set date mdy
set default to d:\project\victor\baitin9
set path to c:\batwork, &syswork
```

**Company Configuration:**
```foxpro
w_password = "HT"
w_co_name = "HOLIDAY TIMES UNLIMITED INC"
w_oe_prefix = ""

*w_password = "INSP"
*w_co_name = "InSpirt Designs"

*w_password = "BAT"
*w_co_name = "BAITIN TRADING LIMITED"

*w_password = "HFW"
*w_co_name = "HOLIDAY FUNWORLD LIMITED"
*w_oe_prefix = "HFW"
```

**Code Reference:** `source/a.prg`

## PATH Settings

### Working Directories

**Shared Directory:**
- `C:\batwork` - Shared working directory
- Contains database files, reports, temporary files

**User Directory:**
- `C:\<userid>work` - Per-user working directory
- Created automatically if doesn't exist
- Used for user-specific temporary files

**Configuration:**
```foxpro
set path to c:\batwork, &syswork
```

**Code Reference:** `main.prg` (line 19, 43)

## Company Configuration

### Company Selection

**Method:** Password-based company selection

**Variables:**
- `w_password` - Company code (HT, BAT, INSP, HFW)
- `w_co_name` - Company name
- `w_oe_prefix` - OE number prefix

### Company-Specific Behavior

**HT (Holiday Times):**
- OE numbers contain "/"
- `comp_code = "HT"` set automatically

**BAT (Baitin Trading):**
- OE numbers don't contain "/"
- `comp_code = "BAT"` set automatically

**INSP (InSpirt Designs):**
- Adds "IN-" prefix to OE numbers
- Bypasses OE Control validation
- Different date logic

**HFW (Holiday Funworld):**
- Uses "HFW" prefix for OE numbers
- `w_oe_prefix = "HFW"`

**Code Reference:** `xmoe.prg` (lines 50-54), `uoexls_2013.prg` (lines 145-147, 1337-1341)

## System Parameters

### zpara Table

**Purpose:** System-wide configuration parameters

**Structure:**
- `para_code` - Parameter code (Primary Key)
- `para_value` - Parameter value
- `para_desp` - Parameter description

**Usage:**
- System settings
- Default values
- Configuration options

## Date/Time Settings

### Date Format

**Setting:** `SET DATE MDY`
- Format: MM/DD/YYYY
- Used throughout system

### Century Display

**Setting:** `SET CENTURY ON`
- Displays 4-digit years
- Required for date calculations

### Hour Format

**Setting:** `SET HOUR TO 24`
- 24-hour time format
- Used for time displays

## Engine Behavior

### SET ENGINEBEHAVIOR

**Values:**
- `70` - Visual FoxPro 7.0 compatibility
- `90` - Visual FoxPro 9.0 features

**Usage:**
- `main.prg` uses `70`
- `a.prg` uses `90` (development)

**Impact:**
- Affects language features
- Compatibility with older code

## File Access Settings

### SET EXCLUSIVE

**Setting:** `SET EXCLUSIVE OFF`
- Default: Shared access
- Allows multi-user access
- Record/file-level locking

### SET SAFETY

**Setting:** `SET SAFETY OFF`
- No confirmation prompts
- Faster operations
- Risk of overwriting files

### SET DELETE

**Setting:** `SET DELETE ON`
- Deleted records hidden
- Not physically removed
- Can be recovered

## Language Settings

### w_sys_language

**Variable:** `w_sys_language = "E"`
- System language: English
- May support other languages

## User Configuration

### sysUserId

**Variable:** Set during login
- User identification
- Used for audit trails
- Used for user-specific directories

### syswork

**Variable:** `syswork="c:\"+alltrim(sysuserid)+"work"`
- User-specific working directory
- Created automatically
- Used for temporary files

## Database Configuration

### Database Path

**Setting:** Files in `C:\batwork`
- All DBF files
- CDX index files
- FPT memo files
- FRX report files

### Table Aliases

**Usage:** `baitin!` prefix
- Example: `baitin!mitem`
- Specifies database context
- Used in multi-database scenarios

## Report Configuration

### Report Path

**Location:** `C:\batwork\*.frx`
- Report files
- Report templates
- Custom formats

## Excel Integration Configuration

### Excel Formats

**Supported Formats:**
- Excel 97-2003 (.xls)
- Excel 2007+ (.xlsx)
- CSV files
- Custom formats per customer

### Import Paths

**Temporary Files:**
- User working directory
- Shared working directory
- Excel file processing

## Print Configuration

### Printer Settings

**Default:** System default printer
- Can be changed per report
- PDF generation supported
- Print preview available

## Summary

The system uses a combination of hardcoded settings in `main.prg` and `a.prg`, PATH configuration for file access, company-specific variables for multi-company support, and system parameters in `zpara` table. Configuration is primarily file-based with some hardcoded values, making it less flexible than modern configuration management approaches.



