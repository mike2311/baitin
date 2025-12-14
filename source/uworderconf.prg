

if used("worderconf")
	select worderconf
	zap
else
	use worderconf in 0 exclusive
	select worderconf
	zap
endif

*public pw_conf_no
*pw_conf_no = "HT-OC/124/00A"

*select * from morddt where  alltrim(conf_no) = alltrim(pw_conf_no) into cursor morddt_cursor

select cust_no, ename from mcustom into cursor mcustom_cursor


SELECT Mordhd.conf_no, mordhd.date, mordhd.cust_no, ;
	mordhd.req_date_fr as req_date_f, mordhd.req_date_to as req_date_t,mordhd.cur_code, mordhd.fob_term,;
	mordhd.pay_terms, mordhd.addr1, mordhd.addr2, mordhd.addr3, mordhd.addr4,;
	Morddt.item_no, morddt.desc_memo, morddt.qty, morddt.price;
 FROM  baitin!mordhd INNER JOIN baitin!morddt ;
   ON  Mordhd.conf_no = Morddt.conf_no;
   where alltrim(Mordhd.conf_no) = alltrim(pw_conf_no) into cursor morddt_cursor

select mcustom_cursor
locate for alltrim(cust_no) == alltrim(morddt_cursor.cust_no)

select *, mcustom_cursor.ename as "ename" from morddt_cursor into  cursor tt_cursor
select tt_cursor
go top
do while !eof()
	select worderconf
	replace desc_memo with tt_cursor.desc_memo
	skip
	select tt_cursor
	skip
enddo
select worderconf

release tt
select morddt_cursor
use
select mcustom_cursor
use