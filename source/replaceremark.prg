function replaceRemark(strRemark)
	strRemark = STRTRAN(strRemark,"!A","")
	strRemark = STRTRAN(strRemark,"!C","")
	strRemark = STRTRAN(strRemark,"!D","")	
	strRemark = STRTRAN(strRemark,"!I","")
	strRemark = STRTRAN(strRemark,"!M","")
	strRemark = STRTRAN(strRemark,"!O","")
	strRemark = STRTRAN(strRemark,"!P","")
	strRemark = STRTRAN(strRemark,"!S","")					
	
	return strRemark
endfunc
