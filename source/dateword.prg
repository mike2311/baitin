function dateword(fr_date, to_date)
	local cRvar
	cRvar = ""	
	if empty(fr_date) and empty(to_date)
		return ""
	endif
	if TYPE( 'fr_date')  <> "D" and !empty(fr_date)
		if TYPE( "fr_date") = "C"
			messagebox("#"+alltrim(fr_date)+"# Invalid Date Format!",16,"System Message!")
		endif
		return cRvar
	endif
	
	
	if TYPE( "to_date")  <> "D" and !empty(to_date)
		if TYPE( "to_date") = "C"
			messagebox("#"+alltrim(to_date)+"# Invalid Date Format!",16,"System Message!")
		endif
		return cRvar
	endif
	
	if empty(fr_date) and !empty(to_date)
		cRvar = alltrim(emonth(to_date)) +" "+alltrim(str(day(to_date)));
			+", "+alltrim(str(year(to_date)))
		return cRvar
	endif
	
	if !empty(fr_date) and empty(to_date)
		cRvar = alltrim(emonth(fr_date)) +" "+alltrim(str(day(fr_date)));
			+", "+alltrim(str(year(fr_date)))
		return cRvar
	endif
	
	do case 
		case fr_date = to_date and !empty(fr_date)
			cRvar = alltrim(emonth(fr_date)) +" "+alltrim(str(day(fr_date)));
				+", "+alltrim(str(year(fr_date)))
		case year(fr_date) = year(to_date) and month(fr_date) <> month(to_date)
			cRvar = alltrim(emonth(fr_date))+ " " + alltrim(str(day(fr_date)))+ " To "+;
				alltrim(emonth(to_date))+ " " + alltrim(str(day(to_date)))+ ", "+alltrim(str(year(fr_date)))
		case year(fr_date) = year(to_date) and month(fr_date) = month(to_date)
			cRvar = alltrim(emonth(fr_date))+" "+alltrim(str(day(fr_date)))+" - " +alltrim(str(day(to_date)));
				+", " +alltrim(str(year(fr_date)))
		case year(fr_date) <> year(to_date) 
		**and month(fr_date) <> month(to_date) and day(fr_date) <> day(to_date)
			cRvar = alltrim(emonth(fr_date))+" "+alltrim(str(day(fr_date)))+", " +alltrim(str(year(fr_date)));
			+" - "+ alltrim(emonth(to_date))+" "+alltrim(str(day(to_date)))+", " +alltrim(str(year(to_date)))

		otherwise
			cRvar = ""
	endcase
	
	return alltrim(cRvar)