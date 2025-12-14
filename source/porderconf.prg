*function porderconf(w_i)
w_i = .f.
public _TOTAL_PAGE, _Calculate_Page

_TOTAL_PAGE = 0

_Calculate_Page = .T.
report form porderconf to file porderconf.tmp prompt noconsole
 
_Calculate_Page = .F.
if w_i = .t.
	report form porderconf to printer noconsole
else
	report form porderconf preview noconsole
endif

rele _TOTAL_PAGE, _Calculate_Page
delete file porderconf.tmp

function count_page

	if _Calculate_Page
		_TOTAL_PAGE = _TOTAL_PAGE + 1
	endif