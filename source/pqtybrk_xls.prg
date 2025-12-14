w_wpqtybrk=alltrim(syswork)+"/wqtybrk.dbf"
 create table &w_wpqtybrk free;
	(oe_no               c(16),;
	 item_no  		c(15),;
	 skn_no              c(20),;
	 po_no               c(20),;
	 port                   c(15),;
	 row_ref            c(1),;
	 qty                    n(7),;
	 ctn                    n(6),;
	 outer_pc           n(4),;
	 price                 n(9,4),;
	 fob_port           c(20),;
	 del_from        date,;
	 del_to             date)                          
 index on oe_no+item_no tag iwqtybrk
select mcustom
set order to cust_no
select moe
set order to ioeitem
select mqtybrk
set order to iqtybrk

select * from wpobrkgrid into cursor wpobrkgrid_1 where select
*select * from moe into cursor vTmpMoe where alltrim(oe_no) in (select alltrim(oe_no) from wpobrkgrid_1) and !empty(oe_no) order by vendor_no, item_no

select wpobrkgrid_1
go top
do while !eof()
     select moe
     set order to ioe
     set near on
     seek wpobrkgrid_1.oe_no
     set near off
     do while alltrim(moe.oe_no)==alltrim(wpobrkgrid_1.oe_no) and !eof()
          if moe.cxl_flag <> 0
             select moe
             skip
             loop
          endif   
          select mqtybrk
          set order to iqtybrk
          set near on
          seek moe.oe_no+moe.item_no
          set near off
          select mqtybrk
          do while !eof() and alltrim(mqtybrk.oe_no)== alltrim(moe.oe_no) and ;
                                          alltrim(mqtybrk.item_no)==alltrim(moe.item_no)
               select wqtybrk
               append blank
               replace wqtybrk.oe_no       with moe.oe_no
               replace wqtybrk.item_no    with moe.item_no
               replace wqtybrk.skn_no     with moe.skn_no
               replace wqtybrk.po_no       with mqtybrk.po_no
               replace wqtybrk.port           with mqtybrk.port
               replace wqtybrk.row_ref    with mqtybrk.row_ref
               replace wqtybrk.qty            with mqtybrk.qty
               replace wqtybrk.outer_pc   with moe.qty / moe.ctn
               replace wqtybrk.ctn            with mqtybrk.qty / wqtybrk.outer_pc
               replace wqtybrk.price         with moe.price
               replace wqtybrk.fob_port   with moe.fob_port
               replace wqtybrk.del_from  with mqtybrk.del_from
               replace wqtybrk.del_to       with mqtybrk.del_to
               select mqtybrk
               skip
           enddo
           select moe
           skip
     enddo
     select wpobrkgrid_1
     skip
 enddo        
 
 select wqtybrk
 go top
w_wqtybrk_xls=alltrim(syswork)+"/wqtybrk_"+DTOS(DATE())+"_"+SUBSTR(TIME(),1,2)+SUBSTR(TIME(),4,2)+SUBSTR(TIME(),7,2)+"_xls"
COPY TO &w_wqtybrk_xls TYPE xls
