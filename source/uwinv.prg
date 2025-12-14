if used("winv")
	select winv
	zap
else
	use winv in 0 exclusive 
	zap
endif

w_inv_no = "CI/680/98"
select inv_no, date,cur_code, cust_no, cust_name, addr_1,addr_2,;
	addr_3, addr_4,term, conf_no, ship, loading, dest, po_no,;
		cover from minvhd where inv_no = w_inv_no into cursor minvhd_cursor
		
select inv_no, minvdt.desp_memo, ctn,ctn* qctn as "qty_ea", price, ctn* qctn *price as amount;
	from minvdt where inv_no = w_inv_no order by item_no;
		into cursor minvdt_cursor

		
select minvhd_cursor.*, desp_memo, ctn, qty_ea,price, amount;
	from minvhd_cursor inner join minvdt_cursor;
		on minvhd_cursor.inv_no == minvdt_cursor.inv_no ;
		into table temp_inv_table
	
		
		

select winv
append from temp_inv_table

select temp_inv_table
use 
delete file temp_inv_table.*

select minvhd_cursor
use
select minvdt_cursor
use
