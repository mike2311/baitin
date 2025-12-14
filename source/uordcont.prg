


Public w_head_item,w_head_qty
w_head_item=space(20)
w_head_qty=0

select voe1
go top

do while!eof()
     @2.5,40 say "                                                "
     @2.5,40 say "Update Item No. "+alltrim(voe1.item_no)
     select morddt
     go top
     locate for alltrim(morddt.conf_no)==alltrim(voe1.oc_no) and alltrim(morddt.item_no)==alltrim(voe1.item_no)
     if !eof()
         do update_morddt
     endif

     select mcontdt
     locate for alltrim(mcontdt.conf_no)==alltrim(voe1.oc_no) and alltrim(mcontdt.item_no)==alltrim(voe1.item_no)
     if !eof()
        do update_mcontdt
     endif
        
     select voe1
     skip 
enddo
@2.5,40 say "                                                "
@2.5,40 say "Update Completed"

procedure update_morddt
     select morddt
     replace morddt.qty       with voe1.qty
     replace morddt.ctn       with voe1.ctn
     replace morddt.price    with voe1.price
     replace morddt.po_no  with voe1.po_no

     SELECT sum(qty) as total_qty;
             FROM baitin!mprodbom into cursor sum_qty;
                   WHERE alltrim(Mprodbom.item_no) == alltrim(morddt.item_no) 
      if sum_qty.total_qty > 0
         w_head_item=morddt.item_no
         w_head_qty=morddt.qty
         select morddt
         skip
         do while morddt.head = .f.
               select mprodbom
               locate for alltrim(mprodbom.item_no)==alltrim(w_head_item) and;
                               alltrim(mprodbom.sub_item)==alltrim(morddt.item_no)
               select morddt        
               replace morddt.qty with w_head_qty * mprodbom.qty / sum_qty.total_qty
               skip
           enddo     
      endif
      
procedure update_mcontdt      
         replace mcontdt.qty       with voe1.qty
         replace mcontdt.ctn       with voe1.ctn
         replace mcontdt.price    with voe1.cost
         replace mcontdt.po_no  with voe1.po_no   
         SELECT sum(qty) as total_qty;
             FROM baitin!mprodbom into cursor sum_qty;
                   WHERE alltrim(Mprodbom.item_no) == alltrim(morddt.item_no) 
      if sum_qty.total_qty > 0
         w_head_item=mcontdt.item_no
         w_head_qty=mcontdt.qty
         select mcontdt
         skip
         do while mcontdt.head = .f.
               select mprodbom
               locate for alltrim(mprodbom.item_no)==alltrim(w_head_item) and;
                               alltrim(mprodbom.sub_item)==alltrim(mcontdt.item_no)
               select mcontdt        
               replace mcontdt.qty with w_head_qty * mprodbom.qty / sum_qty.total_qty
               skip
           enddo     
     endif 