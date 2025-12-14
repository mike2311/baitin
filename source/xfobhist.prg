close table all
****
public item_htc,i
if used( "baitin!mobhist" )
	select mfobhist
else 
	use baitin!mfobhist in 0 exclusive
endif
select mfobhist
zap
local temp_var
temp_var = w_path+"\item"
if used( "baitin!item" )
	select item
else 
	use &temp_var in 0 exclusive
endif

select item
do while !eof()
	select mfobhist 
	APPEND BLANK
@ 12, 10  say item.i_no

	replace mfobhist.item_no with item.i_no
	replace mfobhist.eff_date with {01/01/2000}
	replace mfobhist.cur_code with item.cur1
	replace mfobhist.vendor_no with item.ven1
	replace mfobhist.fob with item.cost1
	if !empty(item.ven2)
		append blank
		replace mfobhist.item_no with item.i_no
		replace mfobhist.eff_date with {01/01/2000}
		replace mfobhist.cur_code with item.cur2
		replace mfobhist.vendor_no with item.ven2
		replace mfobhist.fob with item.cost2			
	endif
	
	if !empty(item.ven3)
		append blank
		replace mfobhist.item_no with item.i_no
		replace mfobhist.eff_date with {01/01/2000}
		replace mfobhist.cur_code with item.cur3
		replace mfobhist.vendor_no with item.ven3
		replace mfobhist.fob with item.cost3			
	endif
	
	if !empty(item.ven4)
		append blank
		replace mfobhist.item_no with item.i_no
		replace mfobhist.eff_date with {01/01/2000}
		replace mfobhist.cur_code with item.cur4
		replace mfobhist.vendor_no with item.ven4
		replace mfobhist.fob with item.cost4			
	endif
		
	select item
	skip
enddo
	@ 12, 10  say "งน"



