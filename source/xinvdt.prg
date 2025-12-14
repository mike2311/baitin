close table all
****
public w_item_no,w_item_no2, w_ship_mark,w_desp_memo,w_inv_no,i
public w_temp_path, temp_inv_head, temp_comp_code, w_head_item
w_head_item = ""
temp_comp_code = ""
temp_inv_head = ""
i = 1

if used( "baitin!minvHD" )
	select minvdt
else 
	use baitin!minvhd in 0 exclusive
endif

if used( "baitin!minvdt" )
	select minvdt
else 
	use baitin!minvdt in 0 exclusive
endif
select minvdt
 zap

if used( "baitin!inv1" )
	select inv1
else 
	use f:\baitindos\inv1 in 0 exclusive
endif
select inv1

*index  on in_no to y
index  on in_no+str(line) to x
set order to x
select inv1
*locate for alltrim(inv1.in_no) == "CI/680/98"

do while !eof()
	w_inv_no = alltrim(inv1.in_no)
	w_item_no = alltrim(inv1.i_no)
	w_ship_mark = ""
	w_desp_memo = inv1.sect1

	select minvdt
	APPEND BLANK
	replace minvdt.inv_no with alltrim(inv1.in_no)
	replace minvdt.item_no with alltrim(inv1.i_no)
	replace minvdt.ctn with inv1.ctn
	replace minvdt.qty with inv1.qty
	replace minvdt.price with inv1.price
	if inv1.price>0
		replace minvdt.head with .t.
		w_head_item = alltrim(inv1.i_no)
	else
		w_head_item = ""
		replace minvdt.head with .f.
	endif
	replace minvdt.head_item with w_head_item
	replace minvdt.ship_no with inv1.sh_no
	replace minvdt.wt with inv1.weight
	replace minvdt.net with inv1.net
	replace minvdt.cube with inv1.cube
	replace minvdt.dim with inv1.dimen
	replace minvdt.qctn with inv1.qctn
	replace minvdt.disc with inv1.dis
	temp_inv_head = substr(alltrim(inv1.in_no),1,2)
	select minvdt
	do case 
		case temp_inv_head =="CI"
			temp_comp_code = "BAT"
		case temp_inv_head =="HI"
			temp_comp_code = "HT"
		otherwise
			select minvhd
			locate for alltrim(inv_no) == alltrim(inv1.in_no)
			if found()
				if alltrim(cust_no) == "HTU"
					temp_comp_code = "BAT"
				else
					temp_comp_code = "HT"
				endif
			else
				temp_comp_code = "HT"
			endif					
	endcase 
	select minvdt
	replace minvdt.comp_code with temp_comp_code
			
	select inv1
	if !eof()
		skip
	endif
	do while   w_inv_no = inv1.in_no  AND  (inv1.i_no = w_item_no or empty(inv1.i_no)= .t.) and !eof()
		w_inv_no = inv1.in_no
		if upper(alltrim(inv1.mark)) == "Y"
			w_ship_mark = w_ship_mark +chr(10)+inv1.sect1	
			select inv1
			skip
			do while empty(inv1.i_no)= .t. and !eof() and w_inv_no = inv1.in_no
				w_ship_mark = w_ship_mark +chr(10)+inv1.sect1	
				select inv1
				skip
			enddo
		else
			w_desp_memo = w_desp_memo+chr(10)+inv1.sect1
			select inv1
			skip
		endif	

		select inv1
	enddo
	i = i+1
	if w_inv_no != inv1.in_no
		i = 1
	endif
	select minvdt
	replace minvdt.desp_memo with w_desp_memo
	replace minvdt.ship_mark with w_ship_mark
	
	select inv1
enddo

select minvdt
set filter to empty(minvhd.inv_no)
delete all
pack
set filter to
*release w_item_no,w_item_no2, w_item_memo,w_desc_memo