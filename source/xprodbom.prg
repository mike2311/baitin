close table all

if used("prod")
	select prod
else
	use e:\baitindos\prod in 1
endif

if used("baitin!mprodbom")
	select mprodbom
else 
	use mprodbom in 0
endif
select mprodbom
zap

select prod
do while !eof()
	select mprodbom
	append blank
	replace mprodbom.item_no 	 with prod.p_no
	replace mprodbom.sub_item  	with prod.i_no
	replace mprodbom.qty  		with prod.qty
	
	select prod
	skip
enddo
clear all
