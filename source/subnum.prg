FUNCTION subnum(CHR1)
	PUBLIC cha1,CHECK_IN_INLIST,returnchar,j
	cha1 = alltrim(CHR1)

	if !empty(cha1)

		CHECK_IN_INLIST = inlist( left(cha1, 1),  "0","1","2","3","4","5","6","7","8","9")

		if CHECK_IN_INLIST
			J = at_c(" ", alltrim(cha1))
			returnchar = left(cha1, J)
			j = val(alltrim(returnchar))
		else
			j = 0
		endif
		
	ELSE 
		j=0
	endif
	return J
		release chr1, cha1, CHECK_IN_INLIST,returnchar,j