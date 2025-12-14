if !used("wpso")
	use wpso in 0 exclusive
endif
select wpso 
zap
public w_so_no
w_so_no = "271/4046-F"

select * from mcustom where cust_no ="HTU" into cursor mcus_cursor

select so_no, date, cust_no, ename, addr1,addr2,addr3,addr4, fc_ename, fc_addr1,fc_addr2,fc_addr3,;
	fc_addr4, vessel, disch, loading, delivery, fpay, bl, status, sdate, collect, amend,;
		item_no, qty, wt, measure, pack, inv_no, ship_qty, shipmark, remark_1 from mso;
			where alltrim(so_no) == w_so_no into cursor mso_cursor
						
select wpso
append blank
********************
replace wpso.shipper with charcon(charcon(mcus_cursor.ename, mcus_cursor.addr1, mcus_cursor.addr2, mcus_cursor.addr3),mcus_cursor.addr4)
replace wpso.tel with mcus_cursor.tel
********************
replace wpso. so_no with mso_cursor.so_no
replace wpso.consignee with charcon(charcon(mso_cursor.ename, mso_cursor.addr1, mso_cursor.addr2, mso_cursor.addr3), mso_cursor.addr4)
replace wpso.notify with charcon(charcon(mso_cursor.fc_ename, mso_cursor.fc_addr1, mso_cursor.fc_addr2,mso_cursor.fc_addr3),mso_cursor.fc_addr4)
replace wpso.date with mso_cursor.date
replace wpso.vessel with mso_cursor.vessel
replace wpso.disch with mso_cursor.disch
replace wpso.loading with mso_cursor.loading
replace wpso.delivery with mso_cursor.delivery
replace wpso.fpay with mso_cursor.fpay
replace wpso.bl with mso_cursor.bl
replace wpso.status with mso_cursor.status
replace wpso.collect with mso_cursor.collect
replace wpso.amend with mso_cursor.amend
replace wpso.item_no with mso_cursor.item_no
replace wpso.qty with mso_cursor.qty
replace wpso.wt with mso_cursor.wt
replace wpso.measure with mso_cursor.measure
replace wpso.pack with mso_cursor.pack
replace wpso.inv_no with mso_cursor.inv_no
replace wpso.ship_qty with mso_cursor.ship_qty
replace wpso.shipmark with mso_cursor.shipmark
replace wpso.remark_1 with mso_cursor.remark_1

select mso_cursor
use 
select mcus_cursor
use