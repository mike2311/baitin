function countpage()

	if _Calculate_Page = .t. or nvl(_Calculate_Page,"Error") = "Error"
		_TOTAL_PAGE = _TOTAL_PAGE + 1
	endif