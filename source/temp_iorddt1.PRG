**temp for iorddt1
public w_line_no
public iw_head,iw_oe_no, iw_cust_no, iw_ename,iw_date
w_line_no =0
iw_head="HT-OC"
iw_oe_no = "120/00"
select ?iw_head+"/"+?iw_oe_no as "Conf_no", ?w_line_no as line_no, ;
	item_no, qty as qty, item_no as item_memo, " " as desc_memo  from moe;
		into array  temptablearray


		



*			select moe_for_grid
*			locate for alltrim(item_no) == alltrim(vworddt1grid.item_no)
*		**Cost :: Retail
*			w_retail = moe_for_grid.cost
*		*for Pack
*			temp_desc_memo_from_moe = moe_for_grid.pack_desp
*				select mitem_cursor
*			locate for alltrim(mitem_cursor.item_no) == alltrim(vworddt1grid.item_no)
*			temp_desc_memo = ""
*			temp_desc_memo = mitem_cursor.desp + "COUNTRY OF ORIGIN "+ALLTRIM(MITEM_CURSOR.ORIGIN)
*			TEMP_DESC_MEMO = TEMP_DESC_MEMO+CHR(10)+"HTS#"+ALLTRIM(MITEM_CURSOR.HTC_NO)
*			TEMP_DESC_MEMO = TEMP_DESC_MEMO+"Material :"+mitem_cursor.material+chr(10)
*			TEMP_DESC_MEMO = TEMP_DESC_MEMO+"RETAIL : $"+alltrim(str(w_retail,5,3))+CHR(10)
*			*¥¼§¹¦¨
*			TEMP_DESC_MEMO = TEMP_DESC_MEMO+temp_desc_memo_from_moe+chr(10)
*			TEMP_DESC_MEMO = TEMP_DESC_MEMO+"***Product "+ alltrim(vworddt1grid.item_no) +" Including***"