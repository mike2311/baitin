close table all
****
public w_item_no,w_item_no2, w_item_memo,w_desc_memo,w_oc_no,i, temp_path
temp_path = alltrim(w_path)+"\"+"con1"
i = 1
if used( "baitin!mcontdt" )
	select mcontdt
else 
	use baitin!mcontdt in 0 exclusive
endif
select mcontdt
 zap

if used( "con1" )
	select con1
else 
	use &temp_path in 0 exclusive
endif
select con1
*index  on cn_no to y
index  on cn_no+str(line) to x
set order to x

select con1
go top
*locate for cn_no = "HT-OC/120/00 "

do while !eof()
	w_cn_no = con1.cn_no
	w_item_no = con1.i_no
	w_item_memo = con1.sect1
	w_desc_memo = con1.sect2
	select mcontdt
	APPEND BLANK
	replace mcontdt.cont_no with con1.cn_no
	replace mcontdt.item_no with con1.i_no
	replace mcontdt.qty with con1.qty
	replace mcontdt.price with con1.price
	if con1.price > 0
		replace mcontdt.head with .t.
	else
		replace mcontdt.head with .f.
	endif
	replace mcontdt.line_no with i
	replace mcontdt.conf_no with con1.oc_no
	replace mcontdt.ship_no with con1.sh_no
	replace mcontdt.ship_qty with con1.o_qty

	select con1
	if !eof()
		skip
	endif
	do while   w_cn_no = con1.cn_no  AND  (con1.i_no = w_item_no or empty(con1.i_no)= .t.) and !eof()
		w_cn_no = con1.cn_no
		w_item_memo = w_item_memo+chr(10)+con1.sect1	
		w_desc_memo = w_desc_memo+chr(10)+con1.sect2
		select con1
		skip
	enddo
	i = i+1
	if w_cn_no != con1.cn_no
		i = 1
	endif

	select mcontdt
	replace mcontdt.item_memo with w_item_memo
	replace mcontdt.desc_memo with w_desc_memo
	select con1
enddo

release w_item_no,w_item_no2, w_item_memo,w_desc_memo