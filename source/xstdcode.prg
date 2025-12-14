if used("zstdcode")
	select zstdcode
else
	use zstdcode in 0
endif
select zstdcode
zap
if used("wstdname")
	select wstdname 
else
	use wstdname in 0 
endif
select wstdname

select std_code, stdname from wstdname group by std_code into cursor temp_cursor

select temp_cursor
do while !eof()
	select zstdcode
	append blank
	replace zstdcode.std_code with temp_cursor.std_code
	replace zstdcode.std_desp with temp_cursor.stdname
	select temp_cursor
	skip
enddo
select temp_cursor
use

