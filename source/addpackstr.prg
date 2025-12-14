function addpackstr(w_str)
local  w_line, w_char,w_line_no
local i


w_line = ""
w_line1 = ""
w_line_no = 1
i = 1
do while i <= len(w_str)
	w_char = substr(w_str,i, 1)
	do while w_char <> chr(10) and i <= len(w_str)
		w_line = w_line+substr(w_str,i,1)
		i = i +1
		w_char = substr(w_str,i, 1)
	enddo
	if w_line_no = 1
		w_line1 = "Packing : "+alltrim(w_line)+chr(10)
		w_line_no = w_line_no + 1
	else
		w_line1 = w_line1 + "          "+alltrim(w_line)+chr(10)
	endif
	w_line = ""
	i = i +1
enddo
if empty(w_line1)
	return ""
else
	return w_line1
endif