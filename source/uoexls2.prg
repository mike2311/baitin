Public w_field_no, finished, w_cust_no, w_detail_pos, w_ship_from, w_ship_to, w_po_no, w_port_row, w_port_col, w_port_column
Public w_port_po, w_port, w_port_qty, w_min, w_max, w_max_index, w_min_index
Public w_pack_pc_1, w_pack_pc_2, w_pack_pc_3, w_pack_pc_4,w_pack_desp_1, w_pack_desp_2, w_pack_desp_3, w_pack_desp_4
Public n_item_no, n_skn_no, n_inner, n_master, n_qty, n_ctn, n_price, n_maker, n_remark, n_po_no, n_port, n_retail, n_ship_from, n_ship_to

If used("mcustom")
   select mcustom 
else
   use baitin!mcustom in 0
endif   

If used("moe")
    select moe 
else
    use baitin!moe in 0 
endif           

If used("mskn")
    select mskn 
else
    use baitin!mskn in 0 
endif           

If used("mitemven")
    select mitemven
else
    use baitin!mitemven in 0 
endif 

If used("mqtybrk")
    select mqtybrk
else
    use baitin!mqtybrk in 0 
endif                     

If used("mvendor")
    select mvendor
else
    use baitin!mvendor in 0 
endif            

If used("woexls")
   select woexls
else
   use woexls in 0
endif      
go top

do locate_detail_record


do find_cust_no
if empty(w_cust_no)
   @12,5 say "Customer cannot be located. Update program stoped."
    return
 endif      
 select mcustom
 locate for alltrim(mcustom.cust_no)== alltrim(w_cust_no)
 if eof()
    @12,5 say "Customer No. : "+alltrim(w_cust_no) + " not exist. Update program stoped."
    return
endif   
do find_oe_ship_from_to
do find_po_no
do find_field_name
do update_moe
do process_qty_breakdown

Procedure locate_detail_record
     select woexls
     go top
     do while !eof()
          if at("ITEM", upper(woexls.f01)) > 0 
             w_detail_pos=recno()
             n_item_no="woexls.f01"
             exit
          endif
          skip
     enddo 
             
Procedure find_cust_no

     w_cust_no=""
     finished=.f.
     w_field_no=1
     select woexls
     go top
     do while (recno("woexls") < w_detail_pos and finished <> .t.)
           do while (w_field_no < 50 and finished<> .t.)
                 field_name="woexls.f"+strzero(w_field_no,2)
                 if  at("CUSTOMER",upper(&field_name))> 0
                     w_ref_pos= at(":", &field_name)
                     if w_ref_pos > 0
                         w_cust_no=upper(alltrim(substr(&field_name,w_ref_pos+1, len(&field_name)-w_ref_pos)))
                         finished=.t.
                     endif    
                 endif
                 w_field_no=w_field_no+ 1
           enddo
           select woexls
           skip
           w_field_no=1
      enddo   

Procedure find_po_no
     po_no=""
     finished=.f.
     w_field_no=1
     select woexls
     go top
     do while (recno("woexls") < w_detail_pos and finished <> .t.)
           do while (w_field_no < 50 and finished<> .t.)
                 field_name="woexls.f"+strzero(w_field_no,2)
                 if  at("PO NO",upper(&field_name))> 0 OR ;
                     at("P.O. NO",upper(&field_name))> 0 OR;
                     at("P/O NO",upper(&field_name))> 0
                     w_ref_pos= at(":", &field_name)
                     if w_ref_pos > 0
                         w_po_no=upper(alltrim(substr(&field_name,w_ref_pos+1, len(&field_name)-w_ref_pos)))
                         finished=.t.
                     endif    
                 endif
                 w_field_no=w_field_no+ 1
           enddo
           select woexls
           skip
           w_field_no=1
      enddo   

  
Procedure find_oe_ship_from_to
     w_field_no=1
      finished=.f.
     select woexls
     go top
     do while (recno("woexls") < w_detail_pos and finished <> .t.)
           do while (w_field_no < 50 and finished<> .t.)
                 field_name="woexls.f"+strzero(w_field_no,2)
                 if at("SHIP DATE", upper(&field_name))>0 OR;
                    at("SHIPDATE", upper(&field_name))>0
                    do case 
                         case at("FROM", upper(&field_name)) > 0 and at("TO", upper(&field_name)) > 0
                                 from_pos=at("FROM", upper(&field_name))
                                 to_pos= at("TO", upper(&field_name))
                                 w_ship_from=ctod(substr(&field_name, from_pos+5, 10))
                                 w_ship_to=ctod(substr(&field_name, to_pos+3, 10))
                                  finished=.t.
                         otherwise
                                  w_ref_pos= at(":", &field_name)
                                  w_ship_from =ctod(alltrim(substr(&field_name, w_ref_pos+1, len(&field_name)-w_ref_pos)))
                                  w_ship_to=w_ship_from
                    endcase 
                 endif
                 w_field_no=w_field_no+ 1
           enddo
           select woexls
           skip
           w_field_no=1
      enddo                      
 
 Procedure find_field_name
       
        n_skn_no=""
        finished=.f.
        select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("SKN",upper(&field_name))> 0
                 n_skn_no=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo

       n_inner=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("INNER",upper(&field_name))> 0
                 n_inner=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo
       
       
       n_master=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no <50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("MASTER",upper(&field_name))> 0
                 n_master=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo
       
       
       n_qty=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("TOTAL PIECE",upper(&field_name))> 0 OR at("TOTAL QTY",upper(&field_name))> 0 OR;
                  at("TOT PIECE",upper(&field_name))> 0 OR at("TOT QTY",upper(&field_name))> 0 
                 n_qty=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo

      
      n_ctn=""
      finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("TOTAL CARTON",upper(&field_name))> 0 OR at("TOTAL CTN",upper(&field_name))> 0 OR;
                 at("TOT CARTON",upper(&field_name))> 0 OR at("TOT CTN",upper(&field_name))> 0
                 n_ctn=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo
              
        
       n_price=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("SELL PRICE",upper(&field_name))> 0 
                 n_price=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo
       
      
        n_retail=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("RETAIL",upper(&field_name))> 0 
                 n_retail=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo
       
       
       
       n_maker=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("MAKER",upper(&field_name))> 0 
                 n_maker=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo
       
       
       n_po_no=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("PO NO",upper(&field_name))> 0 or ;
                  at("P.O. NO",upper(&field_name))> 0 or;
                  at("P/O NO",upper(&field_name))> 0
                 n_po_no=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo

       n_ship_from=""
       n_ship_to=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("SHIP DATE",upper(&field_name))> 0 or ;
                  at("SHIPDATE",upper(&field_name))> 0
                 n_ship_from=field_name
                 n_ship_to=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo
      
      if empty(n_ship_from) 
         n_ship_from=""
         finished=.f.
         select woexls
         go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("SHIP FROM",upper(&field_name))> 0 OR;
                 at("SHIPFROM",upper(&field_name))> 0
                 n_ship_from=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
         enddo
       endif
         
       if empty(n_ship_to)
          n_ship_to=""
          finished=.f.
          select woexls
          go w_detail_pos
          w_field_no=2
          do while (w_field_no < 50 and finished<> .t.)
               field_name="woexls.f"+strzero(w_field_no,2)
               if  at("SHIP TO",upper(&field_name))> 0 OR;
                   at("SHIPTO",upper(&field_name))> 0
                   n_ship_to=field_name
                   finished=.t.
               endif    
              w_field_no=w_field_no+ 1
         enddo
       endif  
       
       
       n_remark=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("COMMENT",upper(&field_name))> 0 OR at("REMARK",upper(&field_name))> 0 
                 n_remark=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo
       
Procedure update_moe

      *select moe
      *locate for alltrim(moe.oe_no)== alltrim(w_oe_no) 
      *if !eof()
      *   select moe
      *   set filter to alltrim(moe.oe_no)== alltrim(w_oe_no) 
      *   delete all
       *  set filter to
      *endif
        delete from moe where alltrim(moe.oe_no)== alltrim(w_oe_prefix)+alltrim(w_oe_no) 
        delete from moebom where alltrim(moebom.oe_no)== alltrim(w_oe_prefix)+alltrim(w_oe_no) 
        delete from mqtybrk where alltrim(mqtybrk.oe_no)== alltrim(w_oe_prefix)+alltrim(w_oe_no)         
      
      select woexls
      go w_detail_pos +1
      do while !eof()
           if empty(&n_item_no) .or. &n_qty=0
              select woexls
              skip
              loop
           endif
           select moe         
           append blank
          do set_packing
          do set_vendor_maker
          do set_skn
          select moe
           replace moe.oe_no    with w_oe_no
           replace moe.cust_no  with w_cust_no
           replace moe.item_no with &n_item_no
           replace moe.qty         with numval(&n_qty)
           replace moe.unit        with "PCS."
           replace moe.ctn         with numval(&n_ctn)
           replace moe.price      with numval(&n_price)
*         replace moe.rp_1      with numval(&n_retail)
           replace moe.rp_remark_1      with &n_retail
           if !empty(n_po_no)
               replace moe.po_no with &n_po_no
           else
               replace moe.po_no with w_po_no
           endif    
           replace moe.item_desc with Mitem_cursor.desp
           replace moe.pack_pc_1 with w_pack_pc_1
           replace moe.pack_pc_2 with w_pack_pc_2
           replace moe.pack_pc_3  with w_pack_pc_3
           replace moe.pack_pc_4  with w_pack_pc_4
*           pack_1= space(5)+alltrim(Mitem.pack_desp_1)
*	   pack_2= "  "+iif(w_pack_pc_2=0,"   ",alltrim(str(w_pack_pc_2))+" ")+w_pack_desp_2
*	   pack_3= "  "+iif(w_pack_pc_3=0,"   ",alltrim(str(w_pack_pc_3))+" ")+w_pack_desp_3
*	   pack_4= "  "+iif(w_pack_pc_4=0,"   ",alltrim(str(w_pack_pc_4))+" ")+w_pack_desp_4
            pack_1= space(5)+alltrim(Mitem_cursor.pack_desp_1)
            if (w_pack_pc_2 = w_pack_pc_3 or w_pack_pc_2 = 0) and ;
               (at("INNER", upper(w_pack_desp_2))> 0 or at("PER DISPLAY BOX", upper(w_pack_desp_2)) > 0)
                   pack_2 = ""
            else
                pack_2= " "+iif(w_pack_pc_2=0  ," ",space(3-len(alltrim(str(w_pack_pc_2))))+alltrim(str(w_pack_pc_2)))+" "+w_pack_desp_2
            endif    
	   pack_3= " "+iif(w_pack_pc_3=0," ",space(3-len(alltrim(str(w_pack_pc_3))))+alltrim(str(w_pack_pc_3)))+" "+w_pack_desp_3
	   pack_4= " "+iif(w_pack_pc_4=0," ",space(3-len(alltrim(str(w_pack_pc_4))))+alltrim(str(w_pack_pc_4)))+" "+w_pack_desp_4

           replace moe.pack_desp with CHARCON(pack_1,pack_2,pack_3,pack_4)
    
           if empty(n_ship_from) and empty(n_ship_to)
             replace moe.from_date with w_ship_from
             replace moe.to_date      with w_ship_to
           else
             replace moe.from_date with ctod(alltrim(&n_ship_from))
             replace moe.to_date      with ctod(alltrim(&n_ship_to))
           endif   
              
           if !empty(&n_remark)
               replace moe.remark       with &n_remark
           endif    
           replace moe.date       with date()
           replace moe.user_id  with userid()
           replace moe.l_mod_date with date()
           replace moe.l_mod_time with substr(time(),1,8)
           replace moe.comp_code with w_password
           if w_password="HT"
               replace moe.oc_no with "HT-OC/"+ALLTRIM(w_oe_no)
           ELSE
               if w_password="INSP"
                  replace moe.oc_no with "IN-OC/"+ALLTRIM(w_oe_no)
               ELSE 
                  replace moe.oc_no with "BTL-"+ALLTRIM(W_OE_NO)
               ENDIF   
           endif
                  
           select woexls
           skip
    enddo            
    
Procedure Set_packing
          Select Desp, Price, Price_cur, Pack_pc_1, Pack_pc_2, Pack_pc_3,;
	             Pack_pc_4, Pack_desp_1,Pack_desp_2,Pack_desp_3,Pack_desp_4;
                     From Mitem Where Alltrim(Item_no) == Alltrim(&n_item_no) Into Cursor  Mitem_cursor 
            if reccount("Mitem_cursor") = 0
               w_pack_pc_1=0
               w_pack_pc_2=0
               w_pack_pc_3=0
               w_pack_pc_4=0
               w_pack_desp_1=""
               w_pack_desp_2="" 
               w_pack_desp_3=""
               w_pack_desp_4=""     
               return
           endif 
           w_min=999
           w_max=0
           w_min_index=0
           w_max_index=0
           if Mitem_cursor.pack_pc_1 > 0
              if Mitem_cursor.pack_pc_1 > w_max
                 w_max=Mitem_cursor.pack_pc_1
                 w_max_index=1
              endif
              if Mitem_cursor.pack_pc_1 < w_min
                  w_min=Mitem_cursor.pack_pc_1
                  w_min_index=1
              endif
           endif       
           if Mitem_cursor.pack_pc_2 > 0
              if Mitem_cursor.pack_pc_2 > w_max
                 w_max=Mitem_cursor.pack_pc_2
                 w_max_index=2
              endif
              if Mitem_cursor.pack_pc_2 < w_min
                  w_min=Mitem_cursor.pack_pc_2
                  w_min_index=2
              endif
           endif 
           if Mitem_cursor.pack_pc_3 > 0
              if Mitem_cursor.pack_pc_3 > w_max
                 w_max=Mitem_cursor.pack_pc_3
                 w_max_index=3
              endif
              if Mitem_cursor.pack_pc_3 < w_min
                  w_min=Mitem_cursor.pack_pc_3
                  w_min_index=3
              endif
           endif
           if Mitem_cursor.pack_pc_4 > 0
              if Mitem_cursor.pack_pc_4 > w_max
                 w_max=Mitem_cursor.pack_pc_4
                 w_max_index=4
              endif
              if Mitem_cursor.pack_pc_4 < w_min
                  w_min=Mitem_cursor.pack_pc_4
                  w_min_index=4
              endif
           endif                    
                           
           w_pack_pc_1=Mitem_cursor.pack_pc_1
           w_pack_pc_2=Mitem_cursor.pack_pc_2
           w_pack_pc_3=Mitem_cursor.pack_pc_3
           w_pack_pc_4=Mitem_cursor.pack_pc_4
           w_pack_desp_1=Mitem_cursor.pack_desp_1
           w_pack_desp_2=Mitem_cursor.pack_desp_2 
           w_pack_desp_3=Mitem_cursor.pack_desp_3
           w_pack_desp_4=Mitem_cursor.pack_desp_4                             
                     
           if w_min_index =1
              w_pack_pc_1 = numval(n_inner)
              w_pack_desp_1=mitem_cursor.pack_desp_1
           endif
           
           if w_min_index =2
              w_pack_pc_2 = numval(&n_inner)
              w_pack_desp_2=mitem_cursor.pack_desp_2
           endif 
           
           if w_min_index =2
              w_pack_pc_3 = numval(&n_inner)
              w_pack_desp_3=mitem_cursor.pack_desp_3
           endif
           
           if w_min_index =4
              w_pack_pc_4 = numval(&n_inner)
              w_pack_desp_4=mitem_cursor.pack_desp_4
           endif
           
           if w_max_index =1
              w_pack_pc_1 = numval(&n_master)
              w_pack_desp_1=mitem_cursor.pack_desp_1
           endif
           
           if w_max_index =2
              w_pack_pc_2 = numval(&n_master)
              w_pack_desp_2=mitem_cursor.pack_desp_2
           endif 
           
           if w_max_index =3
              w_pack_pc_3 = numval(&n_master)
              w_pack_desp_3=mitem_cursor.pack_desp_3
           endif
           
           if w_max_index =4
              w_pack_pc_4 = numval(&n_master)
              w_pack_desp_4=mitem_cursor.pack_desp_4
           endif
           
          
Procedure Set_vendor_maker
                   if upper(w_password) = "BAT"
				select fob, vendor_no,CUR_CODE from mitemven where item_no == alltrim(&n_item_no) and ;
				         (default==.t. OR ALLTRIM(VENDOR_NO) <> "BTL") into cursor mitemvendor_cursor
				replace moe.cur_code with mitemvendor_cursor.CUR_CODE
				replace moe.cost with mitemvendor_cursor.fob
				replace moe.lcl   with mitemvendor_cursor.lcl
				replace moe.vendor_no with mitemvendor_cursor.vendor_no
				if !empty(&n_maker)
				   replace moe.maker with alltrim(&n_maker)
				else
			           replace moe.maker with alltrim(mitemvendor_cursor.vendor_no)
				endif   
				select mitemvendor_cursor
				use
			endif

			if upper(w_password) = "HT" OR upper(w_password) = "INSP"
				select mitemven 
				if !empty(&n_maker)
				    LOCATE FOR ALLTRIM(item_no) == alltrim(&n_item_no) and alltrim(vendor_no) ==alltrim(upper(&n_maker))
				    replace moe.vendor_no with alltrim(upper(&n_maker))
				else    
				    LOCATE FOR ALLTRIM(item_no) == alltrim(&n_item_no) and alltrim(vendor_no) =="BTL"
				    replace moe.vendor_no with "BTL"
				endif    
				IF FOUND()
				     replace moe.cur_code with mitemven.CUR_CODE
				     replace moe.cost with  mitemven.fob
				     replace moe.lcl   with mitemvendor_cursor.lcl
				ENDIF
				if !empty(&n_maker)
				    select mvendor
		                    locate for alltrim(vendor_no)==alltrim(upper(&n_maker))
		                    if !eof()
		                       select moe
		                       replace moe.maker with alltrim(upper(&n_maker))
		                    else    
		                       select moe
		                       replace moe.maker with ""
		                    endif   
*				    replace moe.maker with alltrim(upper(&n_maker))
				else    
				    select fob, vendor_no,CUR_CODE from mitemven where item_no == alltrim(&n_item_no) and ;
				         (default==.t. OR ALLTRIM(VENDOR_NO) <> "BTL") into cursor mitemvendor_cursor
			            replace moe.maker with mitemvendor_cursor.vendor_no
			        endif    
			endif

Procedure Set_skn
       select mskn
       go top
       locate for alltrim(mskn.cust_no)==alltrim(w_cust_no) and alltrim(mskn.item_no)==alltrim(&n_item_no)
       if !eof()
           select moe
           replace moe.skn_no with mskn.skn_no
           replace moe.no_desc with mskn.no_desc
      else
           if !empty(n_skn_no)
               select moe
               replace moe.skn_no with &n_skn_no
           endif    
      endif           
 
Procedure Process_qty_breakdown
     n_port=""
     w_port_col=0
     w_port_row=0
     w_port_column=.f.
     finished=.f.
     w_field_no=1
     select woexls
     go top
     do while (recno("woexls") < w_detail_pos and finished <> .t.)
           do while (w_field_no < 50 and finished<> .t.)
                 field_name="woexls.f"+strzero(w_field_no,2)
                 if  at("PORT",upper(&field_name))> 0
                     finished=.t.
                     n_port=field_name
                     w_port_column=.t.
                     w_port_col=w_field_no
                     w_port_row=recno("woexls")
                 else
                     w_field_no=w_field_no+ 1
                 endif
           enddo
           if finished <> .t.
              select woexls
              skip
              w_field_no=1
           endif   
      enddo   
      
      do while w_port_column =.t.
           select woexls
           skip
           w_port=&n_port
           skip
           w_port_po=&n_port
           skip
           w_break_from=&n_port
           skip
           w_break_to=&n_port
           go w_detail_pos
           if at("Q",upper(&n_port)) > 0
              w_port_qty = .t.
           else
              w_port_qty= .f.
           endif       
           select woexls
           go w_detail_pos +1
           do while !eof()
                if numval(&n_port) = 0 .or.  empty(&n_item_no) .or. &n_qty=0
                   select woexls
                   skip
                   loop
                endif   
                select mqtybrk
                append blank
                replace mqtybrk.user_id with userid()
                replace mqtybrk.mod_date with date()
                replace mqtybrk.mod_time with substr(time(), 1, 8)
                replace mqtybrk.oe_no    with w_oe_no
                replace mqtybrk.item_no with &n_item_no
                replace mqtybrk.port with w_port
                replace mqtybrk.po_no with w_port_po
                replace mqtybrk.del_from with ctod(alltrim(w_break_from))
                 replace mqtybrk.del_to with ctod(alltrim(w_break_to))
                if w_port_qty = .t.
                    replace mqtybrk.qty with numval(&n_port)
                else
                    if numval(&n_inner) > 0
                        replace mqtybrk.qty with numval(&n_port) * numval(&n_master)
                    endif
                endif            
                select woexls
                skip
            enddo    
            n_port= "woexls.f"+strzero(w_port_col+1,2)
            go w_port_row
            if  at("PORT",upper(&n_port))> 0
                w_port_column=.t.
                w_port_col=w_port_col + 1
                w_port_row=recno("woexls")
            else
                w_port_column =.f.
            endif        
  enddo         