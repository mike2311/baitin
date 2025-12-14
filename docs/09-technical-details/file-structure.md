# File Structure

## Source Code Organization

### Directory Structure

```
source/
├── *.prg          # Program files (176+)
├── *.scx          # Form files (195+)
├── *.sct          # Form memo files
├── *.frx          # Report files (116+)
├── *.frt          # Report memo files
├── *.mnx          # Menu files
├── *.mpr          # Compiled menu files
├── *.dbf          # Database tables (186)
├── *.cdx          # Index files
├── *.fpt          # Memo files
├── *.pjx          # Project file
├── *.pjt          # Project memo file
└── VICwork/       # User-specific work directory
```

## File Types

### Source Code Files

**Programs (.prg):**
- Business logic
- Data processing
- Utilities
- 176+ files

**Forms (.scx/.sct):**
- User interfaces
- Form definitions (.scx)
- Form code (.sct)
- 195+ forms

**Menus (.mnx/.mpr):**
- Menu definitions (.mnx)
- Compiled menus (.mpr)
- 6+ menu files

**Reports (.frx/.frt):**
- Report definitions (.frx)
- Report code (.frt)
- 116+ reports

### Database Files

**Tables (.dbf):**
- Data storage
- 186 tables
- Fixed-width records

**Indexes (.cdx):**
- Compound indexes
- One per table
- Multiple index tags

**Memos (.fpt):**
- Memo field storage
- One per table with memos
- Variable length

### Project Files

**Project (.pjx/.pjt):**
- `baitin.pjx` - Project file
- `BAITIN.PjT` - Project memo file
- Contains file references

## File Locations

### Working Directories

**Shared Directory:**
- `C:\batwork` - Shared working directory
- Database files
- Reports
- Temporary files

**User Directory:**
- `C:\<userid>work` - Per-user directory
- User-specific temporary files
- User exports

### Source Directory

**Location:** `source/` (relative to project root)

**Contents:**
- All source code files
- Database files (in production)
- Report files
- Form files

## File Naming Conventions

### Programs

- **Business Logic:** Descriptive names (e.g., `uoexls_2013.prg`)
- **Utilities:** `z` prefix (e.g., `zdoc.prg`)
- **Data Import:** `x` prefix (e.g., `xitem.prg`)
- **Data Export:** `u` prefix for some (e.g., `uwalexls.prg`)

### Forms

- **Input:** `i` prefix (e.g., `iitem.scx`)
- **Print:** `p` prefix (e.g., `pinv@.scx`)
- **Enquiry:** `e` prefix (e.g., `einvoice.scx`)
- **Setup:** `iset` prefix (e.g., `isetso.scx`)

### Tables

- **Master/Transaction:** `m` prefix (e.g., `mitem.dbf`)
- **Reference:** `z` prefix (e.g., `zstdcode.dbf`)
- **Work:** `w` prefix (e.g., `woexls.dbf`)
- **View:** `v` prefix (e.g., `voe1.dbf`)

## File Sizes

### Large Files

**Database Tables:**
- `mso.dbf` - 279MB
- `minvdt.dbf` - 123MB
- `moe.dbf` - 102MB
- `mcontdt.dbf` - 47MB

**Memo Files:**
- `minvdt.FPT` - 178MB
- `mso.FPT` - 131MB
- `mcontdt.FPT` - 75MB
- `morddt.FPT` - 77MB

**Programs:**
- `uoexls_2013.prg` - 1,747 lines (largest)

## File Relationships

### Form to Program

- Forms call programs
- Programs called via `DO` command
- Example: `do form iitem` calls `iitem.scx`

### Program to Table

- Programs access tables
- Tables opened via `USE` command
- Example: `use baitin!mitem in 0`

### Report to Table

- Reports read from tables
- Tables specified in report definition
- Reports generated via `REPORT FORM` command

## Backup Files

### Backup Naming

- **`#` suffix:** Backup versions (e.g., `mitem#.dbf`)
- **Date suffix:** Historical versions (e.g., `mconthd_20130315.dbf`)
- **`_複製` suffix:** Copy/backup (Chinese, e.g., `moe_20230705 - 複製.dbf`)

### Backup Locations

- Some backups in `source/` directory
- Some in subdirectories (e.g., `data_2-12-18/`, `revised_data_20180503/`)

## Summary

The file structure follows Visual FoxPro conventions with programs, forms, reports, and database files organized in the source directory. Files follow naming conventions and are organized by function. Large files (especially database and memo files) require attention for performance and backup.



