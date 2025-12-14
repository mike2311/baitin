
clear all
Public M,User_right, w_shop_no, w_shop_name, sysUserId, syswork, w_sys_language
IF !Directory("C:\Batwork")
    Md("C:\Batwork")
Endif
w_sys_language= "E"
Set hour To 24
public w_password 
*SET DEFAULT TO C:\BAITIN
SET TALK OFF
SET DELETE ON
SET SAFETY OFF
SET STATUS  BAR OFF
SET CENTURY ON
set century on
set delete on
set date mdy
set path to c:\batwork
set exclusive off
SET ENGINEBEHAVIOR 70
_SCREEN.CAPTION="Trading Management System - V3.0 July 9, 2025) "
_SCREEN.WINDOWSTATE=2
*DO a.prg
 DO FORM ILOGON
 IF M = .T.    
    IF Upper(User_right) = "SUPERVISOR"
     	_screen.Caption= _screen.Caption + "   (¨Date : " + DTOC(gettoday()) +")"
	DO BATMENUS.MPX         	
    ELSE
    	_screen.Caption= _screen.Caption + "   (¨Date: " + DTOC(gettoday()) + ")"
	DO BATMENU.MPX        	
    Endif  

syswork="c:\"+alltrim(sysuserid)+"work"

_screen.Caption=_screen.Caption+ "   "+alltrim(sysuserid)

if !directory(syswork)
   md &syswork
endif   

set path to c:\batwork, &syswork  	
  Set Sysmenu On  
  On Shutdown Quit     

  Read Event
ELSE
   Cancel
ENDIF

 




