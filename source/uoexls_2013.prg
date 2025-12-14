*parameter strdate
Public w_field_no, finished, w_cust_no, w_detail_pos, w_ship_from, w_ship_to, w_po_no, w_port_row, w_port_col, w_port_column
Public w_port_po, w_port, w_port_qty, w_min, w_max, w_max_index, w_min_index
Public w_pack_pc_1, w_pack_pc_2, w_pack_pc_3, w_pack_pc_4,w_pack_desp_1, w_pack_desp_2, w_pack_desp_3, w_pack_desp_4
Public n_item_no, n_skn_no, n_inner, n_master, n_qty, n_ctn, n_price, n_chester,n_maker, n_vendor, n_remark, n_po_no, n_port, n_retail_1,n_retail_2, n_ship_from, n_ship_to, n_fob_port
Public n_cust_from_date, n_cust_to_date, w_cust_from_date, w_cust_to_date, n_date, n_cur_code, n_fcl, n_lcl, n_sku
public wh_item_no,w_head, field_array, n_sub_skn, w_item_field, n_item, w_remark, w_retail_1, w_retail_2, w_ship_from_fld, w_ship_to_fld, w_cust_ship_from_fld, w_cust_ship_to_fld
Public n_sub_skn_no, n_maker_ship_from, n_maker_ship_to   &&Victor
PUBLIC w_oe_date
w_oe_date=CTOD("01/01/01")
wh_item_no=""
w_head=.F.

********202306
w_oe_prefix=""

dimension field_array(50)
*if empty(strdate)
*	strdate = date()
*endif

If used("mitem")
   select mitem
else
   use baitin!mitem in 0
endif   
select mitem
set order to item_no

If used("mcustom")
   select mcustom 
else
   use baitin!mcustom in 0
endif   


If used("moectrl")
   select moectrl 
else
   use baitin!moectrl in 0
endif  

If used("moehd")
   select moehd 
else
   use baitin!moehd in 0
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

* open moebom.dbf
If used("moebom")
   select moebom
else
   Use baitin!moebom in 0
Endif

If Used("Mprodbom")
   Select("Mprodbom")
Else
   Use baitin!Mprodbom In 0
Endif
select mprodbom
set order to iprodbom

* end open moebom

If used("woexlst")
   select woexlst
else
   use woexlst in 0
endif      

If used("woexls")
   select woexls
else
   use woexls in 0 exclusive
endif      
go top

If used("wsknlog")
   select wsknlog
else
   use wsknlog in 0
endif      

If used("wsuspend")
   select wsuspend
else
   use wsuspend in 0
endif   

If used("zmftr")
    SELECT zmftr
else
    use baitin!zmftr in 0 
endif 

If used("mvendor")
    select mvendor
else
    use baitin!mvendor in 0 
endif 

w_detail_pos = 1

do locate_detail_record

select distinct woexlst.f01 from woexlst where recno() => w_detail_pos + 1 into cursor voeno

select voeno
go top

do while !eof()
     w_oe_no=alltrim(voeno.f01)
     w_oe_no_save=w_oe_no
     if empty(w_oe_no)
        select voeno
        skip
        loop
     endif 
     
     IF ALLTRIM(w_password)="INSP"
        w_oe_no="IN-"+ALLTRIM(w_oe_no)   
     ELSE 
         select moectrl
         set order to OE_NO
         seek w_oe_no
         if eof()
            messagebox(w_oe_no+" --- No OE Control Record"+ chr(10)+"Import Skipped", 0+16, "Syster Message")
             select voeno
             skip
             loop
         ENDIF
     ENDIF       

     @12,0 say "Importing OE :"+w_oe_no
     select woexls
     ZAP
     
     
     append from woexlst for recno()=1
     do append_woexls
     do set_qty
     *do set_remark
  
      do find_cust_no
    
      IF ALLTRIM(w_password)="INSP"
         DO find_oe_date
      ELSE 
         w_oe_date=moectrl.oe_date   
      ENDIF 
         
      IF ALLTRIM(w_password)<>"INSP"
         if alltrim(w_cust_no)<>alltrim(moectrl.cust_no) and !empty(w_oe_no)
            messagebox("OE No.:"+alltrim(w_oe_no) +" --- OE Control Record Cust Code Not Match"+ chr(10)+"Import Skipped", 0+16, "Syster Message")
            select voeno
            skip
            loop
          ENDIF
      ENDIF       
     select mcustom
     locate for alltrim(mcustom.cust_no)== alltrim(w_cust_no)
    w_show_sub_item=''
    if !eof()
       w_show_sub_item = mcustom.show_sub_item_detail
    endif   
   
    if w_del_repeat = .t.
        delete from moehd where alltrim(moehd.oe_no)== alltrim(w_oe_prefix)+alltrim(w_oe_no) 
    endif 
   
    select moehd
   set order to oe_no
   seek w_oe_no
   if eof() 
      append blank
      replace moehd.oe_no with w_oe_no
      *replace moehd.oe_date with moectrl.oe_date
      replace moehd.oe_date with w_oe_date
      replace moehd.cre_date with date()
      replace moehd.user_id with sysuserid
      replace moehd.cre_user with sysuserid
   endif   

    *do find_oe_ship_from
    *do find_oe_ship_to
    *do find_cust_ship_from
    *do find_cust_ship_to    
    do find_po_no
    do find_field_name
     
    do update_moe
    do update_mqtybrk
    Do Process_Moe
    
    do process_qty_breakdown

    select voeno
    skip
 enddo


Procedure append_woexls
        n_item=""
       finished=.f.
       select woexlst
        go top
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="f"+strzero(w_field_no,2)
             if  at("ITEM",upper(&field_name))> 0 
                 n_item=field_name
                 n_item_no="woexls.f"+strzero(w_field_no,2)
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
        enddo
        
        n_sub_skn=""
       finished=.f.
       select woexlst
        go top
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="f"+strzero(w_field_no,2)
             if  at("SUB SKN",upper(&field_name))> 0 or at("SUB SKU #",upper(&field_name))> 0
                 n_sub_skn=field_name
                 *n_sub_skn="woexls.f"+strzero(w_field_no,2)
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
        enddo

       n_sku=""
       finished=.f.
       select woexlst
        go top
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="f"+strzero(w_field_no,2)
             if  at("SKU #",upper(&field_name))> 0 
                 n_sku=field_name
                 *n_sub_skn="woexls.f"+strzero(w_field_no,2)
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
        enddo
        
        select woexls      
     *select * from woexlst group by f01, &n_item where f01=w_oe_no and (empty(&n_sub_skn) or alltrim(&n_sub_skn)='SEE BELOW') into cursor vtempoe
     select * from woexlst group by f01, &n_item where f01=w_oe_no_save and (empty(&n_sub_skn) or alltrim(&n_sub_skn)='SEE BELOW') into cursor vtempoe
     select vtempoe
   
     do while !eof()
          scatter to field_array
          select woexls
          append blank
          gather from field_array
          if alltrim(&n_sub_skn)='SEE BELOW' or alltrim(&n_sub_skn)='SEE BELOW'
              w_item_no=alltrim(&n_item_no)
              select woexlst
              go top
              *IF IF ALLTRIM(w_oe_no)=='022/16' AND ALLTRIM(&n_item_no) == '121584HSAV'
              *   XXX
              *ENDIF 
              *locate for f01=w_oe_no and alltrim(&n_item)==alltrim(w_item_no)
              locate for f01=w_oe_no_save and alltrim(&n_item)==alltrim(w_item_no)
              if !eof()
                  skip
              endif     
              do while alltrim(&n_sku)=='SEE ABOVE' and !eof() 
                  scatter to field_array
                  select woexls
                   append blank
                   gather from field_array
                   select woexlst
                   skip
              enddo  
          endif     
          select vtempoe
          skip
     enddo 
     
            
Procedure set_qty
       n_qty=""
       finished=.f.
       select woexlst
        go top
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="f"+strzero(w_field_no,2)
             if  at("TOTAL PIECE",upper(&field_name))> 0 OR at("TOTAL QTY",upper(&field_name))> 0 OR;
                  at("TOT PIECE",upper(&field_name))> 0 OR at("TOT QTY",upper(&field_name))> 0 
                 n_qty=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
        enddo
        
        n_item=""
       finished=.f.
       select woexlst
        go top
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="f"+strzero(w_field_no,2) 
             if  at("ITEM",upper(&field_name))> 0 
                 n_item=field_name
                 n_item_no="woexls.f"+strzero(w_field_no,2)
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
        enddo
        
        do find_oe_ship_from
        do find_oe_ship_to
        do find_cust_ship_from
        do find_cust_ship_to
        
        select woexls
        go 2
        do while !eof()
            w_qty_field='woexls.'+n_qty
            w_item_field='woexls.'+n_item
            select sum(val(&n_qty)) as tot_qty from woexlst into cursor temp where f01=w_oe_no_save and &n_item=&w_item_field
            
            select min(&w_ship_from_fld) as w_date from woexlst into cursor vtemp where  f01=w_oe_no_save and &n_item=&w_item_field
            w_ship_from = ctod(alltrim(vtemp.w_date))
                       
            select max(&w_ship_to_fld) as w_date from woexlst into cursor vtemp where  f01=w_oe_no_save and &n_item=&w_item_field
            w_ship_to= ctod(alltrim(vtemp.w_date))
                      
            select min(&w_cust_ship_from_fld) as w_date from woexlst into cursor vtemp where  f01=w_oe_no_save and &n_item=&w_item_field
            w_cust_from_date = ctod(alltrim(vtemp.w_date))   
            
            
             select max(&w_cust_ship_to_fld) as w_date from woexlst into cursor vtemp where  f01=w_oe_no_save and &n_item=&w_item_field
            w_cust_to_date = ctod(alltrim(vtemp.w_date))   
            
            select woexls
            replace &n_qty with alltrim(str(temp.tot_qty))
            replace &w_ship_from_fld with dtoc(w_ship_from)
            replace &w_ship_to_fld with dtoc(w_ship_to)
            replace &w_cust_ship_from_fld with dtoc(w_cust_from_date)
            replace &w_cust_ship_to_fld with dtoc(w_cust_to_date)
            
                        
            skip 1
        enddo  

Procedure set_remark
       n_remark=""
       finished=.f.
       select woexlst
        go top
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="f"+strzero(w_field_no,2)
             if  at("COMMENT",upper(&field_name))> 0
                 n_remark=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
        enddo

       n_retail_1=""
       finished=.f.
       select woexlst
        go top
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="f"+strzero(w_field_no,2)
             if  at("RETAIL1",upper(&field_name))> 0 OR  at("RETAIL PRICE 1",upper(&field_name))> 0
                 n_retail_1=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
        enddo   
        

       n_retail_2=""
       finished=.f.
       select woexlst
        go top
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="f"+strzero(w_field_no,2)
             if  at("RETAIL2",upper(&field_name))> 0 OR  at("RETAIL PRICE 2",upper(&field_name))> 0
                 n_retail_2=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
        enddo   
             
        n_item=""
       finished=.f.
       select woexlst
        go top
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="f"+strzero(w_field_no,2) 
             if  at("ITEM",upper(&field_name))> 0 
                 n_item=field_name
                 n_item_no="woexls.f"+strzero(w_field_no,2)
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
        enddo
        select woexls
   
        
       * select woexls
       * go 2
       * do while !eof()
            w_item_field='woexls.'+n_item
            select * from woexlst into cursor temp where f01=w_oe_no_save and &n_item=&w_item_field
            select temp
            w_remark=''
            w_retail_1=''
            w_retail_2=''
            w_remark_field='temp.'+n_remark
            do while !eof()
                w_remark_field='temp.'+n_remark
                if empty(&w_remark_field)
                   w_remark=alltrim(&w_remark_field)
                else    
                   w_remark=w_remark+alltrim(&w_remark_field)
                endif   
                w_field_no=val(substr(n_remark,2))+1
                field_name="f"+strzero(w_field_no,2)
                w_retail_1_field='temp.'+n_retail_1
                if empty(&w_retail_1_field)
                   w_retail_1=alltrim(&w_retail_1_field)
                else     &&20130612   
                  *w_retail_1=w_retail_1+chr(10)+alltrim(&w_retail_1_field)
                 **w_retail_1=w_retail_1+alltrim(&w_retail_1_field)
                  w_retail_1=alltrim(&w_retail_1_field)
                endif   
                if at(left(alltrim(w_retail_1),1),"0123456789") > 0
                   if at("FOR", upper(w_retail_1))=0
                      w_retail_1=alltrim(str(val(w_retail_1),6,2))
                   endif   
                endif    
                
                w_retail_2_field='temp.'+n_retail_2
                if empty(&w_retail_2_field)
                   w_retail_2=alltrim(&w_retail_2_field)
                else     &&20130612  
                  *w_retail_2=w_retail_2+chr(10)+alltrim(&w_retail_2_field)
                 **w_retail_2=w_retail_2+alltrim(&w_retail_2_field)
                   w_retail_2=alltrim(&w_retail_2_field)
                endif 
                if at(left(alltrim(w_retail_2),1),"0123456789") > 0
                     if at("FOR", upper(w_retail_2))=0
                       w_retail_2=alltrim(str(val(w_retail_2),6,2))
                    endif    
                endif    
                                  
                select woexlst
                do while (w_field_no < 50 and  at("COMMENT",upper(&field_name))> 0) 
                    select temp
                    *IF w_field_no=33
                    *   xxx
                    *ENDIF
                       
                    if !empty((&w_remark_field))
                       w_remark_field='temp.'+field_name
                       w_remark=w_remark+chr(10)+alltrim(&w_remark_field)
                    endif   
                    w_field_no=w_field_no+1
                    field_name="f"+strzero(w_field_no,2)
                    select woexlst
                enddo    
                select temp
                skip
            enddo 
     
   *        select woexls
           * replace &n_qty with alltrim(str(temp.tot_qty))
   *         skip 1
   *     enddo  

Procedure  update_mqtybrk
       n_port_code=""
       finished=.f.
       select woexlst
        go top
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexlst.f"+strzero(w_field_no,2)
             field_id="f"+strzero(w_field_no,2)
             if  at("PORT CODE",upper(&field_name))> 0 
                 n_port_code='temp.'+field_id
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
        enddo          
 
       n_ship_from=""
       finished=.f.
       select woexlst
        go top
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexlst.f"+strzero(w_field_no,2)
             field_id="f"+strzero(w_field_no,2)
             if  at("C SHIP FROM",upper(&field_name))> 0 
                 n_ship_from='temp.'+field_id
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
        enddo          

       * n_ship_to=""
       *finished=.f.
       *select woexlst
       * go top
       * w_field_no=2
       * do while (w_field_no < 50 and finished<> .t.)
        *     field_name="woexlst.f"+strzero(w_field_no,2)
         *    field_id="f"+strzero(w_field_no,2)
         *    if  at("C SHIP TO",upper(&field_name))> 0 
         *        n_ship_to='temp.'+field_id
          *       finished=.t.
          *   endif    
          *  w_field_no=w_field_no+ 1
        *enddo          

       w_qty=""
       finished=.f.
       select woexlst
        go top
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexlst.f"+strzero(w_field_no,2)
             field_id="f"+strzero(w_field_no,2)
             if  at("TOTAL QTY",upper(&field_name))> 0 
                 w_qty='temp.'+field_id
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
        enddo         
       

 IF !empty(n_port_code)
      select * from woexls group by f01, &n_item where f01=w_oe_no_save into cursor vtempoe 
      select vtempoe
      do while !eof()
           w_qty_field=n_qty
           w_item_field='vtempoe.'+n_item
           w_item_code=alltrim(&w_item_field)
          *select &n_qty as qty, count(&n_qty) as qty_count, * from woexlst into cursor temp where f01=w_oe_no and &n_item=&w_item_field
           select  count(&n_qty) as qty_count, * from woexlst into cursor vcount where f01=w_oe_no_save and alltrim(&n_item)==alltrim(w_item_code)
           select  * from woexlst into cursor temp where f01=w_oe_no_save and alltrim(&n_item)==alltrim(w_item_code)
          do while !eof() and vcount.qty_count > 1
               if empty(&n_port_code)
                  select temp
                  skip
                  loop
                endif    
                select mqtybrk
                append blank
                replace mqtybrk.user_id with userid()
                replace mqtybrk.mod_date with date()
                replace mqtybrk.mod_time with substr(time(), 1, 8)
                replace mqtybrk.oe_no    with alltrim(w_oe_prefix)+alltrim(w_oe_no)
                replace mqtybrk.item_no with w_item_code
                replace mqtybrk.port with &n_port_code
                w_port_po='temp.'+n_po_no
                replace mqtybrk.po_no with &w_port_po
                replace mqtybrk.del_from with ctod(alltrim(&n_ship_from))
                replace mqtybrk.del_to with ctod(alltrim(&n_ship_to))
                replace mqtybrk.qty with numval(&w_qty)
                select temp
                skip
            enddo    
            select vtempoe
            skip
       enddo     
endif   
        
Procedure locate_detail_record
     select woexls
     go top
     do while !eof()
          if at("OENO", upper(woexls.f01)) > 0 
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
     go w_detail_pos
     do while (w_field_no < 50 and finished<> .t.)
          field_name="woexls.f"+strzero(w_field_no,2)
          if  at("CUST",upper(&field_name))> 0
              skip
              w_cust_no=alltrim(&field_name)
              finished=.t.
          endif    
          w_field_no=w_field_no+ 1
      enddo

Procedure find_oe_date

     oe_date=""
     finished=.f.
     w_field_no=1
     select woexls
     go w_detail_pos
     do while (w_field_no < 50 and finished<> .t.)
          field_name="woexls.f"+strzero(w_field_no,2)
          if  at("OE DATE",upper(&field_name))> 0
              skip
              w_oe_date=CTOD(alltrim(&field_name))
              finished=.t.
          endif    
          w_field_no=w_field_no+ 1
      enddo   
   
Procedure find_po_no
     po_no=""
     w_field_no=1
      finished=.f.
     select woexls
     go top
     do while (w_field_no < 50 and finished<> .t.)
          field_name="woexls.f"+strzero(w_field_no,2)
          w_fld="f"+strzero(w_field_no,2)
          if at("PO NO", upper(&field_name))>0    
              select distinct(&w_fld) as w_po from woexlst into cursor vtemp where  f01=voeno.f01
              if reccount('vtemp')=1
                 w_po_no =  vtemp.w_po
              else
                  w_po_no = ""
              endif
              finished=.t.
          endif
          w_field_no=w_field_no+ 1
      enddo                           

  

 Procedure find_oe_ship_from
      w_field_no=1
      finished=.f.
     select woexls
     go top
     do while (w_field_no < 50 and finished<> .t.)
          field_name="woexls.f"+strzero(w_field_no,2)
          w_ship_from_fld="f"+strzero(w_field_no,2)
          if at("MAKER SHIP FROM", upper(&field_name))>0    
              *select min(&w_fld) as w_date from woexlst into cursor vtemp where  f01=voeno.f01
             * w_ship_from = ctod(alltrim(vtemp.w_date))
              finished=.t.
          endif
          w_field_no=w_field_no+ 1
      enddo                           

 Procedure find_oe_ship_to
      w_field_no=1
      finished=.f.
     select woexls
     go top
     do while (w_field_no < 50 and finished<> .t.)
          field_name="woexls.f"+strzero(w_field_no,2)
          w_ship_to_fld="f"+strzero(w_field_no,2)
          if at("MAKER SHIP TO", upper(&field_name))>0 
              *select max(&w_fld) as w_date from woexlst into cursor vtemp where  f01=voeno.f01 
              *w_ship_to = ctod(alltrim(vtemp.w_date))   
              finished=.t.
          endif
          w_field_no=w_field_no+ 1
      enddo                            
 
  Procedure find_cust_ship_from
      w_field_no=1
      finished=.f.
     select woexls
     go top
     w_cust_from_date=ctod('  /  /      ')
     do while (w_field_no < 50 and finished<> .t.)
          field_name="woexls.f"+strzero(w_field_no,2)
           w_cust_ship_from_fld="f"+strzero(w_field_no,2)
          if at("C SHIP FROM", upper(&field_name))>0 
             *select min(&w_fld) as w_date from woexlst into cursor vtemp where  f01=voeno.f01 
              *w_cust_from_date = ctod(alltrim(vtemp.w_date))   
              finished=.t.
          endif
          w_field_no=w_field_no+ 1
      enddo                           

  Procedure find_cust_ship_to
      w_field_no=1
      finished=.f.
     select woexls
     go top
     w_cust_to_date=ctod('  /  /      ')
     do while (w_field_no < 50 and finished<> .t.)
          field_name="woexls.f"+strzero(w_field_no,2)
          w_cust_ship_to_fld="f"+strzero(w_field_no,2)
          if at("C SHIP TO", upper(&field_name))>0  
             *select max(&w_fld) as w_date from woexlst into cursor vtemp  where  f01=voeno.f01 
              *w_cust_to_date = ctod(alltrim(vtemp.w_date)) 
              finished=.t.
          endif
          w_field_no=w_field_no+ 1
      enddo                    
 
 
 Procedure find_field_name
       
        n_skn_no=""
        finished=.f.
        select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("SKN",upper(&field_name))> 0 or  at("SKU",upper(&field_name))> 0
                 n_skn_no=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo

&& Victor
        n_sub_skn_no=""
        finished=.f.
        select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("SUB SKN",upper(&field_name))> 0 or at("SUB SKU #",upper(&field_name))> 0
                 n_sub_skn_no=field_name
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
       

       n_chester=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("CHESTER",upper(&field_name))> 0 
                 n_chester=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo  
   
      
        n_retail_1=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("RETAIL1",upper(&field_name))> 0 
                 n_retail_1=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo
       
        n_retail_2=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("RETAIL2",upper(&field_name))> 0 
                 n_retail_2=field_name
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

       n_vendor=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("VENDOR",upper(&field_name))> 0 
                 n_vendor=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo       

       n_cur_code=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("CURRENCY",upper(&field_name))> 0 
                 n_cur_code=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo       

       n_fcl=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("FCL",upper(&field_name))> 0 
                 n_fcl=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo            
       
       n_lcl=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("LCL",upper(&field_name))> 0 
                 n_lcl=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo            
       
       *n_date=""
       *finished=.f.
       *select woexls
       * go w_detail_pos
       * w_field_no=2
       * do while (w_field_no < 50 and finished<> .t.)
        *     field_name="woexls.f"+strzero(w_field_no,2)
        *     if  at("SPREAD SHEET SENT",upper(&field_name))> 0 
        *        skip
        *         n_date=ctod(alltrim(&field_name))
        *         finished=.t.
        *     endif    
        *    w_field_no=w_field_no+ 1
       *enddo       
       
       n_po_no=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             *field_name="woexls.f"+strzero(w_field_no,2)
             field_name="f"+strzero(w_field_no,2)
             if  at("PO NO",upper(&field_name))> 0 or ;
                  at("P.O. NO",upper(&field_name))> 0 or;
                  at("P/O NO",upper(&field_name))> 0
                 n_po_no=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo



 *      if empty(n_fob_port)
          n_fob_port=""
          finished=.f.
          select woexls
          go w_detail_pos
          w_field_no=2
          do while (w_field_no < 50 and finished<> .t.)
               field_name="woexls.f"+strzero(w_field_no,2)
               if  at("FOB PORT",upper(&field_name))> 0 OR;
                   at("F.O.B. PORT",upper(&field_name))> 0
                   n_fob_port=field_name
                   finished=.t.
               endif    
              w_field_no=w_field_no+ 1
         enddo
*       endif         
       
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
  
       n_ship_from=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("C SHIP FROM",upper(&field_name))> 0 
                  n_ship_from=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo

     n_ship_to=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("C SHIP TO",upper(&field_name))> 0 
                  n_ship_to=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo

       n_maker_ship_from=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("MAKER SHIP FROM",upper(&field_name))> 0 
                  n_maker_ship_from=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo

       n_maker_ship_to=""
       finished=.f.
       select woexls
        go w_detail_pos
        w_field_no=2
        do while (w_field_no < 50 and finished<> .t.)
             field_name="woexls.f"+strzero(w_field_no,2)
             if  at("MAKER SHIP TO",upper(&field_name))> 0 
                  n_maker_ship_to=field_name
                 finished=.t.
             endif    
            w_field_no=w_field_no+ 1
       enddo
  
       
Procedure update_moe
    
      
      if w_del_repeat = .t.
        * select moe
        *locate for alltrim(moe.oe_no)== alltrim(w_oe_prefix)+alltrim(w_oe_no) 
        *if !eof()
        *    select moe
        *    set filter to alltrim(moe.oe_no)== alltrim(w_oe_prefix)+alltrim(w_oe_no) 
        *    delete all
        *    set filter to
        * endif
        delete from moe where alltrim(moe.oe_no)== alltrim(w_oe_prefix)+alltrim(w_oe_no) 
        *delete from moehd where alltrim(moehd.oe_no)== alltrim(w_oe_prefix)+alltrim(w_oe_no) 
        delete from moebom where alltrim(moebom.oe_no)== alltrim(w_oe_prefix)+alltrim(w_oe_no) 
        delete from mqtybrk where alltrim(mqtybrk.oe_no)== alltrim(w_oe_prefix)+alltrim(w_oe_no)         
      endif 
      
      select woexls
      go w_detail_pos +1
    
      do while !eof()
            if empty(&n_item_no)
              select woexls
              skip
              loop
           endif
           select mitem
           x= alltrim(&n_item_no)
           seek alltrim(x)+space(15-len(alltrim(x)))
           if mitem.suspend_flag = .t.
               select wsuspend
               append blank
               replace wsuspend.item_no with &n_item_no
               select woexls
               skip
               loop
           endif
        
       * if alltrim(w_oe_no)=='999/12'
       *    xxx
        *endif    
        
        cur_pos=recno('woexls')
        do set_remark
        select woexls
        go cur_pos
        
       * xxx 202204
        
        
        select woexls
       if empty(&n_sub_skn) or alltrim(&n_sub_skn)=='SEE BELOW'
           w_head=.t.
            wh_item_no=alltrim(&n_item_no)
        else
           w_head=.f.
       endif      
  
        if  !empty(&n_sub_skn_no)  and alltrim(&n_sub_skn_no) <>  alltrim(IIF(Empty(wh_item_no),&n_item_no,wh_item_no) ) and w_head<>.t.  && sub item 
              Select Moebom
              Append Blank           
              Replace Moebom.oe_no    With alltrim(w_oe_prefix)+alltrim(w_oe_no)
              Replace Moebom.item_no  With IIF(Empty(wh_item_no),&n_item_no,wh_item_no) 
              Replace Moebom.Sub_item With &n_item_no
              Replace Moebom.qty      With numval(&n_qty)  
              Replace Moebom.price    With numval(&n_price) 
              Replace Moebom.Skn_no   With &n_sub_skn_no
             * Replace Moebom.retail   with &n_retail_1
  
  
 
             if val(w_retail_1) > 0 and len(alltrim(w_retail_1))>0
                 if at('$',w_retail_1) =0
                    w_retail_1='$'+alltrim(w_retail_1)
                 endif
              endif       
              Replace Moebom.retail   with w_retail_1
              *Replace Moebom.remark   with &n_remark
              Replace Moebom.remark   with w_remark
              Select Mprodbom
              IF !(alltrim(moebom.item_no)==alltrim(Moebom.sub_item))
                 seek moebom.item_no+ Moebom.sub_item
                 IF !Found()
                    Select Mprodbom
                    Append Blank
                    Replace Mprodbom.Item_no  With alltrim(Moebom.Item_no)
                    Replace Mprodbom.Sub_item With Alltrim(Moebom.Sub_item)
                    Replace Mprodbom.qty      With numval(&n_master) 
                 Else
                    Replace Mprodbom.Item_no  With alltrim(Moebom.Item_no)
                    Replace Mprodbom.Sub_item With Alltrim(Moebom.Sub_item)
                    Replace Mprodbom.qty      With numval(&n_master)                     
                 Endif
              Endif 
          select woexls
          if empty(&n_sub_skn) or alltrim(&n_sub_skn)=='SEE BELOW'
             w_head=.t.
             wh_item_no=alltrim(&n_item_no)
          else
             w_head=.f.
         endif      
                  
         IF w_head
              Select Moe && Begin updata dbf moe fields fob_port,from_date,to_date,cust_from_date,cust_to_date,remark *by duan
              Locate For Alltrim(Moe.oe_no)== alltrim(w_oe_prefix)+alltrim(w_oe_no) And Alltrim(Moe.item_no) == alltrim(wh_item_no)
              IF Found()
                  replace moe.from_date with  ctod(&n_maker_ship_from)
                 replace moe.to_date   with  ctod(&n_maker_ship_to)               
                 replace moe.cust_from_date  with ctod(&n_ship_from)
                 replace moe.cust_to_date    with ctod(&n_ship_to)
                 replace moe.cur_code with &n_cur_code
                 replace moe.cost with numval(&n_fcl) 
                 replace moe.lcl with numval(&n_lcl) 
                 
                 if !empty(n_fob_port)
                    replace moe.fob_port with &n_fob_port
                 endif 
                 
                 
*                 if !empty(&n_remark)
*                    replace moe.remark with &n_remark
*                 endif   

                 if !empty(w_remark)
                    replace moe.remark with w_remark
                 endif   
                 
*                 if !empty(n_retail_1)
*                    replace moe.rp_remark_1  with &n_retail_1
*                 endif  
                
                 if val(w_retail_1) > 0  and  len(alltrim(w_retail_1))>0
                     if at('$',w_retail_1) =0
                        w_retail_1='$'+alltrim(w_retail_1)
                     endif
                  endif  
                 replace moe.rp_remark_1  with w_retail_1

*                 if !empty(n_retail_2)
*                     replace moe.rp_remark_2 with &n_retail_2
*                 endif                     
                 if val(w_retail_2) > 0 and  len(alltrim(w_retail_2))>0
                     if at('$',w_retail_2) =0
                        w_retail_2='$'+alltrim(w_retail_2)
                     endif
                  endif  
                replace moe.rp_remark_2 with w_retail_2


              Endif   &&End update  *by duan
              do append_moe
              w_head = .F.
              Endif
         Else             
              do append_moe
         Endif  
       Select woexls
       Skip       
    Enddo       

Procedure append_moe
            select moe         
             append blank
             do set_packing
             do set_vendor_maker
             do set_skn
             select moe                      
             replace moe.oe_no    with alltrim(w_oe_prefix)+alltrim(w_oe_no)
             replace moe.cust_no  with w_cust_no
             replace moe.item_no  with &n_item_no           
             replace moe.ctn      with numval(&n_ctn)
             replace moe.qty      with numval(&n_qty) 
             replace moe.unit     with "PCS." 
             replace moe.price    with numval(&n_price)
             replace moe.chester  WITH numval(&n_chester)
             if val(w_retail_1) > 0  and len(alltrim(w_retail_1))>0
                 if at('$',w_retail_1)=0
                    w_retail_1='$'+alltrim(w_retail_1)
                 endif
              endif  
              replace moe.rp_remark_1  with w_retail_1
              if val(w_retail_2) > 0 and  len(alltrim(w_retail_2))>0
                 if at('$',w_retail_2) =0
                    w_retail_2='$'+alltrim(w_retail_2)
                 endif
              endif  

                replace moe.rp_remark_2      with w_retail_2
             if !empty(n_po_no)
                temp_po_no='woexls.'+n_po_no
                replace moe.po_no with &temp_po_no
             else
                replace moe.po_no with w_po_no
             endif    
             replace moe.item_desc with Mitem_cursor.desp
             replace moe.pack_pc_1 with w_pack_pc_1
             replace moe.pack_pc_2 with w_pack_pc_2             
             *replace moe.pack_pc_3 with IIF(w_pack_pc_3=0,numval(&n_master),w_pack_pc_3) &&modify by duan
             replace moe.pack_pc_3 with w_pack_pc_3  
             replace moe.pack_pc_4 with w_pack_pc_4
             if w_pack_pc_1 > 999 or w_pack_pc_2 > 999 or w_pack_pc_3 > 999 or w_pack_pc_4 > 999
                pack_1= space(6)+alltrim(Mitem_cursor.pack_desp_1)
                if (w_pack_pc_2 = w_pack_pc_3 or w_pack_pc_2 = 0) and (at("INNER", upper(w_pack_desp_2))> 0 or at("PER DISPLAY BOX", upper(w_pack_desp_2)) > 0)
                    pack_2 = ""
                else
                    pack_2= " "+iif(w_pack_pc_2=0  ," ",space(4-len(alltrim(str(w_pack_pc_2))))+alltrim(str(w_pack_pc_2)))+" "+w_pack_desp_2
                endif    
                pack_3= " "+iif(w_pack_pc_3=0," ",space(4-len(alltrim(str(w_pack_pc_3))))+alltrim(str(w_pack_pc_3)))+" "+w_pack_desp_3
                pack_4= " "+iif(w_pack_pc_4=0," ",space(4-len(alltrim(str(w_pack_pc_4))))+alltrim(str(w_pack_pc_4)))+" "+w_pack_desp_4
             else
                pack_1= space(5)+alltrim(Mitem_cursor.pack_desp_1)
                if (w_pack_pc_2 = w_pack_pc_3 or w_pack_pc_2 = 0) and (at("INNER", upper(w_pack_desp_2))> 0 or at("PER DISPLAY BOX", upper(w_pack_desp_2)) > 0)
                    pack_2 = ""
                else
                    pack_2= " "+iif(w_pack_pc_2=0  ," ",space(3-len(alltrim(str(w_pack_pc_2))))+alltrim(str(w_pack_pc_2)))+" "+w_pack_desp_2
                endif    
                pack_3= " "+iif(w_pack_pc_3=0," ",space(3-len(alltrim(str(w_pack_pc_3))))+alltrim(str(w_pack_pc_3)))+" "+w_pack_desp_3
                pack_4= " "+iif(w_pack_pc_4=0," ",space(3-len(alltrim(str(w_pack_pc_4))))+alltrim(str(w_pack_pc_4)))+" "+w_pack_desp_4
             endif    
           
             replace moe.pack_desp with CHARCON(pack_1,pack_2,pack_3,pack_4)
 
              replace moe.from_date with  ctod(&n_maker_ship_from)
                 replace moe.to_date   with  ctod(&n_maker_ship_to)               
                 replace moe.cust_from_date  with ctod(&n_ship_from)
                 replace moe.cust_to_date    with ctod(&n_ship_to)
                  replace moe.cur_code with &n_cur_code
                 replace moe.cost with numval(&n_fcl) 
                 replace moe.lcl with numval(&n_lcl) 
             if !empty(n_fob_port)
                replace moe.fob_port with &n_fob_port
             endif               

*          if !empty(&n_remark)
*             replace moe.remark with &n_remark
*          endif   
          


            if !empty(w_remark)
               replace moe.remark with w_remark
             endif      
             *replace moe.date       with n_date
             *replace moe.date       with moectrl.oe_date
             replace moe.date       with w_oe_date
             replace moe.user_id    with userid()
             replace moe.l_mod_date with date()
             replace moe.l_mod_time with substr(time(),1,8)
             replace moe.comp_code  with w_password
             do case 
                 case w_password="HT"
                        replace moe.oc_no with "HT-OC/"+ALLTRIM(w_oe_no)
                 case w_password = "BAT"
                        replace moe.oc_no with "BTL-"+ALLTRIM(W_OE_NO)
                 case w_password = "HFW"
                        replace moe.oc_no with "HFW-OC/"+ALLTRIM(W_OE_NO)  
                 case w_password="INSP"
                        replace moe.oc_no with "IN-OC/"+ SUBSTR(ALLTRIM(w_oe_no),4)                             
             endcase      
             wh_item_no = alltrim(&n_item_no)
             w_head = .T.
  
Procedure Set_packing
          Select Desp, Price, Price_cur, Pack_pc_1, Pack_pc_2, Pack_pc_3,;
	             Pack_pc_4, Pack_desp_1,Pack_desp_2,Pack_desp_3,Pack_desp_4, suspend_flag, item_no;
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
           
          
*Procedure Set_vendor_maker
*           x= &n_maker
*           if upper(w_password) = "BAT" or upper(w_password) = "HFW"
*				select fob, vendor_no,CUR_CODE from mitemven where item_no == alltrim(&n_item_no) and ;
*				         (default=.t. OR ALLTRIM(VENDOR_NO) <> "BTL") into cursor mitemvendor_cursor
*                               select moe
*				replace moe.cur_code with mitemvendor_cursor.CUR_CODE
*				replace moe.cost with mitemvendor_cursor.fob
*				replace moe.vendor_no with mitemvendor_cursor.vendor_no
*				
*				if !empty(&n_maker)
*				   replace moe.maker with alltrim(upper(&n_maker))
*				else
*			       replace moe.maker with mitemvendor_cursor.vendor_no
*				endif   
*				select mitemvendor_cursor
*				use
*			endif

*			if upper(w_password) = "HT"
*				select mitemven 
*				if !empty(&n_maker)
*				    LOCATE FOR ALLTRIM(item_no) == alltrim(&n_item_no) and alltrim(vendor_no) ==alltrim(upper(&n_maker))
*				    select moe
*				    replace moe.vendor_no with alltrim(upper(&n_maker))
*				else    
*				    LOCATE FOR ALLTRIM(item_no) == alltrim(&n_item_no) and alltrim(vendor_no) =="BTL"
*				    select moe
*				    replace moe.vendor_no with "BTL"
*				endif    
				
*				IF FOUND("mitemven")
*				    select moe
*				     replace moe.cur_code with mitemven.CUR_CODE
*				     replace moe.cost with  mitemven.fob
*				ENDIF
				
*				select moe
*				if !empty(&n_maker)
*				    replace moe.maker with upper(&n_maker)
*				else    
*				    select fob, vendor_no,CUR_CODE from mitemven where item_no == alltrim(&n_item_no) and ;
*				         (default=.t. OR ALLTRIM(VENDOR_NO) <> "BTL") into cursor mitemvendor_cursor
*			        select moe
*			        replace moe.maker with mitemvendor_cursor.vendor_no
*			        endif    
*			endif


Procedure Set_vendor_maker
*          x= &n_maker
           do case 
                case upper(w_password) = "BAT" or upper(w_password) = "HFW"
                       select moe
                       replace moe.vendor_no with alltrim(upper(&n_maker))
                       select fob, vendor_no,cur_code from mitemven where item_no == alltrim(&n_item_no) and ;
				        alltrim(vendor_no) == alltrim(&n_maker) into cursor mitemvendor_cursor
                       if !empty("mitemvendor_cursor")
                          select moe
		          replace moe.cur_code with mitemvendor_cursor.cur_code
		          replace moe.cost with mitemvendor_cursor.fob
		       endif    
		       select mitemvendor_cursor
		       use
			
		   case upper(w_password) = "HT" OR  upper(w_password) = "INSP"
		          select moe
		          replace moe.vendor_no with alltrim(upper(&n_vendor))
		          
		         * IF ALLTRIM(&n_item_no) == '90484'
                 *    XXX
                 * ENDIF 
		          
		          if !empty(n_maker)
		             *select mvendor
		             *locate for alltrim(vendor_no)==alltrim(upper(&n_maker))
		             select zmftr
		             GO top
		             locate for alltrim(zmftr.mftr_code)==alltrim(upper(&n_maker))
		             if !eof()
		                select moe
		                replace moe.maker with alltrim(upper(&n_maker))
		             else    
		                select moe
		                replace moe.maker with ""
		             endif   
		          endif   
			  select mitemven 
			  if !empty(&n_vendor)
			     locate for alltrim(item_no) == alltrim(&n_item_no) and alltrim(vendor_no) ==alltrim(upper(&n_vendor))
  		             if found("mitemven")
			         select moe
			         replace moe.cur_code with mitemven.cur_code
			         replace moe.cost with  mitemven.fob
			         replace moe.lcl   with  mitemven.lcl
			     endif
		          endif    
	    endcase 	


Procedure Set_skn
       
       select mskn
       if !empty(&n_skn_no)       
       
               
            
            select moe
            replace moe.skn_no with &n_skn_no
            select mskn
            set order to iskn
            w_cust_no = alltrim(w_cust_no)+space(10-len(alltrim(w_cust_no)))
            if vartype(&n_item_no) = "C"
               w_item_no = alltrim(&n_item_no)+space(15-len(alltrim(&n_item_no)))
            else
               seek w_cust_no + alltrim(str(&n_item_no))+space(15-len(alltrim(str(&n_item_no))))    
            endif   
            seek w_cust_no+w_item_no
            if eof()
                append blank
                replace mskn.cust_no with w_cust_no
                replace mskn.item_no with w_item_no
                replace mskn.skn_no  with &n_skn_no
            else
                if alltrim(mskn.skn_no)<>alltrim(&n_skn_no)
                    select wsknlog
                    append blank
                    replace wsknlog.cust_no    with w_cust_no
                    replace wsknlog.item_no    with w_item_no
                    replace wsknlog.skn_no_o with mskn.skn_no
                    replace wsknlog.skn_no_n with &n_skn_no
                    select mskn
                    replace mskn.skn_no with &n_skn_no    
                endif   
            endif            
       Else
            go top
            locate for alltrim(mskn.cust_no)==alltrim(w_cust_no) and alltrim(mskn.item_no)==alltrim(&n_item_no)
            if !eof()
                select moe
                replace moe.skn_no with mskn.skn_no
                replace moe.no_desc with mskn.no_desc
           endif
       endif    

Procedure Process_Moe
    select moe
    set order to ioe
    seek alltrim(w_oe_prefix)+alltrim(w_oe_no)
    Do While alltrim(moe.oe_no)==alltrim(w_oe_prefix)+alltrim(w_oe_no) and !eof()
          select oe_no, item_no, sub_item, qty, price from moebom where oe_no = alltrim(w_oe_prefix)+alltrim(w_oe_no) into cursor vmoebom_item
          select sum(qty) as Pack_qty, sum(qty*price) as tot_price from vmoebom_item;
                   where oe_no = alltrim(w_oe_prefix)+alltrim(w_oe_no) and item_no = moe.item_no into cursor vmoebom 
          if !eof("vmoebom")
             select moe
             if vmoebom.pack_qty > 0
                replace moe.qty    with vmoebom.pack_qty
                replace moe.price with round(vmoebom.tot_price / vmoebom.pack_qty,4)   
             endif   
             select a.*, b.qty as mprodbom_qty from mprodbom a ; 
                          inner join vmoebom_item b on a.item_no = b.item_no and  a.sub_item = b.sub_item;
                             into cursor vprodbom_item where a.item_no = moe.item_no 
             select sum(mprodbom_qty) as tot_qty, sum(qty) as tot_ctn_qty from vprodbom_item into cursor vtot_ctn               
*            select sum(mprodbom_qty/ qty) as tot_ctn from vprodbom_item into cursor vtot_ctn
             select moe
             replace moe.ctn with vtot_ctn.tot_qty /vtot_ctn.tot_ctn_qty             
             If Empty(moe.pack_pc_2)
                Replace moe.pack_pc_2 with vtot_ctn.tot_ctn_qty
             Endif 
*             select moe                
*             Replace Moe.rp_remark_1 with " "
          endif    
          Select Moe
          Skip
   Enddo

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
                if numval(&n_port) = 0
                   select woexls
                   skip
                   loop
                endif   
                select mqtybrk
                append blank
                replace mqtybrk.user_id with userid()
                replace mqtybrk.mod_date with &n_date
                replace mqtybrk.mod_time with substr(time(), 1, 8)
                replace mqtybrk.oe_no    with alltrim(w_oe_prefix)+alltrim(w_oe_no)
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
  
Procedure Process_Moe_qty    
    Select moe
    Set order to ioe
    Seek alltrim(w_oe_prefix)+alltrim(w_oe_no)
           
    Do While alltrim(moe.oe_no)==alltrim(w_oe_no) and !eof()
       w_item_no = moe.item_no
       SELECT Moebom.item_no, Moebom.sub_item, Moebom.qty, Moebom.price, Moebom.retail, Moebom.remark, Mprodbom.qty As pack_qty;          
          FROM  Moebom INNER JOIN Mprodbom ;
          ON  alltrim(Moebom.item_no)+alltrim(Moebom.sub_item) == alltrim(Mprodbom.item_no)+alltrim( Mprodbom.sub_item);
          Into Cursor Temp Where Alltrim(Moebom.item_no)==alltrim(w_item_no)
       IF !Eof()      
          Select Sum(Temp.qty) As qty,sum(temp.price*temp.pack_qty) As sum_price,sum(temp.pack_qty) As sum_pack From Temp;
                 into cursor temp1
          Select moe
          Replace moe.qty with temp1.qty
          Replace moe.price with temp1.sum_price/temp1.sum_pack
          Replace moe.ctn with temp1.qty/temp1.sum_pack  
       Endif   
       Select Moe
       Skip
   Enddo
   
   