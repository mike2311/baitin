function cutzero(a)
*a = 101001.20
public i, j,w_char,w_str
i = 1
w_char = alltrim(str(a,15,5))
j = len(w_char)
w_str = substr(w_char,len(w_char),1)

do while i <= j and w_str == "0"
	w_str = substr(w_char,len(w_char),1)
	if w_str == "0"
		if substr(w_char,len(w_char) - 1,1) <> "."
			w_char = substr(w_char,1,len(w_char) - 1)
		else
			w_char = substr(w_char,1,len(w_char) - 2)
		endif
	endif
	i = i + 1
enddo
w_str = "abc"
i = 1
if a > 1000
	do while substr(w_char,i,1) != "." and i < len(w_char)
		 i = i+1
	enddo
	private w_char1, w_char2
	w_char1 = substr(w_char,1,i - 1)
	w_char2 = substr(w_char,i)

	i = 3
	j = 4
	do while i < len(w_char1)
		j = len(w_char1) - i
		i = i + 3
	enddo
	i = 1

	do while i <= len(w_char1) and j < len(w_char1)
		w_char1 = substr(w_char1,1,j) + "," + substr(w_char1,j+1)
		j = j+ 3 +1
	enddo
	
	w_char = w_char1 + w_char2
endif
*messagebox(w_char)
return alltrim(w_char)
