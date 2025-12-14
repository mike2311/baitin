local w_inv_no,i
i = .t.
w_inv_no =""
select minvdt
recall all
go top
do while !eof()
	w_inv_no =alltrim(minvdt.inv_no)
	select minvhd
	locate for alltrim(minvhd.inv_no) == alltrim(w_inv_no)
	if !found()
		i = .t.
		select minvdt
		delete
	else
		i = .f.
	endif
	select minvdt
	skip
	do while !eof() and alltrim(minvdt.inv_no) == alltrim(w_inv_no) and i = .t.
		select minvdt
		delete 
		skip
	enddo
enddo

return

select minvdt
go top
do while !eof()
	select minvdt
	do while  empty(minvdt.inv_no) or substr(alltrim(inv_no),1,1)="/" or substr(alltrim(inv_no),1,2) ="TT"
	    select minvdt
	    delete 
	    skip	
	enddo
	select minvhd
	locate for alltrim(minvhd.inv_no) == alltrim(minvdt.inv_no)
	if !found()
	        select minvdt
		delete
	endif	
	select minvdt
	skip
enddo
