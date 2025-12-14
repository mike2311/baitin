CLOSE TABLE ALL
PRIVATE I
IF USED("BAITIN!MINVHD")
	SELECT MINVHD
	ZAP
ELSE
	USE BAITIN!MINVHD IN 0 EXCLUSIVE
	ZAP
ENDIF

IF USED("BAITIN!INV")
	SELECT INV
ELSE
	USE f:\BAITINdos\INV IN 0 EXCLUSIVE
ENDIF

SELECT IN_NO AS "INV_NO", C_NO AS "CUST_NO", DATE, OC_NO AS "CONF_NO", SHIP, DDATE AS "DEL_DATE",;
	PO_NO, TERM, LOADING, DEST, CUR AS "CUR_CODE", C_ENAME AS "CUST_NAME", C_ADD1 AS "ADDR_1",;
		C_ADD2 AS "ADDR_2", C_ADD3 AS "ADDR_3", C_ADD4 AS "ADDR_4", ;
			CHARCON(REMARK1, REMARK2,REMARK3) AS "REMARK_1", charcon(charcon(cover1,cover2,cover3), charcon(cover4,cover5)) as "cover",;
				c_dis as "disc", c_dis_say as "dis_desp", pay_at, lc_bank, lc_no, lc_ref, lc_prod, charcon(lc_rem1,lc_rem2,lc_rem3,) as "rem1",;
					charcon(lc_rem4,lc_rem5,lc_rem6) as "rem2",charcon(lc_rem7,lc_rem8,lc_rem9,lc_rem10) as "rem3", mid_no, mfy_name,;
						mfy_add1 as "mfy_addr_1",mfy_add2 as "mfy_addr_2",mfy_add3 as "mfy_addr_3",mfy_add4 as "mfy_addr_4",;
							mc_1,mc_2,mc_3,mc_4,mc1_v,mc2_v,mc3_v,mc4_v from inv;
								into cursor tt 

charcon(rem1,rem2,rem3)
select inv_no, cust_no, date, conf_no, ship, del_date, po_no, term, loading,dest, cur_code, cust_name, ;
	 addr_1, addr_2, addr_3, addr_4, remark_1, cover, disc, dis_desp, iif(upper(substr(alltrim(cust_no),1,4))="WAl-", "DESTINATION",pay_at), lc_bank, lc_no, lc_ref, lc_prod,;
	 	 charcon(rem1,rem2,rem3) as "lc_remark", mid_no, mfy_name, mfy_addr_1,mfy_addr_2,mfy_addr_3,mfy_addr_4,;
	 	 	mc_1, mc_2,mc_3,mc_4,mc1_v,mc2_v,mc3_v,mc4_v,"" as inv_remark,;
	 	 		iif(substr(alltrim(inv_no),1,2)=="CI",iif(alltrim(cust_no)<>"HTU" or substr(alltrim(inv_no),1,2)=="HI" ,"BAT","HT "),"HT ");
	 	 			as comp_code from tt into table temp
	
select minvhd
append from temp
set filter to empty(alltrim(minvhd.inv_no))
delete all
set filter to 
pack

select temp
use 
delete file temp.*
