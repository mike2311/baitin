select mordhd
go top
do while !eof()
	select morddt
	locate for alltrim(conf_no) == alltrim(mordhd.conf_no)
	if !found()
		select mordhd
		delete
	endif
	select mordhd
	skip
enddo
