# Authentication

## Overview

The system uses form-based authentication with password validation. Users log in through the `ilogon` form, and authentication status determines menu access.

## Login Process

### Login Form

**Form:** `ilogon.scx` (ILOGON)

**Process:**
1. User enters credentials
2. System validates against `user` table
3. Sets `User_right` (SUPERVISOR/REGULAR_USER)
4. Sets `sysUserId` (user ID)
5. Returns `M = .T.` if successful

**Code Reference:** `main.prg` (lines 25-26)

### Authentication Flow

```mermaid
graph TD
    Start([User Opens Application]) --> LoginForm[ILOGON Form]
    LoginForm --> EnterCreds[Enter Username/Password]
    EnterCreds --> Validate{Validate Credentials}
    Validate -->|Invalid| Reject[Login Rejected<br/>M = .F.]
    Validate -->|Valid| SetVars[Set Variables<br/>User_right<br/>sysUserId]
    SetVars --> CheckRole{Check User_right}
    CheckRole -->|SUPERVISOR| LoadSupervisor[BATMENUS.MPX]
    CheckRole -->|REGULAR| LoadRegular[BATMENU.MPX]
    LoadSupervisor --> MainApp[Main Application]
    LoadRegular --> MainApp
    Reject --> Cancel[Cancel/Exit]
```

## Password Handling

### Storage

**Table:** `user.DBF`

**Field:** `password` (likely plain text)

**Security:** No encryption evident in code

### Validation

**Process:**
1. User enters password
2. System looks up user in `user` table
3. Compares entered password with stored password
4. Validates user is active

## Session Management

### Session Variables

**Set During Login:**
- `M` - Authentication status (.T. = authenticated)
- `User_right` - User role (SUPERVISOR/REGULAR_USER)
- `sysUserId` - User ID
- `w_password` - Company password (may be separate)

**Code Reference:** `main.prg` (lines 3, 9, 26-27)

### Session Duration

**Lifetime:** Until logout or application close

**No Timeout:** Sessions do not expire automatically

**Logout:** User must explicitly logout

### Session Validation

**Check:** `IF M = .T.` before loading menu

**If Not Authenticated:** Application cancels/exits

**Code Reference:** `main.prg` (line 26)

## User Identification

### sysUserId

**Purpose:** Identify current user

**Usage:**
- Audit trails (`user_id`, `cre_user` fields)
- User-specific working directories
- Display in screen caption

**Setting:**
```foxpro
syswork="c:\"+alltrim(sysuserid)+"work"
_screen.Caption=_screen.Caption+ "   "+alltrim(sysuserid)
```

**Code Reference:** `main.prg` (lines 35, 37)

## Company Context

### Company Password

**Variable:** `w_password`

**Purpose:** Determines company context

**Values:**
- "HT" - Holiday Times
- "BAT" - Baitin Trading
- "INSP" - InSpirt Designs
- "HFW" - Holiday Funworld

**Setting:** May be set during login or hardcoded

**Code Reference:** `a.prg` (lines 16-32), `uoexls_2013.prg` (lines 145-147)

## Logout Process

### Logout Function

**Menu:** LogOut (ALT+L)

**Process:**
1. Confirmation message: "Logout?"
2. If confirmed:
   - Clear all variables
   - Close database
   - Close all files
   - Reset system menu
   - Clear screen
   - Return to login (`do main`)

**Code Reference:** `BATMENUS.MPR` (lines 416-428)

### Exit Function

**Menu:** Exit (ALT+E)

**Process:**
1. Confirmation message: "Quit?"
2. If confirmed:
   - Clear read all
   - Close database
   - Close all files
   - Clear events
   - Reset system menu
   - Clear screen
   - Exit application

**Code Reference:** `BATMENUS.MPR` (lines 445-457)

## Security Limitations

### Password Storage

**Issue:** Passwords likely stored in plain text

**Risk:** Security vulnerability if database accessed

**Mitigation:** Encrypt passwords in modernization

### No Session Timeout

**Issue:** Sessions last until logout

**Risk:** Unauthorized access if user leaves workstation

**Mitigation:** Implement session timeout

### No Password Policy

**Issue:** No password complexity requirements

**Risk:** Weak passwords

**Mitigation:** Implement password policy

### No Account Lockout

**Issue:** No lockout after failed attempts

**Risk:** Brute force attacks possible

**Mitigation:** Implement account lockout

## User Table Structure

### Inferred Fields

- `user_id` - User ID (Primary Key)
- `password` - Password (plain text)
- `user_name` - User name
- `user_right` - User rights (SUPERVISOR/REGULAR_USER)
- `active` - Active flag (if exists)

### User Management

**Form:** `iuser` (Input User Account)

**Access:** SUPERVISOR only

**Purpose:** Create/edit user accounts

## Authentication Code Flow

### Main Entry Point

```foxpro
DO FORM ILOGON
IF M = .T.    
    IF Upper(User_right) = "SUPERVISOR"
        DO BATMENUS.MPX        	
    ELSE
        DO BATMENU.MPX        	
    Endif  
    Read Event
ELSE
   Cancel
ENDIF
```

**Code Reference:** `main.prg` (lines 25-50)

## Summary

The authentication system uses form-based login with password validation. It sets user roles and company context, but has security limitations including plain text passwords and no session timeout. The system relies on application-level security rather than database-level security.



