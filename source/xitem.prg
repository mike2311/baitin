close table all
****
use zstdcode  in 0 
public item_htc,i
if used( "baitin!mitem" )
	select mitem
else 
	use baitin!mitem in 0 exclusive
endif
select mitem
zap
local temp_path
temp_path = w_path +"\item"
if used( "baitin!item" )
	select item
else 
	use &temp_path in 0 
endif

select item
do while !eof()
	select mitem 
	APPEND BLANK
	replace mitem.item_no with item.i_no

@ 12, 10  say item.i_no
	replace mitem.item_type with item.item
	replace mitem.date with item.date
	replace mitem.short_name with item.desc1
	replace mitem.item_no with item.i_no
	replace mitem.desp with CHARCON(ITEM.desc1,ITEM.desc2,ITEM.desc3,ITEM.desc4)
	replace mitem.origin with item.origin1
	replace mitem.grp_code with item.class
	replace mitem.material with charcon(item.material, item.material1, item.material2)
	replace mitem.upc_no with alltrim(item.upc)+alltrim(item.upc2)
	
	i = at("#", item.origin2)
	i =i+1
	item_htc = item.origin2
	item_htc = substr(item_htc, i )	
	item_htc = charcon(item_htc,item.origin3)

	select mitem
	replace mitem.htc_no with item_htc

	replace pack_pc_1 with item.pqty1
	replace pack_desp_1 with item.pack1
	replace pack_pc_2 with item.pqty2
	replace pack_desp_2 with item.pack2
	replace pack_pc_3 with item.pqty3
	replace pack_desp_3 with item.pack3
	replace pack_pc_4 with item.pqty4
	replace pack_desp_4 with item.pack4
	replace mitem.wt with item.weight
	replace mitem.net with item.net
	replace mitem.cube with item.cube
	replace mitem.duty with item.duty
	
	SELECT  zstdcode
	locate for alltrim(zstdcode.STD_desp) == alltrim(ITEM.STDNAME)
	if found()
		SELECT MITEM	
		replace mitem.std_code with zstdcode.std_code
	endif
	select mitem
	replace mitem.price with item.price
	replace mitem.price_cur with item.cur
	
	select item
	skip
enddo
	@ 12, 10  say "งน"



