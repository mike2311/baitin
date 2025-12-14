*public w_i 
*w_i = .t.
public _TOTAL_PAGE, _Calculate_Page

_TOTAL_PAGE = 0

_Calculate_Page = .T.
report form pcontract to file pcontract.tmp prompt noconsole
 
_Calculate_Page = .F.
*if w_i = .t.
	report form pcontract  preview noconsole
*	report form pcontract  TO FILE TESTFILE ASCII noconsole
*else
*	report form pcontract to preview noconsole
*endif

rele _TOTAL_PAGE, _Calculate_Page
*delete file porderconf.tmp

function count_page

	if _Calculate_Page
		_TOTAL_PAGE = _TOTAL_PAGE + 1
	endif