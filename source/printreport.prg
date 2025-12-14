function printreport(w_i, w_report_name)
*w_report_name = "pinv"
*w_i = .f.
public _TOTAL_PAGE, _Calculate_Page

_TOTAL_PAGE = 0

_Calculate_Page = .T.
report form &w_report_name to file &w_report_name.tmp prompt noconsole
* messagebox(alltrim(str(_TOTAL_PAGE)))
_Calculate_Page = .F.
if w_i = .t.
	report form &w_report_name to printer prompt  noconsole
else
	report form &w_report_name preview noconsole
endif

delete file &w_report_name.tmp

rele _TOTAL_PAGE, _Calculate_Page
function count_page

	if _Calculate_Page
		_TOTAL_PAGE = _TOTAL_PAGE + 1
	endif