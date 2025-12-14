public _TOTAL_PAGE, _Calculate_Page

_TOTAL_PAGE = 0

_Calculate_Page = .T.
report form porderconf to file porderconf.tmp noconsole

_Calculate_Page = .F.
*report form 70-1 to printer noconsole
report form porderconf preview noconsole

rele _TOTAL_PAGE, _Calculate_Page
*delete file porderconf.tmp

function count_page

	if _Calculate_Page
		_TOTAL_PAGE = _TOTAL_PAGE + 1
	endif