function addspace(w_space,w_remark)
	local i,j,w_len,w_str
	w_str = ""
	w_len = len(w_remark)
	j = 0
	i = memline(w_remark)
	if i <0
		return ""
	endif
	w_str = space(w_space)
	do while j<w_len
		w_str = w_str + substr(w_remark,j,1)
		if substr(w_remark,j,1) = chr(10)
			w_str = w_str+space(w_space)
		endif		
		j = j + 1
	enddo

	return rtrim(w_str)