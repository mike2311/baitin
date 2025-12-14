Function NUMTOENG(w_num)
public fw_char, i
public w_cint , w_cfloat
*w_num = 1700.01
i =1
fw_char = alltrim(str(w_num, 15,2))
i = at('.', fw_char)
w_cint =  substr (fw_char, 1,i-1 )
w_cfloat = substr (fw_char, i+1 )
IF val(w_cfloat) >= 1
	w_cint = numlongform2(val(w_cint), "I")
	w_cfloat = numlongform2(val(w_cfloat),"I")
	fw_char = w_cint + " AND CENTS "+w_cfloat
	*fw_char = "DOLLARS "+w_cint+ " AND CENTS "+w_cfloat
ELSE
	w_cint = numlongform2(val(w_cint),"P")
	*fw_char = "DOLLARS "+w_cint
	fw_char = w_cint
ENDIF
*messagebox(fw_char)
RETURN fw_char


Function NUMLONGFORM2(Input, x)

dimension NumberArray1(9)
dimension NumberArray2(9)
dimension NumberArray3(9)

NumberArray1(1) = 'ONE'
NumberArray1(2) = 'TWO'
NumberArray1(3) = 'THREE'
NumberArray1(4) = 'FOUR'
NumberArray1(5) = 'FIVE'
NumberArray1(6) = 'SIX'
NumberArray1(7) = 'SEVEN'
NumberArray1(8) = 'EIGHT'
NumberArray1(9) = 'NINE'
NumberArray3(1) = 'ELEVEN'
NumberArray3(2) = 'TWELVE'
NumberArray3(3) = 'THIRTEEN'
NumberArray3(4) = 'FOURTEEN'
NumberArray3(5) = 'FIFTEEN'
NumberArray3(6) = 'SIXTEEN'
NumberArray3(7) = 'SEVENTEEN'
NumberArray3(8) = 'EIGHTEEN'          
NumberArray3(9) = 'NINETEEN'
NumberArray2(1) = 'TEN'
NumberArray2(2) = 'TWENTY'
NumberArray2(3) = 'THIRTY'
NumberArray2(4) = 'FORTY'
NumberArray2(5) = 'FIFTY'
NumberArray2(6) = 'SIXTY'
NumberArray2(7) = 'SEVENTY'
NumberArray2(8) = 'EIGHTY'
NumberArray2(9) = 'NINETY'



cOutPut = ''
cdecplace = right(str(input,15,2),2)
ctempNo = alltrim(str(INT(Input)))
clenght = len(ctempno)
lAndflag = .F.
IF cdecplace <> '00' and x ="P"
   cOutPut = 'AND ' + cdecplace + '/100 '
*   lAndflag = .T.
endif
for n = 1 to clenght
	If mod(n,3) = 1
		do case
		        case ceiling(n/3) = 2
        			cOutPut = 'THOUSAND ' + cOutPut
			case ceiling(n/3) = 3
				cOutPut = 'MILLION ' + cOutPut
			case ceiling(n/3) = 4
				cOutPut = 'BILLION ' + cOutPut
			endcase
	endif                      
	IF left(right(ctempno,n),1) <> '0'
		If mod(n,3) > 0
			If mod(n,3) = 2 and left(right(ctempno,n),1) = '1' and left(right(ctempno,n-1),1) <> '0'
				cOutPut = NumberArray3(val(left(right(ctempno,n-1),1))) + ' ' + cOutPut
			 else
				IF mod(n,3) = 1 and left(right(ctempno,n + 1),1) = '1' and clenght > n
					cOutPut = cOutPut
				else
					cArrayName = 'NumberArray' + alltrim(str(mod(n,3))) +  '(' + left(right(ctempno,n),1) + ')'
					cOutPut = &carrayname + ' ' + cOutPut
				endif
			endif
		else 
			IF !lAndflag and !empty(cOutPut) and x="P"
				cOutPut = 'AND ' + cOutPut 
				lAndflag = .T.
			endif   
				cOutPut = NumberArray1(val(left(right(ctempno,n),1))) + ' HUNDRED ' + cOutPut
			endif
		endif

endfor

return cOutPut