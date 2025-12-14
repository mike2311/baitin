function condate(w_date)
	private i, j,day_part, mo_part, yea_part
	private w_var
*	public w_date
*	w_date ="JUNE 15, 1997"
	i = 1
	j = 1
	w_date = strtran(w_date, '.'," ")
	w_date = alltrim(w_date) 

	*Cut Year
	w_str=""
	i = at(",", w_date)
	yea_part = substr(w_date, i+1 )
	yea_part = alltrim(yea_part)
	i = 1
	do while  i < len(yea_part)+1
		w_str = w_str + substr(yea_part, i,1)
		i = i + 1
	enddo
	yea_part  = alltrim(w_str)
*	messagebox("x"+yea_part+"x")
	*Cut Month
	w_str = ""
	i=1
	do while at(substr(w_date, i, 1), " .,0123456789")<1
		w_str = w_str + substr(w_date, i,1)
		i = i + 1
	enddo
	mo_part = conmonth(alltrim(w_str))
*	messagebox(mo_part)
	*Cut	 Day
	w_str = ""	
	do while at(substr(w_date, i, 1), "    0123456789")>0	
		w_str = w_str + substr(w_date, i,1)
		i = i + 1
	enddo

	day_part = alltrim(w_str)
	if len(yea_part)<=3
		if yea_part > "5"
			yea_part = "19"+left(yea_part,2)
		else
			yea_part = "20"+left(yea_part,2)
		endif
	endif
	w_str = day_part+"/"+ mo_part +"/"+yea_part
	w_var = ctod(w_str)
	
	release i, j,day_part, mo_part, yea_part,w_str
	return w_var
	