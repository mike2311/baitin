close table all
****
public w_item_no,w_item_no2, w_item_memo,w_desc_memo,w_oc_no,i
public w_temp_path
w_temp_path = w_path+"\"+"ord1"
i = i
if used( "baitin!morddt" )
	select morddt
else 
	use baitin!morddt in 2 exclusive
endif
select morddt
 zap

if used( "ord1" )
	select ord1
else 
	use &w_temp_path in 0 exclusive
endif
select ord1

*index  on oc_no to y
index  on oc_no+str(line) to x
set order to x
select ord1
locate for oc_no = "HT-OC/351/96"
do while !eof()
	w_oc_no = ord1.oc_no
	w_item_no = ord1.i_no
	w_item_memo = ord1.sect1
	w_desc_memo = ord1.sect2
	select morddt
	APPEND BLANK
	
	replace morddt.conf_no with ord1.oc_no
	replace morddt.item_no with ord1.i_no
	replace morddt.qty with ord1.qty
	replace morddt.price with ord1.price
	if ord1.price > 0
		replace morddt.head with .t.
	else
		replace morddt.head with .f.
	endif
		
	select ord1
	skip

		do while   w_oc_no = ord1.oc_no  AND  (ord1.i_no = w_item_no or empty(ord1.i_no)= .t.)
			w_oc_no = ord1.oc_no
			w_item_memo =w_item_memo+chr(10)+ord1.sect1	
			w_desc_memo = w_desc_memo+chr(10)+ord1.sect2
			select ord1
			skip
		enddo


	select morddt
	replace morddt.item_memo with w_item_memo
	replace morddt.desc_memo with w_desc_memo
	
	if substr(alltrim(morddt.conf_no),1,3) == "BTL"
		replace morddt.comp_code with "BAT"
	else
		replace morddt.comp_code with "HT"
	endif
enddo

release w_item_no,w_item_no2, w_item_memo,w_desc_memo

clear all
