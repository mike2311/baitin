close table all

use pso.frx  in 0 alias rpt noupdate
select * from  rpt where !empty(uniqueid) and !empty(fillchar ) into cursor so_form
select rpt
use

if !used("zsoformat")
	use zsoformat in 0
endif
select zsoformat
set filter to alltrim(so_key) == upper("key_tar")
delete all
set filter to
pack
select so_form
go top
do while !eof()
	select zsoformat
	append blank
	replace zsoformat.so_key with upper("key_tar")
	replace zsoformat.so_name with "key_name"
	replace zsoformat.uniqueid with so_form.uniqueid
	replace zsoformat.field_name with upper(so_form.expr)
	replace zsoformat.name with so_form.name
	replace zsoformat.expr with so_form.expr
	replace zsoformat.vpos with so_form.vpos
	replace zsoformat.hpos with so_form.hpos
	replace zsoformat.v with so_form.vpos/3938.6980
	replace zsoformat.h with so_form.hpos/3938.6980
	replace zsoformat.height with so_form.height
	replace zsoformat.width with so_form.width
	replace zsoformat.hei with so_form.height/3938.6980
	replace zsoformat.wei with so_form.width/3938.6980
	replace zsoformat.fontface with so_form.fontface
	replace zsoformat.fontstyle with so_form.fontstyle
	replace zsoformat.fontsize with so_form.fontsize

	select so_form
	skip	
enddo