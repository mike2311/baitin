close table all
****
public item_htc,i
if used( "baitin!mitemven" )
	select mitemven
else 
	use baitin!mitemven in 0 exclusive
endif
select mitemven
zap
local temp_path
temp_path = w_path+"\item"

if used( "baitin!item" )
	select item
else 
	use &temp_path in 0 exclusive
endif

select item
do while !eof()
	select mitemven 
	APPEND BLANK
@ 12, 10  say item.i_no

	replace mitemven.item_no with item.i_no
	replace mitemven.eff_date with {01/01/00}
	replace mitemven.cur_code with item.cur1
	replace mitemven.vendor_no with item.ven1
	replace mitemven.fob with item.cost1

	if !empty(item.ven2)
		append blank
		replace mitemven.item_no with item.i_no
		replace mitemven.eff_date with {01/01/00}
		replace mitemven.cur_code with item.cur2
		replace mitemven.vendor_no with item.ven2
		replace mitemven.fob with item.cost2			
	endif

	if !empty(item.ven3)
		append blank
		replace mitemven.item_no with item.i_no
		replace mitemven.eff_date with {01/01/00}
		replace mitemven.cur_code with item.cur3
		replace mitemven.vendor_no with item.ven3
		replace mitemven.fob with item.cost3			
	endif

	if !empty(item.ven4)
		append blank
		replace mitemven.item_no with item.i_no
		replace mitemven.eff_date with {01/01/00}
		replace mitemven.cur_code with item.cur4
		replace mitemven.vendor_no with item.ven4
		replace mitemven.fob with item.cost4			
	endif

	select item
	skip
enddo
	@ 12, 10  say "งน"