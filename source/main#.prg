set century on
set delete on
set safety off
set talk off
set exclusive off
set exact on
_SCREEN.CAPTION="Trading Management System"
_SCREEN.WINDOWSTATE=2
_SCREEN.PICTURE="FANTASTIC3.BMP"
set date british
*if date() < {15/05/1999}
*   DO FORM ILOGON
*else
*   DO FORM ZEXPIRE
*   CLOSE TABLE ALL
*   RENAME MDSTBTOR.DBF TO ZDSTBTOR.DBF
*endif
if file("c:\cwin95\system\control.ctl")=.T. .OR.;
   file("c:\cwin98\system\control.ctl")=.T. .OR.;
   file("c:\windows\system\control.ctl")=.T. .or.;
   file("c:\cwindows\system\control.ctl")=.T.
   DO FORM ILOGON
ELSE
   DO FORM ZEXPIRE
   CLOSE TABLE ALL
ENDIF 


read event
