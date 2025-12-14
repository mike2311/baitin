function numtostr(w_num, w_place)
local  w_lenofint
w_num = round(w_num, w_place)

w_lenofint = 10
*w_place = 2
*w_num = 919999.23
public w_char, w_float, w_int,w_num_status
if w_num >= 0
	w_num_status = ""
else
	w_num_status = "-"
endif
w_num = abs(w_num)
w_char = ""
w_char = alltrim(str(w_num,w_lenofint,w_place))
w_dec_pos = at(".",w_char)
*w_int = left(w_char, len(w_char) - w_place - 1)
w_int = left(w_char,w_dec_pos - 1)
*w_float = right(w_char, w_place)
w_float = right(w_char, len(alltrim(w_char))-w_dec_pos)
if len(w_float)<w_place
    w_float = alltrim(w_float)+REPLICATE("0", w_place-len(w_float))
endif    

do case 
	case len(w_int) <= 3
		w_return = w_int +"." + w_float
	case len(w_int) > 3
		w_return = fun(w_int)+"."+w_float
endcase 
w_return = w_num_status+w_return
return w_return

function fun(w_pl)
	w_pl = alltrim(w_pl)
	local w_str1,w_str2 , i
	w_str1 = ""
	w_str2 = ""
	i = 1
	if len(w_pl) >3
		w_str1 = ","+right (w_pl, 3)
		w_pl = fun(left(w_pl, len(w_pl)-3))
		w_str2 = w_pl  + w_str1
	else
		return w_pl
	endif
	
	return w_str2
	
	
