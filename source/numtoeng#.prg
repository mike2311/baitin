Function NUMTOENG(w_num)
public w_char, i
public w_cint , w_cfloat
*w_num = 16252.8
i =1

w_char = alltrim(str(w_num, 15,2))
i = at('.', w_char)
w_cint =  substr (w_char, 1,i-1 )
w_cfloat = substr (w_char, i+1 )
IF val(w_cfloat) > 1
	w_cint = numlongform(val(w_cint))
	w_cfloat = numlongform(val(w_cfloat))
	w_char = w_cint+ " DOLLARS"+" AND "+w_cfloat+" CENTS"
ELSE
	w_cint = numlongform(val(w_cint))
	w_char = w_cint+ " DOLLARS"
	
ENDIF
*messagebox(w_char)
RETURN w_char
