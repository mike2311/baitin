close table all
IF USED("BAITIN!mshipmark ")
	
ELSE 
	USE BAITIN!mshipmark IN 0 exclusive
ENDIF
SELECT mshipmark 
ZAP
public temp_var, w_cust_no, w_port, i , x, j 
j = .f.
IF USED("CUS")
	SELECT CUS
ELSE 
	USE CUS IN 0 exclusive
ENDIF

select * from cus where C_cname = "CUSTOMER" or c_cname = "TRADING" order by c_no;
INTO CURSOR CUS_CUSTOR

SELECT CUS_CUSTOR
DO WHILE !EOF()
	i = 1
	j = .t.
	do while i <= len(alltrim(cus_custor.c_no)) and j = .t.
		x = substr(alltrim(cus_custor.c_no), i, 1)
		if x = "-"
			j = .f.
		else
			i = i +1
		endif
	enddo
	if i >=  len(alltrim(cus_custor.c_no)) 
		w_cust_no = alltrim(cus_custor.c_no)
		w_port = ""
	else
		w_cust_no = substr(alltrim(cus_custor.c_no), 1,i-1)
		w_port = substr(alltrim(cus_custor.c_no), i+1)
	endif
	SELECT mshipmark
	APPEND BLANK
	
	REPLACE Mshipmark.cust_no WITH w_cust_no
	REPLACE Mshipmark.port WITH w_port
	temp_var = CHARCON(charcon(CUS_CUSTOR.M11,CUS_CUSTOR.M12,CUS_CUSTOR.M13,CUS_CUSTOR.M14),;
		charcon(CUS_CUSTOR.M15,CUS_CUSTOR.M16,CUS_CUSTOR.M17,CUS_CUSTOR.M18),;
			charcon(CUS_CUSTOR.M19,CUS_CUSTOR.M20,CUS_CUSTOR.M21,CUS_CUSTOR.M22),;
				charcon(CUS_CUSTOR.M23,CUS_CUSTOR.M24,CUS_CUSTOR.M25,CUS_CUSTOR.M26))

	REPLACE Mshipmark.SHIPMARK WITH TEMP_VAR
	
	SELECT CUS_CUSTOR
	SKIP
ENDDO

clear all
