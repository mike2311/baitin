close table all

private w_date, w_mo, w_day, w_yea, w_date_from, w_date_to
public h, w_str, j, w_from_date, w_to_date
public error_data, temp_path
temp_path = alltrim(w_path) +"\"+"cont"
error_data = 0
****
close table all
****
if used( "baitin!mconthd" )
	select mconthd
else 
	use baitin!mconthd in 0 exclusive
endif
select mconthd
zap

if used( "baitin!cont" )
	select cont
else 
	use c:\baitin\cont in 0 exclusive
endif

*select  cn_no as  "cont_no", date, c_no as "vendor_no", shipment, payment, shipto as "ship_to",;
*	cur as "cur_code", rate as "ex_rate", oc_no as "conf_no",;
*	remark1,remark2,remark3,remark4,remark5,remark6;
*	from cont into cursor temp
select * from cont where empty(alltrim(cn_no)) == .f. group by cn_no into cursor cont_c
select cont_c
go top
do while !eof()
	select mconthd
	APPEND BLANK
	replace mconthd.cont_no with cont_c.cn_no
	replace mconthd.conf_no with cont_c.oc_no
	replace mconthd.date with cont_c.date
	replace mconthd.vendor_no with cont_c.c_no 
	replace mconthd.payment with cont_c.payment
	replace mconthd.ship_to with cont_c.shipto
	replace mconthd.CUR_CODE with cont_c.cur
	replace mconthd.ex_rate with cont_c.rate
	replace mconthd.trade_term with charcon(charcon(cont_c.remark1,cont_c.remark2,cont_c.remark3,cont_c.remark4),cont_c.remark5,cont_c.remark6)
	
	w_date = cont_c.shipment
	do Pcondate
	
	select mconthd
	replace mconthd.req_date_fr with w_from_date
	replace mconthd.req_date_to with w_to_date
	
	select cont_c
	skip
enddo
release w_date, w_mo, w_day, w_yea, w_date_from, w_date_to
release h, w_str, j, w_from_date, w_to_date
release error_data

procedure Pcondate
private temp_var1,temp_var2,temp_var3
temp_var3=.f.
temp_var1 = 1
do while temp_var1 < len(w_date)
	if at(substr(w_date,temp_var1,1),"ABCDEFGHIJKLMNOPQRSTUVWXYZ")>0
		temp_var3 = .t.
	endif
	temp_var1=temp_var1+1
enddo
if  at(',',w_date)>0 and temp_var3 = .t. and empty(alltrim(substr(w_date,at(',',w_date)+1))) = .f.
	temp_var3 = .f.
	w_str = ""
	j =0
	h = 0
	w_date = strtran(w_date, '.'," ")
	w_date = alltrim(w_date) 

	j = 1
	do while h<=len(w_date) and  j= 1
		w_str = substr(w_date,h,1)
		if at(w_str, "---") > 0
			j= 0
		endif
		h = h +1
	enddo
	
	if  at('/',w_date)>0
		error_data = error_data+1
	endif

	if j = 0 and at('/',w_date)<1
		j = 1
		h = 1
		do while h<=len(w_date) and  j= 1
			w_str = substr(w_date,h,1)
			if at(w_str, "0123456789") > 0
				j= 0
			endif
			h = h +1
		enddo

		if j = 0
			*cut from_date and to_date
			*Cut Month
			h = at("-", w_date)

			w_date_from = alltrim(substr(w_date,1,h-1))
			w_date_to = alltrim(substr(w_date,h+1))
			w_date_to = alltrim(substr(w_date_to, 1, at(",",w_date_to)-1))

			h=1
			j=0

			do while j = 0 and h <= 3
				if at(substr(w_date_to, h, 1), " 0123456789. ")>0
					j =1
				endif
				h = h+1
			enddo

			if j = 1
				w_date_to = left(alltrim(w_date_from),3)+w_date_to
			endif

			w_str=""
			h = at(",", w_date)

			yea_part = substr(w_date, h+1 )
			yea_part = alltrim(yea_part)

			h = 1
			do while  h < len(yea_part)+1
				w_str = w_str + substr(yea_part, h,1)
				h = h + 1
			enddo
			yea_part  = alltrim(w_str)

			w_date_from =  w_date_from+","+" "+yea_part
			w_date_to =  w_date_to+","+" "+yea_part
		
			w_from_date = condate(w_date_from)
			w_to_date  = condate(w_date_to)		
		
		else
			w_from_date = {//}
			w_to_date  = {//}
		endif
	else
		j = 1
		h = 1
		do while h<=len(w_date) and  j= 1
			w_str = substr(w_date,h,1)
			if at(w_str, "0123456789") > 0
				j= 0
			endif
			h = h +1
		enddo
	*	if j = 0 and  at('/',w_date)<0
		if j = 0
			w_from_date = condate(w_date)
			w_to_date  = condate(w_date)
		else
			w_from_date = {//}
			w_to_date  = {//}
		endif
	endif
else
	w_from_date = {//}
	w_to_date  = {//}
endif
**********
*	messagebox(   "From :"+dtoc(w_from_date)+chr(10)+"To     :"+dtoc(w_to_date)    )