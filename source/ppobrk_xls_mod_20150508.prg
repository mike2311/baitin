
select mcustom
set order to cust_no
select moe
set order to ioeitem
select mqtybrk
set order to iqtybrk

public w_row,w_range,w_item_start,w_port_row,w_max_port,w_pcs, w_port_col,w_prv_cust_no,w_add_row
public w_row_ref
w_port_col=8
w_add_row = 0
w_prv_cust_no = ""
w_range = ""
eole=CREATEOBJECT("Excel.application")
eole.Workbooks.add
i= 4


select * from wpobrkgrid into cursor wpobrkgrid_1 where select
select * from moe into cursor vTmpMoe where alltrim(oe_no) in (select alltrim(oe_no) from wpobrkgrid_1) and !empty(oe_no) and cxl_flag = 0  order by vendor_no, item_no
Select a.*, b.cust_no from mqtybrk a inner join vTmpMoe b on a.oe_no == b.oe_no and a.item_no == b.item_no into cursor vTmpQtyBrk order by a.del_from, a.po_no, a.item_no
select a.*, nvl(b.port_name,space(50)) as port_name, nvl(b.port_grp,"") as port_grp from vTmpQtyBrk a left outer join mshipmark b on a.cust_no == b.cust_no and a.port == b.port into cursor vTmpQtyBrk order by port_grp, b.port
select a.*, nvl(b.row_ref," ") as row_ref, nvl(b.port,space(20)) as port, b.port_grp from vTmpMoe a left outer join vTmpQtyBrk b on a.oe_no == b.oe_no and a.item_no == b.item_no into cursor vTmpMoe group by a.oe_no, row_ref, a.vendor_no, a.item_no order by a.oe_no, row_ref desc, a.vendor_no, a.item_no
*select a.*, nvl(b.row_ref," ") as row_ref, nvl(b.port,space(20)) as port from vTmpMoe a left outer join vTmpQtyBrk b on a.oe_no == b.oe_no and a.item_no == b.item_no into cursor vTmpMoe group by a.oe_no, row_ref, a.vendor_no, a.item_no order by a.oe_no, port_grp, row_ref desc, a.vendor_no, a.item_no
select wpobrkgrid_1

go top



strOeRow = ""
do while !eof()
 *20111019       select * from vTmpMoe into cursor coe where alltrim(oe_no)==alltrim(wpobrkgrid_1.oe_no) order by  port_grp, row_ref desc, vendor_no, item_no  && 080524
  select * from vTmpMoe into cursor coe where alltrim(oe_no)==alltrim(wpobrkgrid_1.oe_no) order by  row_ref desc , port_grp,  vendor_no, item_no  
 
*         select a.*,  nvl(b.port_grp,space(20)) as port_grp from vTmpMoe a ;
 *                            left outer join mshipmark b on a.cust_no == b.cust_no and a.port == b.port into cursor coe ;
  *                               where alltrim(oe_no)==alltrim(wpobrkgrid_1.oe_no)  ;
   *                                      order by port_grp, row_ref desc, vendor_no, item_no 
       
        do while !eof() and alltrim(coe.oe_no) == alltrim(wpobrkgrid_1.oe_no)
                  if !(alltrim(strOeRow) == alltrim(coe.oe_no) + alltrim(coe.row_ref))
		     w_oe_ref =coe.row_ref
************************************************************************
*** Open New Sheet and write header
************************************************************************     
	     	
	     	  if i > 4
	       	     do set_qtybrk    && setup qty brk for existing worksheet
	     	  endif  
                   w_row_ref = coe.row_ref
	     	
		strWorkName = "Sheet" +  transform(i)
	
		eole.Worksheets.add()
		eole.Worksheets(strWorkName).Activate
		eole.Worksheets(strWorkName).name = "OE# "+ strTran(Alltrim(coe.oe_no),"/","-") + iif(empty(coe.row_ref),"","(" + coe.row_ref + ")")
		eole.visible=.t.
		 i=i+1
		eole.ActiveSheet.PageSetup.Orientation=2
		eole.ActiveSheet.PageSetup.PrintTitleRows="$1:$5"
		eole.ActiveSheet.Columns(1).ColumnWidth=15
		eole.ActiveSheet.Columns(2).ColumnWidth=25
		eole.ActiveSheet.Columns(3).ColumnWidth=4
		eole.ActiveSheet.Columns(4).ColumnWidth=7

		if w_password = "HT"
		    eole.cells(1,5).Value="  HOLIDAY TIMES UNLIMITED, INC."
		else
		    eole.cells(1,5).value="    Baitin Trading Limited"  
		endif      
		eole.cells(1,5).Font.Size=16
		eole.cells(1,5).Font.Bold=.t.
		eole.cells(2,1).Value="Date : "+alltrim(dtoc(date()))+ " " + substr(time(),1,5)
		eole.cells(2,5).Value="P.O.  Quantity  Breakdown"
		eole.cells(2,5).Font.Size=16
		eole.cells(2,5).Font.Bold=.t.
		w_row = 4

		eole.cells(w_row,1).Value="O.E. No. : "+Alltrim(wpobrkgrid_1.oe_no)
		select mcustom
		seek wpobrkgrid_1.cust_no
		if !found()
			messagebox("Error")
		endif
		
		if w_prv_cust_no == alltrim(wpobrkgrid_1.cust_no)
		        w_row=w_row+1
			eole.cells(w_row,1).Value="Customer : "+Alltrim(wpobrkgrid_1.cust_no)+"/"+alltrim(mcustom.ename)
		else
			w_row=w_row+1
			eole.cells(w_row,1).Value="Customer : "+Alltrim(wpobrkgrid_1.cust_no)+"/"+alltrim(mcustom.ename)
		endif
		w_prv_cust_no = alltrim(wpobrkgrid_1.cust_no)
		w_row = w_row+2
		eole.cells(w_row,7).value="PORT CODE:"
		w_row=w_row+1
		eole.cells(w_row,7).value="DESTINATION:"	
		w_row=w_row+1
		eole.cells(w_row,7).value="PO NO.:"
	
		DO CASE
		   CASE alltrim(wpobrkgrid_1.cust_no) == "MICHAEL" 
		             w_add_row=1
		             w_row=w_row+1
		             eole.cells(w_row,7).value="EVENT CODE"  	   
		   CASE alltrim(wpobrkgrid_1.cust_no) == "ECKERD"
		             w_add_row=1
		             w_row=w_row+1
		             eole.cells(w_row,7).value="DEST CODE"  
		  CASE alltrim(wpobrkgrid_1.cust_no) == "MARKSTEVEN"
		             w_add_row=1
		             w_row=w_row+1
		             eole.cells(w_row,7).value="WAREHOUSE NO." 
		   otherwise
		            w_add_row=0                     	 	             
	        ENDCASE
	      
		w_row=w_row+1
		eole.cells(w_row,7).value="SHIP FROM:"
		w_row=w_row+1
		eole.cells(w_row,7).value="SHIP TO:"
		w_range="A"+alltrim(str(w_row-4- w_add_row))+":A"+alltrim(str(w_row))
		eole.ActiveSheet.Range(w_range).Borders(1).LineStyle=1
		w_range="G"+alltrim(str(w_row-4- w_add_row))+":G"+alltrim(str(w_row)) 
		eole.ActiveSheet.Range(w_range).HorizontalAlignment=4
		w_range="A"+alltrim(str(w_row-4- w_add_row))+":G"+alltrim(str(w_row-4- w_add_row))
		eole.ActiveSheet.Range(w_range).Borders(3).LineStyle=1
		w_range="A"+alltrim(str(w_row))+":G"+alltrim(str(w_row)) 
			eole.ActiveSheet.Range(w_range).Borders(4).LineStyle=1
		
		w_row=w_row+1
		w_item_start=w_row
		eole.cells(w_row,1).Value="Item No."
		eole.cells(w_row,2).Value="SKN #"
		eole.cells(w_row,3).Value="Unit Price"
		eole.cells(w_row,5).Value="Vendor"
		eole.cells(w_row,6).Value="Total Qty"
		eole.cells(w_row,7).Value="Total Ctn"
		
		eole.cells(1,6).Font.Bold=.t.
		
	        w_port_row=w_row - 5
	        w_max_port=6	
		
************************************************************************     	
	        endif
		strOeRow = alltrim(coe.oe_no) + alltrim(coe.row_ref)        

		w_row=w_row+1
		select MCUSTOM
		locate for alltrim(mcustom.cust_no)==alltrim(coe.cust_no)
		w_cur_code=mcustom.cur_code
		eole.cells(w_row,1).value="'"+alltrim(coe.item_no)
		eole.cells(w_row,2).value = "'"+coe.Skn_no
*		eole.cells(w_row,3).value=coe.Cur_code
		eole.cells(w_row,3).value=w_cur_code
		eole.cells(w_row,4).value=coe.Price
		eole.cells(w_row,4).NumberFormatLocal="0.0000"
		eole.cells(w_row,5).value=coe.Vendor_no
		eole.cells(w_row,6).value=coe.Qty
		eole.cells(w_row,7).value=coe.Ctn        
		w_pcs = Max(coe.pack_pc_1,coe.pack_pc_2,coe.pack_pc_3,coe.pack_pc_4)
		strOeItem = alltrim(coe.oe_no) + alltrim(coe.item_no)        
                  
*                do set_qtybrk
              
               if w_max_port <26  
                  w_range="A"+alltrim(str(w_item_start))+":"+chr(64+w_max_port+1)+alltrim(str(w_row))
               else
                  if w_max_port < 52
                      w_range="A"+alltrim(str(w_item_start))+":A"+chr(64+w_max_port+1 - 26)+alltrim(str(w_row))
                  else
                      w_range="A"+alltrim(str(w_item_start))+":B"+chr(64+w_max_port+1 - 52)+alltrim(str(w_row))   
                  endif    
               endif   


               eole.ActiveSheet.Range(w_range).Borders(1).LineStyle=1
               eole.ActiveSheet.Range(w_range).Borders(2).LineStyle=1
               eole.ActiveSheet.Range(w_range).Borders(3).LineStyle=1
               eole.ActiveSheet.Range(w_range).Borders(4).LineStyle=1
         
              select coe
        	     skip
        enddo

        do set_qtybrk
       
       w_row=w_row+4

	select wpobrkgrid_1
	skip
enddo




Procedure Set_qtybrk
               Select * from vTmpQtyBrk into cursor vTmpQtyBrk_1 where alltrim(vtmpqtybrk.row_ref) == alltrim(w_row_ref);
                           order by port_grp, Del_from,   po_no  && 080524            

               Do While !Eof()   	
   			w_port_col=8
			LOCAL w_port_value, w_xls_port, w_po_value, w_xls_po
			w_port_value = eole.cells(w_port_row-w_add_row, w_port_col).value
			IF vartype(w_port_value) = "N"
				w_xls_port = alltrim(str(w_port_value))
			ELSE
				w_xls_port = w_port_value
			ENDIF
			w_po_value = eole.cells(w_port_row-w_add_row+2, w_port_col).value			
			IF vartype(w_po_value) = "N"
				w_xls_po = alltrim(str(w_po_value))
			ELSE
				w_xls_po = w_po_value
			ENDIF
			DO while (alltrim(w_xls_port ) <> alltrim(vTmpQtyBrk_1.Port) and  !empty(w_xls_port ) )  or ;
			         	(alltrim(w_xls_po)<> alltrim(vTmpQtyBrk_1.Po_no) and   !empty(w_xls_po))
				w_port_col = w_port_col + 2
				if w_port_col > w_max_port
					w_max_port = w_max_port + 2
				endif   
	
				w_temp_var1 = eole.cells(w_port_row-w_add_row, w_port_col).value

				w_port_value = eole.cells(w_port_row-w_add_row, w_port_col).value
				IF vartype(w_port_value) = "N"
					w_xls_port = alltrim(str(w_port_value))
				ELSE
					w_xls_port = w_port_value
				ENDIF
				
				w_po_value = eole.cells(w_port_row-w_add_row+2, w_port_col).value
				IF vartype(w_po_value) = "N"
					w_xls_po = alltrim(str(w_po_value))
				ELSE
					w_xls_po = w_po_value
				ENDIF
			enddo
              		eole.ActiveSheet.Columns(w_port_col).ColumnWidth=12
			eole.cells(w_port_row-w_add_row-1, w_port_col).value =   "'"+vTmpQtyBrk_1.Port_grp
			eole.cells(w_port_row-w_add_row, w_port_col).value =   "'"+vTmpQtyBrk_1.Port
			eole.cells(w_port_row+1-w_add_row, w_port_col).value=vTmpQtyBrk_1.port_name
******************************************************************						
		
	              	eole.cells(w_port_row+2-w_add_row, w_port_col).value = "'"+vTmpQtyBrk_1.Po_no
	               IF w_add_row > 0
			    eole.cells(w_port_row+3-w_add_row, w_port_col).value = vTmpQtyBrk_1.ev_dest_code
			ENDIF
			eole.cells(w_port_row+3, w_port_col).value = "'"+dtoc(vTmpQtyBrk_1.Del_from)
			eole.cells(w_port_row+4, w_port_col).value = "'"+dtoc(vTmpQtyBrk_1.Del_to)
                   	eole.cells(w_port_row+5, w_port_col).value = "Qty"
			eole.cells(w_port_row+5, w_port_col+1).value = "Ctns"
                          item_row = 13
                          do while !(alltrim(vTmpQtyBrk_1.item_no) == alltrim(eole.cells(item_row,1).value)) and item_row <= w_row
                               item_row = item_row+1
                          enddo     
			eole.cells(item_row, w_port_col).value = vTmpQtyBrk_1.qty
	              	eole.cells(item_row,w_port_col+1).value=Round(vTmpQtyBrk_1.qty / w_pcs,0)  &&*
	                if !empty( eole.cells(item_row,6).value) and !empty(eole.cells(item_row,7).value) AND ;
	                   !isnull( eole.cells(item_row,6).value) and !isnull(eole.cells(item_row,7).value)  &&*
	                   
	                    w_qty=eole.cells(item_row,6).value
	                    w_ctn=eole.cells(item_row,7).value
	                    w_pcs = round(w_qty / w_ctn,0)
	                     eole.cells(item_row,w_port_col+1).value=Round(vTmpQtyBrk_1.qty / w_pcs,0)
	                 else  &&*
	                     eole.cells(item_row,w_port_col+1).value=Round(vTmpQtyBrk_1.qty / w_pcs,0) &&*
	                 endif     
                  	select vTmpQtyBrk_1
	              	Skip
		Enddo
		
		       do case
                             case w_port_col+1 >  52
                                     w_range="A"+alltrim(str(w_port_row-w_add_row))+":B"+chr(64+w_port_col+1-52)+alltrim(str(w_port_row+5-w_add_row))
                             case w_port_col+1 > 26
                                     w_range="A"+alltrim(str(w_port_row-w_add_row))+":A"+chr(64+w_port_col+1-26)+alltrim(str(w_port_row+5-w_add_row))
                             otherwise
                                    w_range="A"+alltrim(str(w_port_row-w_add_row))+":"+chr(64+w_port_col+1)+alltrim(str(w_port_row+5-w_add_row))
                        endcase      
		      eole.ActiveSheet.Range(w_range).Borders(2).LineStyle=1


                        do case
                            case  w_port_col + 1 >52  
                                     w_range="A"+alltrim(str(w_port_row-w_add_row))+":B"+chr(64+w_port_col+1-52)+alltrim(str(w_port_row-w_add_row))
                            case w_port_col + 1 > 26
 				     w_range="A"+alltrim(str(w_port_row-w_add_row))+":A"+chr(64+w_port_col+1-26)+alltrim(str(w_port_row-w_add_row))
			    otherwise
			            w_range="A"+alltrim(str(w_port_row-w_add_row))+":"+chr(64+w_port_col+1)+alltrim(str(w_port_row-w_add_row)) 
		       endcase   
                       eole.ActiveSheet.Range(w_range).Borders(3).LineStyle=1
		
		
	         do case
	              case  w_port_col + 1 >52
	             *        w_range="F"+alltrim(str(w_port_row+5-w_add_row))+":B"+chr(64+w_port_col+1-52)+alltrim(str(w_port_row+5-w_add_row))
	                       w_range="H13:"+"B"+chr(64+w_port_col+1-52)+alltrim(str(w_row))
	              case  w_port_col + 1 >26
                                w_range="H13:"+"A"+chr(64+w_port_col+1-26)+alltrim(str(w_row))
		     otherwise
                                w_range = "H13:"+chr(64+w_port_col+1)+alltrim(str(w_row))
	        endcase       
	         eole.ActiveSheet.Range(w_range).Borders(1).LineStyle=1
                 eole.ActiveSheet.Range(w_range).Borders(2).LineStyle=1
                 eole.ActiveSheet.Range(w_range).Borders(3).LineStyle=1
                  eole.ActiveSheet.Range(w_range).Borders(4).LineStyle=1