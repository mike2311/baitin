if !used("temp.frx")
	use temp.frx in 0
endif
w_key = "GLOBE"
select*from zsoformat where alltrim(so_key) = w_key into cursor zso_cursor 
select zso_cursor
go top 
do while !eof()
	select temp
	locate for alltrim(temp.uniqueid) == alltrim(zso_cursor.uniqueid) 
	if found()
		select temp
		replace temp.vpos with zso_cursor.vpos
		replace temp.hpos with zso_cursor.hpos
		replace temp.height with zso_cursor.height
		replace temp.width with zso_cursor.width
	else
		Messagebox("Key No. Found")
		return
	endif
	
	select zso_cursor
	skip
enddo

select temp
use

report form temp.frx preview 