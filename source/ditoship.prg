function ditoship(X, Y)
local head_char, sec_char,  line_cnt, line_br1, line_br2, head_str, compare1, cpompare2,i
local a, b
*messagebox(X+chr(10)+Y)
*clear
*select *from temp_ship into cursor t
head_char = X
sec_char = Y
*select t
*skip
i=0
*head_char = t.ship_mark
sec_str = head_char

line_br1 = 0
line_br2 = 0
head_str= ""
sec_str = ""
cnt_of_chr = 1

*select t
**skip
*sec_char = t.ship_mark

b = sec_char
line_cnt = 0

do while i<= len(sec_char)
	if substr(sec_char, i, 1) = chr(10)
		line_cnt = line_cnt + 1
	endif
	i = i + 1
enddo
j = 1
i = 1
compare1 = ""
compare2 = ""
do while len(head_char) > 0 and len(sec_char) > 0
	line_br1 = at(chr(10), head_char, 1)
	line_br2 = at(chr(10), sec_char,1)
	if line_br1 = 0 and line_br2 = 0
		if alltrim(substr(head_char, i)) == "" and alltrim(substr(sec_char, j)) <> ""
			sec_str = sec_str  + sec_char
		endif
	else
	 	compare1 = substr(head_char, 1 , line_br1)
		compare2 = substr(sec_char, 1 , line_br2)
*		?"..........1"+ compare1
*		?"..........2" + compare2
		head_char = substr(head_char,  line_br1+ 1)
		sec_char = substr(sec_char,  line_br2+ 1)
		if alltrim(compare1) == alltrim(compare2)
			if atstr(compare2) = 1
				sec_str = sec_str + compare2
			endif
		else
			sec_str = sec_str + compare2
		endif
	endif
enddo
sec_str = "   -DO-  " +chr(10)+sec_str
*messagebox(sec_str)
return sec_str


function atstr(w_para)
	local w_return, x
	x = ""
	x = alltrim(upper(w_para))
	w_return = 0
	do case 
		case at("PCS", x) > 0
		 	w_return = 1
		case at("ITEM", x) > 0
		 	w_return = 1
		case at("SKU", x) > 0
		 	w_return = 1
		case at("SKN", x) > 0
		 	w_return = 1
		case at("QTY", x) > 0
		 	w_return = 1
		case at("CTN", x) > 0
		 	w_return = 1
		case at("INNER PACK", x) > 0
		 	w_return = 1
		case at("C/NO", x) > 0
		 	w_return = 1
		case at("QUANTITY", x) > 0
		 	w_return = 1
		otherwise
			w_return = 0
	endcase
	
	return w_return