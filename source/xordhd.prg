close table all
private w_date, w_mo, w_day, w_yea, w_date_from, w_date_to
public h, w_str, j, w_from_date, w_to_date
public error_data, w_temp_path
error_data = 0
****
w_temp_path = w_path+"\"+"orde"

if used( "baitin!mordhd" )
	select mordhd
else 
	use baitin!mordhd in 0 exclusive
endif
select mordhd
zap

if used( "orde" )
	select orde
else 
	use &w_temp_path in 0 exclusive
endif

select orde
locate for year(orde.date )>=1999
do while !eof()
	select mordhd
	APPEND BLANK
	replace mordhd.conf_no with orde.oc_no
	replace mordhd.date with orde.date
	replace mordhd.cust_no with orde.c_no
	replace mordhd.po_no with orde.po_no
	replace mordhd.CUR_CODE with orde.cur
	replace mordhd.ex_rate with orde.rate
	replace mordhd.comm_desp with orde.c_dis_say
	replace mordhd.comm_rate with orde.c_dis
	replace mordhd.pay_terms with orde.payment
	replace mordhd.fob_term with orde.remark1
	replace mordhd.remark with charcon(charcon(orde.remark3,orde.remark4,orde.remark5,orde.remark6,orde.remark7),orde.remark8)
	w_date = orde.shipment
	do Pcondate
	
	select mordhd
	replace mordhd.req_date_fr with w_from_date
	replace mordhd.req_date_to with w_to_date

	if substr(alltrim(mordhd.conf_no),1,3) == "BTL"
		replace mordhd.comp_code with "BAT"
	else
		replace mordhd.comp_code with "HT"
	endif
	
	select orde
	skip
enddo
messagebox(str(error_data))

procedure Pcondate

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
	
*	if at(",",w_date)<1  and len(alltrim(w_date))>5
*		error_data = error_data+orde.oc_no+chr(10)
*	endif
*	if at(",",w_date)<1  
*		error_data = error_data+1
*	endif
	
	if  at('/',w_date)>0
		error_data = error_data+1
	endif

	
*	if j = 0 and at(",",w_date)>0 and at('/',w_date)<1
*	if j = 0
	if j = 0 and at('/',w_date)<1  and at(',',w_date)>1
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
**********
*	messagebox(   "From :"+dtoc(w_from_date)+chr(10)+"To     :"+dtoc(w_to_date)    )

