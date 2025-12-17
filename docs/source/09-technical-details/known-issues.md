# Known Issues

## Errors from baitin.ERR

### Program Errors

**pso.prg:**
- Report TEMP - Undefined
- **Impact:** SO printing may fail if TEMP report missing
- **Resolution:** Ensure TEMP report exists or fix reference

### Menu Errors

**batmenu.mnx / batmenus.mnx:**
- Form IPURUNIT - Undefined
- Form ISETCONT@@_TEST - Undefined
- Form PCONFIRM_PDF - Undefined
- **Impact:** Menu items may not work if forms missing
- **Resolution:** Create missing forms or remove menu items

### Form Errors

**pcontamdrmk.scx:**
- Unknown MEMOARRAY - Undefined
- **Impact:** Contract amendment form may not work
- **Resolution:** Fix MEMOARRAY reference or use alternative

**ioe1@_backup.scx:**
- Form IOE2@ - Undefined
- **Impact:** Backup form references missing form
- **Resolution:** Create IOE2@ form or remove reference

**pdebitnote.scx:**
- Report PDEBITNOTE_ND_MS - Undefined
- Report PDEBITNOTE_ND - Undefined
- **Impact:** Debit note printing may fail
- **Resolution:** Create missing reports or fix references

### Visual Class Library Errors

**common.vcx:**
- Form ADDCOUNTRY - Undefined
- **Impact:** Common class library incomplete
- **Resolution:** Create missing form or remove reference

## Missing Forms/Reports

### Forms Referenced but Not Found
- `ipurunit` - Purchase Unit form (referenced in menu)
- `isetcont@@_test` - Contract test form (referenced in menu)
- `pconfirm_pdf` - OC PDF form (referenced in menu)
- `ioe2@` - OE form (referenced by backup)

### Reports Referenced but Not Found
- `TEMP` - Temporary report (referenced in pso.prg)
- `PDEBITNOTE_ND_MS` - Debit note report variant
- `PDEBITNOTE_ND` - Debit note report variant

## Undefined Dependencies

### Form Dependencies
- Some forms reference other forms that may not exist
- Backup forms reference original forms
- Test forms may be missing

### Report Dependencies
- Some programs reference reports that may not exist
- Report variants may be missing
- Temporary reports may not be created

## Potential Data Integrity Issues

### No Foreign Key Constraints
- **Risk:** Orphaned records possible
- **Example:** Detail records without headers
- **Mitigation:** Application-level validation required

### Manual Relationships
- **Risk:** Invalid references possible
- **Example:** Invalid customer/item codes
- **Mitigation:** Validation in code

### No Transactions
- **Risk:** Partial updates possible
- **Example:** Header created but details fail
- **Mitigation:** Manual rollback or data recovery

### Index Corruption
- **Risk:** Slow queries, incorrect results
- **Symptom:** "Index not found" errors
- **Mitigation:** Regular reindexing via `zdoc.prg`

## File System Issues

### Large File Sizes
- **Issue:** Some tables exceed 100MB
- **Impact:** Slow performance, backup challenges
- **Tables:** `mso.dbf` (279MB), `minvdt.dbf` (123MB), `moe.dbf` (102MB)

### Large Memo Files
- **Issue:** Some FPT files exceed 100MB
- **Impact:** Slow memo field access
- **Files:** `minvdt.FPT` (178MB), `mso.FPT` (131MB), `mcontdt.FPT` (75MB)

### Network File Share Performance
- **Issue:** Large files on network shares
- **Impact:** Slow multi-user access
- **Mitigation:** Local caching or file server optimization

## Concurrency Issues

### File Locking
- **Issue:** Record or file-level locking only
- **Risk:** Conflicts in multi-user scenarios
- **Impact:** Users may be blocked during operations

### Exclusive Access Requirements
- **Issue:** Some operations require exclusive access
- **Impact:** Other users cannot access during reindexing
- **Operations:** Reindexing, data conversion, bulk imports

## Data Quality Issues

### Inconsistent Data
- **Risk:** Data entered incorrectly
- **Example:** Invalid dates, negative quantities
- **Mitigation:** Validation rules in code

### Missing Required Fields
- **Risk:** Incomplete records
- **Example:** Missing customer codes, item numbers
- **Mitigation:** Required field validation

### Duplicate Records
- **Risk:** Duplicate OE, OC, Invoice numbers
- **Mitigation:** Unique key validation (manual)

## Performance Issues

### Large Table Scans
- **Issue:** Some queries scan large tables
- **Impact:** Slow response times
- **Mitigation:** Proper indexing, query optimization

### Memo Field Searches
- **Issue:** Memo fields require full table scan
- **Impact:** Slow searches on descriptions/remarks
- **Mitigation:** Limit memo field searches

### Network Latency
- **Issue:** Network file share access
- **Impact:** Slow operations over network
- **Mitigation:** Local file access or faster network

## Configuration Issues

### Hardcoded Paths
- **Issue:** Paths hardcoded in code
- **Example:** `C:\batwork`, `C:\<userid>work`
- **Impact:** Difficult to relocate
- **Mitigation:** Use configuration files

### Company Configuration
- **Issue:** Company codes hardcoded in `a.prg`
- **Impact:** Difficult to add new companies
- **Mitigation:** Use configuration table

## Security Issues

### Password Storage
- **Issue:** Passwords likely stored in plain text
- **Risk:** Security vulnerability
- **Mitigation:** Encrypt passwords

### No Session Timeout
- **Issue:** Sessions last until logout
- **Risk:** Unauthorized access if user leaves
- **Mitigation:** Implement session timeout

### Limited Audit Logging
- **Issue:** Limited activity tracking
- **Risk:** Difficult to track changes
- **Mitigation:** Enhanced audit logging

## Migration Considerations

### Legacy Data
- **Issue:** Legacy tables in subdirectories
- **Impact:** Data organization unclear
- **Mitigation:** Consolidate or archive

### Backup Tables
- **Issue:** Multiple backup versions
- **Impact:** Confusion about current data
- **Mitigation:** Archive old backups

### Dynamic Table Names
- **Issue:** Tables with `&` prefix (runtime-generated)
- **Impact:** Difficult to track
- **Mitigation:** Document naming patterns

## Summary

The system has several known issues including missing forms/reports, undefined dependencies, potential data integrity risks, and performance concerns. Most issues are manageable with proper maintenance and validation, but should be addressed during modernization. The lack of foreign key constraints and transaction support are the most significant architectural limitations.



