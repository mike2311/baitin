function cutRemark(strDesp, strCut)
	if empty(strDesp)
		return ""
	endif
	
	if empty(strCut)
		strCut = ""
	endif
	 rtn_value = ""
	intLineNo = ATline(strCut,strDesp)
	
	for i = 1 to intLineNo - 1
		if i = 1
			rtn_value = mline(strDesp,i)
		else
			rtn_value = rtn_value + Chr(10) + mline(strDesp,i)
		endif
	endfor
	
	return rtn_value
end func
