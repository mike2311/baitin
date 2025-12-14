if used("wpacklist")
	select wpacklist
	zap
else
	use wpacklist in 0 exclusive 
	zap
endif

w_inv_no = "HI/0170/99"
select inv_no, date, cust_no, cust_name, addr_1,addr_2,;
	addr_3, addr_4, conf_no, ship, loading, dest, po_no,;
		cover from minvhd where inv_no = w_inv_no into cursor minvhd_cursor
		
select inv_no, alltrim(mline(minvdt.desp_memo,1,1)) as "desp_memo", ctn, qctn, qty, net, wt, cube, dim;
	from minvdt where inv_no = w_inv_no and empty(minvdt.item_no) = .f.;
		into cursor minvdt_cursor
*		browse
		
*messagebox(mline(minvdt_cursor.desp_memo,1,1))
		
select minvhd_cursor.*, desp_memo, ctn, qctn,;
	qty, net, wt, cube, dim from minvhd_cursor inner join minvdt_cursor;
		on minvhd_cursor.inv_no == minvdt_cursor.inv_no into cursor join_cursor

select inv_no, join_cursor.date, join_cursor.cust_no, join_cursor.cust_name, join_cursor.addr_1,;
	join_cursor.addr_2,join_cursor.addr_3,join_cursor.addr_4, conf_no, ship, loading, dest, po_no,;
		cover, desp_memo, ctn, qctn, qty, iif(nvl(mcustom.wt_unit,0)=2, net/2.2, net) as "net", ;
			iif(nvl(mcustom.wt_unit,0)=2, wt/2.2, wt) as "wt", cube, join_cursor.dim;
			from join_cursor left outer join mcustom on join_cursor.cust_no;
				= mcustom.cust_no into table temp_packlist_table
	
		
		

select wpacklist
append from temp_packlist_table

select temp_packlist_table
use 
delete file temp_packlist_table.*

select minvhd_cursor
use
select minvdt_cursor
use
