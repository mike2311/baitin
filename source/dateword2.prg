function dateword2(fr_date, to_date)
	
	do case
		case !empty(fr_date) and !empty(to_date) and fr_date < to_date
			return alltrim(dtoc(fr_date))+" - " + alltrim(dtoc(to_date))
			
		case !empty(fr_date) and !empty(to_date) and fr_date = to_date
			return alltrim(dtoc(fr_date))
			
		case !empty(fr_date) and empty(to_date) 
			return alltrim(dtoc(fr_date))
			
		case empty(fr_date) and !empty(to_date) 
			return alltrim(dtoc(to_date))
		
		otherwise
			return ""
		
	endcase