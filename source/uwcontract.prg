
if used("wcontract")
	select wcontract
	zap
else
	use wcontract in 0 exclusive
	select wcontract
	zap
endif

public pw_cont_no
pw_cont_no = "HT120/00B"

*select * from morddt where  alltrim(conf_no) = alltrim(pw_conf_no) into cursor morddt_cursor

select * from mvendor into cursor mvendor_cursor order by vendor_no

SELECT mconthd.cont_no,mconthd.conf_no, mconthd.date, mconthd.vendor_no, mconthd.payment,mconthd.remark,;
	mconthd.req_date_fr as req_date_f, mconthd.req_date_to as req_date_t,mconthd.cur_code,mconthd.ship_to,;
	mcontdt.item_no, mcontdt.desc_memo, mcontdt.qty, mcontdt.price,mcontdt.item_memo;
 FROM  baitin!mconthd INNER JOIN baitin!mcontdt ;
   ON  mconthd.cont_no = mcontdt.cont_no;
   where alltrim(mconthd.cont_no) == alltrim(pw_cont_no) into cursor mcontdt_cursor

select mvendor_cursor
locate for alltrim(mvendor_cursor.vendor_no) == alltrim(mcontdt_cursor.vendor_no)

select *from mcontdt_cursor into  cursor tt_cursor

select tt_cursor
go top
do while !eof()
	select wcontract
      		APPEND BLANK 
      		replace wcontract.cont_no with tt_cursor.cont_no
      		replace wcontract.conf_no with tt_cursor.conf_no
      		replace wcontract.date with tt_cursor.date
      		replace wcontract.req_date_t with tt_cursor.req_date_t
      		replace wcontract.req_date_f with tt_cursor.req_date_f
      		replace wcontract.cur_code with tt_cursor.cur_code
      		replace wcontract.item_no with tt_cursor.item_no
	       	replace wcontract.desc_memo with tt_cursor.desc_memo
	       	replace wcontract.item_memo with tt_cursor.item_memo
	       	replace wcontract.payment with tt_cursor.payment
		replace wcontract.ship_to with tt_cursor.ship_to
		replace wcontract.qty with tt_cursor.qty
		replace wcontract.price with tt_cursor.price
		replace wcontract.remark with tt_cursor.remark

	SELECT tt_cursor
	SKIP
enddo
select wcontract
replace all wcontract.vendor_no with mvendor_cursor.vendor_no
replace all wcontract.ename        with mvendor_cursor.ename
replace all wcontract.addr1        with mvendor_cursor.addr1
replace all wcontract.addr2        with mvendor_cursor.addr2
replace all wcontract.addr3        with mvendor_cursor.addr3
replace all wcontract.addr4        with mvendor_cursor.addr4
