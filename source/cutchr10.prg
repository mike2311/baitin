function cutchr10(w_remark)
*¥¢±Ñ
	w_remark = rtrim(w_remark)
	if empty(w_remark)
		return w_remark 
	else
		local w_len,k
		w_len = len(w_remark)
		do while substr(w_remark,w_len) = chr(10) or substr(w_remark,w_len) = " "
			w_remark = substr(w_remark,0,w_len-1)
			w_len = len(w_remark)
*			messagebox("test"+substr(w_remark,w_len)+"test")
		enddo
		return w_remark
		
	endif