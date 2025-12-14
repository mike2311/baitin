public w_so_no, w_shipmark, w_remark
close table all
****
temp = w_path+"ship1"
if used( "shi1" )
	select shi1
else 
	use &temp in 0 exclusive
endif

temp = w_path+"ship"
	
if used( "ship" )
	select mso
else 
	USE &temp IN 0 EXCLUSIVE
endif

if used( "baitin!mso" )
	select mso
else 
	use baitin!mso in 0 exclusive
endif
select mso
zap

select * from ship into cursor ship_cursor where sh_no >= "271/4046" and sh_no < "4" 
select * from shi1 into cursor shi1_cursor where sh_no >= "271/4046" and sh_no < "4" 

select sh_no as "so_no", c_no as "cust_no", c_ename as "ename", c_add1 as "addr1", c_add2 as "addr2",;
	c_add3 as "addr3",c_add4 as "addr4", fc_no, date, po_no, vessel, disch, loading, delivery, fpay,;
		bl, status, sdate, fc_ename, fc_add1 as "fc_addr1", fc_add2 as "fc_addr2", fc_add3 as "fc_addr3",;
			fc_add4 as "fc_addr4",  collect, gc_no, gc_ename, gc_add1 as "gc_addr1", gc_add2 as "gc_addr2",;
				gc_add3 as "gc_addr3", gc_add4 as "gc_addr4", amend from ship_cursor order by sh_no into cursor shhd
				
select sh_no as "so_no", line, cn_no as "cont_no", i_no as "item_no", sect1 , sect2, sqty as "qty" , weight as "wt",;
	measure, pack, in_no as "inv_no",qty as "ctn" from shi1_cursor into cursor shdt order by sh_no
	
********************************

select shhd.*, cont_no, item_no,  ctn, wt, measure, pack, inv_no, qty,;
	sect1 as "shipmark",sect2 as remark_1,"" as "remark_2";
	from shhd inner join shdt on shhd.so_no == shdt.so_no into cursor ship_cursor
	
return 
select ship_cursor
go top
do while !eof()	
	select ship_cursor
	scatter to data_array
	select mso
	append blank
       	gather from data_array
       	
       	select ship_cursor
       	w_so_no = alltrim(ship_cursor.so_no)
       	w_shipmark = alltrim(ship_cursor.shipmark)
       	w_remark = alltrim(ship_cursor.remark_1)
       	skip
       	
       	do while w_so_no == alltrim(ship_cursor.so_no)
	       	w_shipmark = w_shipmark+chr(10)+ alltrim(ship_cursor.shipmark)
	       	w_remark = w_remark+chr(10)+ alltrim(ship_cursor.remark_1)
	       	if empty(alltrim(ship_cursor.item_no)) = .f.
	       		select mso
	       		replace mso.item_no with alltrim(ship_cursor.item_no)
	       	endif
		
		select ship_cursor 
		skip
       	enddo
       	
	select mso
	replace mso.shipmark with w_shipmark
	replace mso.remark_1 with w_remark

	select ship_cursor 
*	skip
enddo


