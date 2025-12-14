FUNCTION CHARCON2packing(CHR1, CHR2, CHR3, CHR4, CHR5)
	local C1,C2,C3,C4, i 
	i = .f.
	CHR5=""
	
	IF EMPTY(CHR1)
		CHR1=""
		C1=0
	ELSE
		C1=1
	ENDIF
	CHR1 = IIF(C1=1, "           "+alltrim(CHR1)+CHR(10), ALLTRIM(CHR1))
*	messagebox("x "+chr1+" x")

	IF EMPTY(CHR2)
		CHR2=""
		C2=0
	ELSE
		C2=1
	ENDIF
	CHR2 = IIF(C2=1, "           "+alltrim(CHR2)+CHR(10), ALLTRIM(CHR2))
*	messagebox("x "+chr2+" x")
	
	IF EMPTY(CHR3)
		CHR3=""
		C3=0
	ELSE
		C3=1
	ENDIF
	CHR3 = IIF(C3=1,"           "+alltrim(CHR3)+CHR(10), ALLTRIM(CHR3))
*	messagebox("x "+chr3+" x")
	
	IF EMPTY(CHR4)
		CHR4=""
		C4=0
	ELSE
		C4=1
	ENDIF
	CHR4 = IIF(C4=1,"           "+alltrim(CHR4)+CHR(10), ALLTRIM(CHR4))
*	messagebox("x "+chr4+" x")
	
	CHR5 = "Packing :  "+alltrim(CHR1+CHR2+CHR3+CHR4)

	RETURN CHR5