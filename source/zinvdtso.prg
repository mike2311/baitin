*select a.date, a.inv_no,a.dest, b.item_no, b.qty, b.ship_no, b.conf_no, b.po_no, b.ship_mark from minvhd a inner join minvdt b on a.inv_no=b.inv_no order by a.date into cursor vinv where b.head=.t.
*select a.*, b.qty, b.delivery from vinv a inner join mso b on a.ship_no=b.so_no where a.qty<> b.qty into cursor verror
*select verror
*go top

select minvdt
go top
*locate for inv_no="HI/0165/12" and item_no="1070HKM" 
*XXX
do while !eof()
    @0,0 
    @0,0 say minvdt.inv_no+minvdt.item_no
     w_dest=""
     select minvhd
     set order to IINVHD
     seek minvdt.inv_no
     if !eof()
        w_dest=minvhd.dest
     endif
     select minvdt
   *  IF inv_no="HI/1776/10" and item_no="7623DT"  and w_dest = "MARIETTA"  
   *     XXX
   *  ENDIF 
     select mso
     go top
     locate for mso.conf_no=minvdt.conf_no and mso.item_no=minvdt.item_no and mso.po_no=minvdt.po_no and alltrim(mso.delivery)==alltrim(w_dest)
     if !eof()
        if alltrim(mso.so_no)<>alltrim(minvdt.ship_no)
           if mso.qty=minvdt.qty
               select minvdt
               w_item_no=minvdt.head_item
               w_inv_no=minvdt.inv_no
               do while alltrim(minvdt.head_item)==alltrim(w_item_no) and alltrim(minvdt.inv_no)==alltrim(w_inv_no)
                    replace minvdt.ship_no with mso.so_no
                    select minvdt
                    skip
                enddo
                loop    
           else 
*              xxx
           endif
        endif   
     endif 
     select minvdt
     skip           
enddo