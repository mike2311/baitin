close table all
use worddt1grid
zap
public iw_head,iw_oe_no, iw_cust_no, iw_ename,iw_date,w_grid_item_no,update_times
public i
i = 1
w_grid_item_no = ""
IF w_password="HT"
   iw_head = "HT-OC/"
 ELSE
    IF w_password="INSP"
       iw_head = "IN-OC/" 
    ENDIF
ENDIF       
IW_OE_NO = "120/00"
IW_CUST_NO = "PALMER"
iw_ename = "PALMER AGENCIES LTD."
iw_date = ctod("02/05/2000")



select item_no, origin,desp,  htc_no, material,upc_no, short_name from mitem into cursor mitem_cursor order by item_no
select * from mprodbom into cursor mprodbom_cursor order by item_no , sub_item
select item_no, sum(qty) from mprodbom into cursor mprodbom_sum_qty order by item_no group by item_no
select * from moe where oe_no == iw_oe_no into cursor moe_cursor order by item_no
select item_no, qty,price,PACK_DESP,cost from moe_cursor into cursor moe_for_grid2
select item_no, qty,price,PACK_DESP,cost from moe_cursor into cursor moe_for_grid order by item_no

select moe_for_grid
do while !eof()
	select worddt1grid 
	append blank
	replace worddt1grid.conf_no 		with iw_head + iw_oe_no
	replace worddt1grid.line_no 		with i
	replace worddt1grid.price 	with moe_for_grid.price
	replace worddt1grid.item_no with moe_for_grid.item_no
	replace worddt1grid.qty with moe_for_grid.qty
	replace worddt1grid.item_memo with moe_for_grid.item_no
	replace worddt1grid.Tf with .t.
	replace worddt1grid.head with .t.
	replace worddt1grid.up with .f.
	replace worddt1grid.mod with .f.
	replace worddt1grid.default with .t.
	i = i+1
	select mprodbom_cursor
	locate for mprodbom_cursor.item_no ==  moe_for_grid.item_no
	if !eof()
			select mprodbom_cursor
			temp_item_no = mprodbom_cursor.item_no

			do while temp_item_no = mprodbom_cursor.item_no
				select worddt1grid
				append blank
				replace worddt1grid.conf_no 		with iw_head + iw_oe_no
				replace worddt1grid.item_no		with mprodbom_cursor.sub_item
				replace worddt1grid.line_no 		with i
				replace worddt1grid.qty with  moe_for_grid.qty*mprodbom_cursor.qty / mprodbom_sum_qty.sum_qty
				replace worddt1grid.Tf with .t.
				replace worddt1grid.head with .f.
				replace worddt1grid.up with .f.
				replace worddt1grid.mod with .f.
				replace worddt1grid.default with .t.
				i=i+1
				select mitem_cursor
				locate for mitem_cursor.item_no = mprodbom_cursor.sub_item
				select worddt1grid
				replace worddt1grid.desc_memo with mitem_cursor.short_name+iif(!empty(alltrim(mitem_cursor.upc_no)),"UPC # ","")+mitem_cursor.upc_no
				replace worddt1grid.item_memo with mprodbom_cursor.sub_item
				replace worddt1grid.head with .f.
				
				select mprodbom_cursor
				skip				
			enddo
	endif
	select moe_for_grid
	skip	
enddo