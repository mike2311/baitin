function conmonth(cha)
	public c_i
	cha = alltrim(cha)
	cha = substr(cha, 1 ,3 )
	cha = upper(cha)
	c_i = 0
	
	do case
		case cha = "JAN"
			C_I = "1"
		case cha = "FEB"
			C_I = "2"
		case cha = "MAR"
			C_I = "3"
		case cha = "APR"
			C_I = "4"
		case cha = "MAY"
			C_I = "5"
		case cha = "JUN"
			C_I = "6"
		case cha = "JUL"
			C_I = "7"
		case cha = "AUG"
			C_I = "8"
		case cha = "SEP"
			C_I = "9"
		case cha = "OCT"
			C_I = "10"
		case cha = "NOV"
			C_I = "11"
		case cha = "DEC"
			C_I = "12"			
	endcase
	RETURN C_I
